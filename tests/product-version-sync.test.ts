import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  fetchTrackedVersion,
  syncProductVersions,
  type VersionFetch,
} from '../scripts/fetch/lib/product-version-sync'

const temporaryDirectories: string[] = []

function jsonFetch(payload: unknown): VersionFetch {
  return async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async json() {
      return payload
    },
  })
}

async function createManifestRoot(manifests: Record<string, unknown>[]): Promise<string> {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'product-version-sync-'))
  temporaryDirectories.push(rootDir)
  for (const category of ['ides', 'clis', 'desktops', 'extensions']) {
    await fs.mkdir(path.join(rootDir, 'manifests', category), { recursive: true })
  }
  for (const manifest of manifests) {
    await fs.writeFile(
      path.join(rootDir, 'manifests', 'clis', `${String(manifest.id)}.json`),
      `${JSON.stringify(manifest, null, 2)}\n`
    )
  }
  return rootDir
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => fs.rm(directory, { force: true, recursive: true }))
  )
})

describe('product version sources', () => {
  it('reads npm dist-tags', async () => {
    const observation = await fetchTrackedVersion(
      { provider: 'npm', identifier: '@example/tool', channel: 'latest' },
      jsonFetch({ 'dist-tags': { latest: '2.3.4' } })
    )

    expect(observation).toEqual({
      version: '2.3.4',
      sourceUrl: 'https://www.npmjs.com/package/@example/tool',
    })
  })

  it('reads Homebrew formula and cask versions', async () => {
    const formula = await fetchTrackedVersion(
      { provider: 'homebrew-formula', identifier: 'example' },
      jsonFetch({ versions: { stable: '3.2.1' } })
    )
    const cask = await fetchTrackedVersion(
      { provider: 'homebrew-cask', identifier: 'example-app' },
      jsonFetch({ version: '4.5.6' })
    )

    expect(formula.version).toBe('3.2.1')
    expect(cask.version).toBe('4.5.6')
  })

  it('reads crates.io and GitHub stable release versions', async () => {
    const crate = await fetchTrackedVersion(
      { provider: 'crates-io', identifier: 'example' },
      jsonFetch({ crate: { max_stable_version: '1.9.0', max_version: '2.0.0-beta.1' } })
    )
    const release = await fetchTrackedVersion(
      { provider: 'github-release', identifier: 'example/tool' },
      jsonFetch({
        tag_name: 'v5.0.0',
        html_url: 'https://github.com/example/tool/releases/tag/v5.0.0',
      })
    )

    expect(crate.version).toBe('1.9.0')
    expect(release).toEqual({
      version: 'v5.0.0',
      sourceUrl: 'https://github.com/example/tool/releases/tag/v5.0.0',
    })
  })

  it('reads PyPI and Visual Studio Marketplace versions', async () => {
    const pypi = await fetchTrackedVersion(
      { provider: 'pypi', identifier: 'example-tool' },
      jsonFetch({ info: { version: '1.4.0' } })
    )
    let marketplaceRequest:
      | {
          input: string
          method?: string
          body?: string
        }
      | undefined
    const marketplaceFetch: VersionFetch = async (input, init) => {
      marketplaceRequest = {
        input: String(input),
        method: init?.method,
        body: init?.body,
      }
      return jsonFetch({
        results: [
          {
            extensions: [{ versions: [{ version: '2.7.1' }] }],
          },
        ],
      })(input, init)
    }
    const marketplace = await fetchTrackedVersion(
      { provider: 'vscode-marketplace', identifier: 'publisher.extension' },
      marketplaceFetch
    )

    expect(pypi).toEqual({
      version: '1.4.0',
      sourceUrl: 'https://pypi.org/project/example-tool/',
    })
    expect(marketplace.version).toBe('2.7.1')
    expect(marketplaceRequest?.method).toBe('POST')
    expect(JSON.parse(marketplaceRequest?.body ?? '{}')).toMatchObject({
      filters: [{ criteria: [{ filterType: 7, value: 'publisher.extension' }] }],
    })
  })
})

describe('product version synchronization', () => {
  it('writes only latestVersion after every configured source succeeds', async () => {
    const rootDir = await createManifestRoot([
      {
        id: 'example',
        latestVersion: '1.0.0',
        releaseTracking: { provider: 'npm', identifier: 'example' },
        lastVerifiedAt: '2026-01-01',
        description: 'Preserve this value.',
      },
    ])
    const filePath = path.join(rootDir, 'manifests', 'clis', 'example.json')
    const sourceBeforeSync = await fs.readFile(filePath, 'utf8')

    const result = await syncProductVersions({
      rootDir,
      write: true,
      fetchImpl: jsonFetch({ 'dist-tags': { latest: '1.1.0' } }),
    })
    const sourceAfterSync = await fs.readFile(filePath, 'utf8')
    const manifest = JSON.parse(sourceAfterSync) as Record<string, unknown>

    expect(result.changes).toHaveLength(1)
    expect(manifest.latestVersion).toBe('1.1.0')
    expect(manifest.lastVerifiedAt).toBe('2026-01-01')
    expect(manifest.description).toBe('Preserve this value.')
    expect(sourceAfterSync).toBe(
      sourceBeforeSync.replace('"latestVersion": "1.0.0"', '"latestVersion": "1.1.0"')
    )
  })

  it('does not write partial changes when a source fails', async () => {
    const rootDir = await createManifestRoot([
      {
        id: 'first',
        latestVersion: '1.0.0',
        releaseTracking: { provider: 'npm', identifier: 'first' },
      },
      {
        id: 'second',
        latestVersion: '1.0.0',
        releaseTracking: { provider: 'npm', identifier: 'second' },
      },
    ])
    const fetchImpl: VersionFetch = async input => {
      if (String(input).endsWith('second')) {
        return {
          ok: false,
          status: 503,
          statusText: 'Unavailable',
          async json() {
            return {}
          },
        }
      }
      return jsonFetch({ 'dist-tags': { latest: '1.1.0' } })(input)
    }

    await expect(syncProductVersions({ rootDir, write: true, fetchImpl })).rejects.toThrow(
      'failed without writing changes'
    )
    const first = JSON.parse(
      await fs.readFile(path.join(rootDir, 'manifests', 'clis', 'first.json'), 'utf8')
    ) as Record<string, unknown>
    expect(first.latestVersion).toBe('1.0.0')
  })

  it('rejects npm version downgrades', async () => {
    const rootDir = await createManifestRoot([
      {
        id: 'example',
        latestVersion: '2.0.0',
        releaseTracking: { provider: 'npm', identifier: 'example' },
      },
    ])

    await expect(
      syncProductVersions({
        rootDir,
        write: true,
        fetchImpl: jsonFetch({ 'dist-tags': { latest: '1.9.0' } }),
      })
    ).rejects.toThrow('older than recorded version')
  })
})
