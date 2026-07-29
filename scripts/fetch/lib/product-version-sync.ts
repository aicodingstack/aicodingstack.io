import fs from 'node:fs/promises'
import path from 'node:path'

import type { ManifestReleaseTracking } from '../../../src/types/manifests'

const PRODUCT_CATEGORIES = ['ides', 'clis', 'desktops', 'extensions'] as const

interface ProductManifest {
  id: string
  latestVersion: string
  releaseTracking?: ManifestReleaseTracking
  [key: string]: unknown
}

interface JsonResponse {
  ok: boolean
  status: number
  statusText: string
  json(): Promise<unknown>
}

export type VersionFetch = (
  input: string | URL,
  init?: {
    method?: string
    headers?: Record<string, string>
    body?: string
  }
) => Promise<JsonResponse>

export interface VersionObservation {
  version: string
  sourceUrl: string
}

export interface VersionChange {
  category: (typeof PRODUCT_CATEGORIES)[number]
  id: string
  filePath: string
  previousVersion: string
  nextVersion: string
  sourceUrl: string
}

export interface VersionSyncResult {
  checked: number
  changes: VersionChange[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getRequiredString(
  value: unknown,
  field: string,
  provider: ManifestReleaseTracking['provider']
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${provider} returned no usable ${field}`)
  }
  return value.trim()
}

async function fetchJson(
  fetchImpl: VersionFetch,
  url: string,
  init: {
    method?: string
    headers?: Record<string, string>
    body?: string
  } = {}
): Promise<unknown> {
  const response = await fetchImpl(url, init)
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'aicodingstack-version-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return headers
}

export async function fetchTrackedVersion(
  tracking: ManifestReleaseTracking,
  fetchImpl: VersionFetch = fetch as VersionFetch
): Promise<VersionObservation> {
  switch (tracking.provider) {
    case 'npm': {
      const url = `https://registry.npmjs.org/${encodeURIComponent(tracking.identifier)}`
      const data = await fetchJson(fetchImpl, url)
      const distTags = isRecord(data) && isRecord(data['dist-tags']) ? data['dist-tags'] : null
      const channel = tracking.channel ?? 'latest'
      return {
        version: getRequiredString(distTags?.[channel], `dist-tags.${channel}`, tracking.provider),
        sourceUrl: `https://www.npmjs.com/package/${tracking.identifier}`,
      }
    }
    case 'homebrew-formula': {
      const url = `https://formulae.brew.sh/api/formula/${encodeURIComponent(tracking.identifier)}.json`
      const data = await fetchJson(fetchImpl, url)
      const versions = isRecord(data) && isRecord(data.versions) ? data.versions : null
      return {
        version: getRequiredString(versions?.stable, 'versions.stable', tracking.provider),
        sourceUrl: `https://formulae.brew.sh/formula/${tracking.identifier}`,
      }
    }
    case 'homebrew-cask': {
      const url = `https://formulae.brew.sh/api/cask/${encodeURIComponent(tracking.identifier)}.json`
      const data = await fetchJson(fetchImpl, url)
      return {
        version: getRequiredString(
          isRecord(data) ? data.version : null,
          'version',
          tracking.provider
        ),
        sourceUrl: `https://formulae.brew.sh/cask/${tracking.identifier}`,
      }
    }
    case 'crates-io': {
      const url = `https://crates.io/api/v1/crates/${encodeURIComponent(tracking.identifier)}`
      const data = await fetchJson(fetchImpl, url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'aicodingstack-version-sync',
        },
      })
      const crate = isRecord(data) && isRecord(data.crate) ? data.crate : null
      const stableVersion = crate?.max_stable_version ?? crate?.max_version
      return {
        version: getRequiredString(stableVersion, 'max_stable_version', tracking.provider),
        sourceUrl: `https://crates.io/crates/${tracking.identifier}`,
      }
    }
    case 'pypi': {
      const url = `https://pypi.org/pypi/${encodeURIComponent(tracking.identifier)}/json`
      const data = await fetchJson(fetchImpl, url)
      const info = isRecord(data) && isRecord(data.info) ? data.info : null
      return {
        version: getRequiredString(info?.version, 'info.version', tracking.provider),
        sourceUrl: `https://pypi.org/project/${tracking.identifier}/`,
      }
    }
    case 'vscode-marketplace': {
      const url =
        'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.2-preview.1'
      const data = await fetchJson(fetchImpl, url, {
        method: 'POST',
        headers: {
          Accept: 'application/json;api-version=7.2-preview.1',
          'Content-Type': 'application/json',
          'User-Agent': 'aicodingstack-version-sync',
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [{ filterType: 7, value: tracking.identifier }],
            },
          ],
          flags: 914,
        }),
      })
      const results = isRecord(data) && Array.isArray(data.results) ? data.results : []
      const firstResult = isRecord(results[0]) ? results[0] : null
      const extensions =
        firstResult && Array.isArray(firstResult.extensions) ? firstResult.extensions : []
      const firstExtension = isRecord(extensions[0]) ? extensions[0] : null
      const versions =
        firstExtension && Array.isArray(firstExtension.versions) ? firstExtension.versions : []
      const firstVersion = isRecord(versions[0]) ? versions[0] : null
      return {
        version: getRequiredString(firstVersion?.version, 'versions[0].version', tracking.provider),
        sourceUrl: `https://marketplace.visualstudio.com/items?itemName=${tracking.identifier}`,
      }
    }
    case 'github-release': {
      const url = `https://api.github.com/repos/${tracking.identifier}/releases/latest`
      const data = await fetchJson(fetchImpl, url, githubHeaders())
      return {
        version: getRequiredString(
          isRecord(data) ? data.tag_name : null,
          'tag_name',
          tracking.provider
        ),
        sourceUrl:
          isRecord(data) && typeof data.html_url === 'string'
            ? data.html_url
            : `https://github.com/${tracking.identifier}/releases/latest`,
      }
    }
  }
}

