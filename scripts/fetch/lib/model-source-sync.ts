import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { ManifestSource } from '../../../src/types/manifests'

interface ModelManifest {
  id: string
  sources?: ManifestSource[]
}

interface TextResponse {
  ok: boolean
  status: number
  statusText: string
  text(): Promise<string>
}

export type SourceFetch = (
  input: string | URL,
  init?: { headers?: Record<string, string> }
) => Promise<TextResponse>

interface TrackedSource {
  modelId: string
  filePath: string
  source: ManifestSource & {
    changeTracking: NonNullable<ManifestSource['changeTracking']>
  }
}

export interface ModelSourceChange {
  modelId: string
  filePath: string
  url: string
  fields: string[]
  previousDigest: string | null
  nextDigest: string
  observedAt: string
}

export interface ModelSourceSyncResult {
  checked: number
  changes: ModelSourceChange[]
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function decodeCommonEntities(value: string): string {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

export function normalizeSourceContent(value: string): string {
  return decodeCommonEntities(
    value
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
}

export function digestSourceContent(value: string): string {
  return `sha256:${createHash('sha256').update(normalizeSourceContent(value)).digest('hex')}`
}

async function loadTrackedSources(rootDir: string): Promise<TrackedSource[]> {
  const directory = path.join(rootDir, 'manifests', 'models')
  const tracked: TrackedSource[] = []
  for (const fileName of (await fs.readdir(directory))
    .filter(file => file.endsWith('.json'))
    .sort()) {
    const filePath = path.join(directory, fileName)
    const manifest = JSON.parse(await fs.readFile(filePath, 'utf8')) as ModelManifest
    for (const source of manifest.sources ?? []) {
      if (source.changeTracking) {
        tracked.push({
          modelId: manifest.id,
          filePath,
          source: {
            ...source,
            changeTracking: source.changeTracking,
          },
        })
      }
    }
  }
  return tracked
}

async function fetchDigest(url: string, fetchImpl: SourceFetch): Promise<string> {
  const response = await fetchImpl(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'aicodingstack-model-source-monitor',
    },
  })
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status} ${response.statusText}`)
  }
  const content = await response.text()
  const normalized = normalizeSourceContent(content)
  if (normalized.length < 100) {
    throw new Error(`${url} returned too little usable content`)
  }
  return digestSourceContent(content)
}

function replaceTrackedSource(source: string, change: ModelSourceChange): string {
  const url = escapeRegularExpression(JSON.stringify(change.url))
  const previousDigest = escapeRegularExpression(JSON.stringify(change.previousDigest))
  const trackingPattern = new RegExp(
    `("url"\\s*:\\s*${url}[\\s\\S]*?"changeTracking"\\s*:\\s*\\{[\\s\\S]*?"digest"\\s*:\\s*)${previousDigest}([\\s\\S]*?"observedAt"\\s*:\\s*)(?:"[^"]*"|null)`,
    'g'
  )
  const matches = [...source.matchAll(trackingPattern)]
  if (matches.length !== 1) {
    throw new Error(
      `models/${change.modelId} must contain exactly one matching tracked source ${change.url}`
    )
  }
  return source.replace(
    trackingPattern,
    `$1${JSON.stringify(change.nextDigest)}$2${JSON.stringify(change.observedAt)}`
  )
}

export async function syncModelSourceDigests(options: {
  rootDir: string
  write: boolean
  observedAt: string
  fetchImpl?: SourceFetch
}): Promise<ModelSourceSyncResult> {
  const tracked = await loadTrackedSources(options.rootDir)
  const fetchImpl = options.fetchImpl ?? (fetch as SourceFetch)
  const digestByUrl = new Map<string, Promise<string>>()
  for (const entry of tracked) {
    if (!digestByUrl.has(entry.source.url)) {
      digestByUrl.set(entry.source.url, fetchDigest(entry.source.url, fetchImpl))
    }
  }

  const observations = await Promise.allSettled(
    tracked.map(async entry => ({
      entry,
      digest: await digestByUrl.get(entry.source.url),
    }))
  )
  const failures = observations.flatMap((result, index) =>
    result.status === 'rejected'
      ? [`models/${tracked[index]?.modelId}: ${String(result.reason)}`]
      : []
  )
  if (failures.length > 0) {
    throw new Error(
      `Model source monitoring failed without writing changes:\n${failures.join('\n')}`
    )
  }

  const changes: ModelSourceChange[] = []
  for (const result of observations) {
    if (result.status !== 'fulfilled') continue
    const { entry, digest } = result.value
    if (!digest || digest === entry.source.changeTracking.digest) continue
    changes.push({
      modelId: entry.modelId,
      filePath: entry.filePath,
      url: entry.source.url,
      fields: entry.source.fields ?? [],
      previousDigest: entry.source.changeTracking.digest,
      nextDigest: digest,
      observedAt: options.observedAt,
    })
  }

  if (options.write) {
    const changesByFile = Map.groupBy(changes, change => change.filePath)
    for (const [filePath, fileChanges] of changesByFile) {
      let source = await fs.readFile(filePath, 'utf8')
      for (const change of fileChanges) {
        source = replaceTrackedSource(source, change)
      }
      await fs.writeFile(filePath, source, 'utf8')
    }
  }

  return { checked: tracked.length, changes }
}
