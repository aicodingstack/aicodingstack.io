import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { type BenchmarkFetch, syncBenchmarks } from '../scripts/fetch/lib/benchmark-sync'

const temporaryDirectories: string[] = []

function leaderboardFetch(results: unknown[]): BenchmarkFetch {
  return async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async json() {
      return {
        leaderboards: [{ name: 'Verified', results }],
      }
    },
  })
}

async function createModelRoot(model: Record<string, unknown>): Promise<string> {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'benchmark-sync-'))
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

describe('benchmark synchronization', () => {
  it('updates an exact SWE-bench result without reformatting the manifest', async () => {
    const rootDir = await createModelRoot({
      id: 'example',
      benchmarks: { sweBench: 40 },
      benchmarkTracking: [
        {
          provider: 'swe-bench',
          benchmark: 'sweBench',
          leaderboard: 'Verified',
          resultId: 'exact-result',
          modelLabel: 'Exact model and scaffold',
        },
      ],
      description: 'Preserve this value.',
    })
    const filePath = path.join(rootDir, 'manifests', 'models', 'example.json')
    const sourceBeforeSync = await fs.readFile(filePath, 'utf8')

    const result = await syncBenchmarks({
      rootDir,
      write: true,
      fetchImpl: leaderboardFetch([
        {
          folder: 'exact-result',
          name: 'Exact model and scaffold',
          resolved: 42.5,
        },
      ]),
    })
    const sourceAfterSync = await fs.readFile(filePath, 'utf8')

    expect(result.changes).toHaveLength(1)
    expect(sourceAfterSync).toBe(sourceBeforeSync.replace('"sweBench": 40', '"sweBench": 42.5'))
  })

  it('rejects a changed upstream label instead of fuzzy matching it', async () => {
    const rootDir = await createModelRoot({
      id: 'example',
      benchmarks: { sweBench: 40 },
      benchmarkTracking: [
        {
          provider: 'swe-bench',
          benchmark: 'sweBench',
          leaderboard: 'Verified',
          resultId: 'exact-result',
          modelLabel: 'Expected model',
        },
      ],
    })

    await expect(
      syncBenchmarks({
        rootDir,
        write: true,
        fetchImpl: leaderboardFetch([
          { folder: 'exact-result', name: 'Different model', resolved: 42.5 },
        ]),
      })
    ).rejects.toThrow('label changed')
  })

  it('does not write when an exact result is missing', async () => {
    const rootDir = await createModelRoot({
      id: 'example',
      benchmarks: { sweBench: 40 },
      benchmarkTracking: [
        {
          provider: 'swe-bench',
          benchmark: 'sweBench',
          leaderboard: 'Verified',
          resultId: 'exact-result',
          modelLabel: 'Expected model',
        },
      ],
    })
    const filePath = path.join(rootDir, 'manifests', 'models', 'example.json')
    const sourceBeforeSync = await fs.readFile(filePath, 'utf8')

    await expect(
      syncBenchmarks({
        rootDir,
        write: true,
        fetchImpl: leaderboardFetch([]),
      })
    ).rejects.toThrow('expected exactly one SWE-bench result')
    expect(await fs.readFile(filePath, 'utf8')).toBe(sourceBeforeSync)
  })
})