function parseStableNumericVersion(value: string): number[] | null {
  const normalized = value.trim().replace(/^v(?=\d)/, '')
  if (!/^\d+(?:\.\d+)*$/.test(normalized)) return null
  return normalized.split('.').map(segment => Number(segment))
}

function compareNumericVersions(left: number[], right: number[]): number {
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference
  }
  return 0
}

function formatObservedVersion(observed: string, current: string): string {
  const normalized = observed.trim()
  if (/^v\d/.test(current) && !/^v\d/.test(normalized)) return `v${normalized}`
  if (!/^v\d/.test(current) && /^v\d/.test(normalized)) return normalized.slice(1)
  return normalized
}

function assertNotDowngrade(
  current: string,
  observed: string,
  tracking: ManifestReleaseTracking
): void {
  if (!['npm', 'crates-io', 'pypi', 'vscode-marketplace'].includes(tracking.provider)) return
  const currentVersion = parseStableNumericVersion(current)
  const observedVersion = parseStableNumericVersion(observed)
  if (
    currentVersion &&
    observedVersion &&
    compareNumericVersions(observedVersion, currentVersion) < 0
  ) {
    throw new Error(
      `${tracking.provider} reported ${observed}, which is older than recorded version ${current}`
    )
  }
}

async function loadTrackedManifests(rootDir: string): Promise<
  Array<{
    category: (typeof PRODUCT_CATEGORIES)[number]
    filePath: string
    manifest: ProductManifest
  }>
> {
  const manifests: Array<{
    category: (typeof PRODUCT_CATEGORIES)[number]
    filePath: string
    manifest: ProductManifest
  }> = []

  for (const category of PRODUCT_CATEGORIES) {
    const directory = path.join(rootDir, 'manifests', category)
    const fileNames = (await fs.readdir(directory)).filter(file => file.endsWith('.json')).sort()
    for (const fileName of fileNames) {
      const filePath = path.join(directory, fileName)
      const manifest = JSON.parse(await fs.readFile(filePath, 'utf8')) as ProductManifest
      if (manifest.releaseTracking) {
        manifests.push({ category, filePath, manifest })
      }
    }
  }

  return manifests
}

export async function syncProductVersions(options: {
  rootDir: string
  write: boolean
  fetchImpl?: VersionFetch
}): Promise<VersionSyncResult> {
  const tracked = await loadTrackedManifests(options.rootDir)
  const observations = await Promise.allSettled(
    tracked.map(async entry => {
      const tracking = entry.manifest.releaseTracking
      if (!tracking) throw new Error(`${entry.manifest.id} has no releaseTracking configuration`)
      const observation = await fetchTrackedVersion(tracking, options.fetchImpl)
      const nextVersion = formatObservedVersion(observation.version, entry.manifest.latestVersion)
      assertNotDowngrade(entry.manifest.latestVersion, nextVersion, tracking)
      return { entry, observation, nextVersion }
    })
  )

  const failures = observations.flatMap((result, index) =>
    result.status === 'rejected'
      ? [`${tracked[index]?.category}/${tracked[index]?.manifest.id}: ${String(result.reason)}`]
      : []
  )
  if (failures.length > 0) {
    throw new Error(
      `Version synchronization failed without writing changes:\n${failures.join('\n')}`
    )
  }

  const changes: VersionChange[] = []
  for (const result of observations) {
    if (result.status !== 'fulfilled') continue
    const { entry, observation, nextVersion } = result.value
    if (nextVersion === entry.manifest.latestVersion) continue
    changes.push({
      category: entry.category,
      id: entry.manifest.id,
      filePath: entry.filePath,
      previousVersion: entry.manifest.latestVersion,
      nextVersion,
      sourceUrl: observation.sourceUrl,
    })
  }

  if (options.write) {
    for (const change of changes) {
      const source = await fs.readFile(change.filePath, 'utf8')
      const previousValue = escapeRegularExpression(JSON.stringify(change.previousVersion))
      const pattern = new RegExp(`("latestVersion"\\s*:\\s*)${previousValue}`, 'g')
      const matches = [...source.matchAll(pattern)]
      if (matches.length !== 1) {
        throw new Error(
          `${change.category}/${change.id} must contain exactly one matching latestVersion field`
        )
      }
      const updated = source.replace(pattern, `$1${JSON.stringify(change.nextVersion)}`)
      await fs.writeFile(change.filePath, updated, 'utf8')
    }
  }

  return { checked: tracked.length, changes }
}
