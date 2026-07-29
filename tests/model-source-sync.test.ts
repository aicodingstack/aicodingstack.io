import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  digestSourceContent,
  normalizeSourceContent,
  type SourceFetch,
  syncModelSourceDigests,
} from '../scripts/fetch/lib/model-source-sync'

const temporaryDirectories: string[] = []

function textFetch(content: string): SourceFetch {
  return async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async text() {
      return content
    },
  })
}

async function createModelRoot(model: Record<string, unknown>): Promise<string> {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'model-source-sync-'))
  temporaryDirectories.push(rootDir)
  await fs.mkdir(path.join(rootDir, 'manifests', 'models'), { recursive: true })
  await fs.writeFile(
    path.join(rootDir, 'manifests', 'models', `${String(model.id)}.json`),
    `${JSON.stringify(model, null, 2)}\n`
  )
  return rootDir
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => fs.rm(directory, { force: true, recursive: true }))
  )
})

describe('model source monitoring', () => {
  it('normalizes markup and ignores script content', () => {
    const first = '<main>Price: $2 &amp; active</main><script>build=1</script>'
    const second = '<main> Price: $2 &amp; active </main><script>build=2</script>'

    expect(normalizeSourceContent(first)).toBe('Price: $2 & active')
    expect(digestSourceContent(first)).toBe(digestSourceContent(second))
  })

  it('records only a source digest and observation date', async () => {
    const rootDir = await createModelRoot({
      id: 'example',
      lifecycle: 'latest',
      tokenPricing: { status: 'available' },
      sources: [
        {
          url: 'https://example.com/pricing',
          fields: ['tokenPricing', 'lifecycle'],
          changeTracking: {
            method: 'normalized-content-sha256',
            digest: null,
            observedAt: null,
          },
        },
      ],
    })
    const filePath = path.join(rootDir, 'manifests', 'models', 'example.json')

    const result = await syncModelSourceDigests({
      rootDir,
      write: true,
      observedAt: '2026-07-28',
      fetchImpl: textFetch(`<main>${'Official pricing and lifecycle. '.repeat(8)}</main>`),
    })
    const updated = JSON.parse(await fs.readFile(filePath, 'utf8')) as Record<string, unknown>
    const sources = updated.sources as Array<Record<string, unknown>>
    const tracking = sources[0]?.changeTracking as Record<string, unknown>

    expect(result.changes).toHaveLength(1)
    expect(updated.lifecycle).toBe('latest')
    expect(updated.tokenPricing).toEqual({ status: 'available' })
    expect(tracking.digest).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(tracking.observedAt).toBe('2026-07-28')
  })

  it('does not write any digest when a monitored source fails', async () => {
    const rootDir = await createModelRoot({
      id: 'example',
      sources: [
        {
          url: 'https://example.com/pricing',
          changeTracking: {
            method: 'normalized-content-sha256',
            digest: null,
            observedAt: null,
          },
        },
      ],
    })
    const filePath = path.join(rootDir, 'manifests', 'models', 'example.json')
    const before = await fs.readFile(filePath, 'utf8')
    const failingFetch: SourceFetch = async () => ({
      ok: false,
      status: 503,
      statusText: 'Unavailable',
      async text() {
        return ''
      },
    })

    await expect(
      syncModelSourceDigests({
        rootDir,
        write: true,
        observedAt: '2026-07-28',
        fetchImpl: failingFetch,
      })
    ).rejects.toThrow('failed without writing changes')
    expect(await fs.readFile(filePath, 'utf8')).toBe(before)
  })
})
