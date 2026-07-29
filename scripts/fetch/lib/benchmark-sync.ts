import fs from 'node:fs/promises'
import path from 'node:path'

import type { ManifestBenchmarkTracking } from '../../../src/types/manifests'

const SWE_BENCH_SOURCE_URL =
  'https://raw.githubusercontent.com/SWE-bench/swe-bench.github.io/master/data/leaderboards.json'

interface ModelManifest {
  id: string
  benchmarks: Record<string, number | null>
  benchmarkTracking?: ManifestBenchmarkTracking[]
}

interface JsonResponse {
  ok: boolean
  status: number
  statusText: string
  json(): Promise<unknown>
}

export type BenchmarkFetch = (input: string | URL) => Promise<JsonResponse>

interface SweBenchResult {
  folder: string
  name: string
  resolved: number
}

interface SweBenchLeaderboard {
  name: string
  results: SweBenchResult[]
}

export interface BenchmarkChange {
  modelId: string
  filePath: string
  benchmark: ManifestBenchmarkTracking['benchmark']
  previousScore: number | null
  nextScore: number
  modelLabel: string
  sourceUrl: string
}

export interface BenchmarkSyncResult {
  checked: number
  changes: BenchmarkChange[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseSweBenchLeaderboards(value: unknown): SweBenchLeaderboard[] {
  if (!isRecord(value) || !Array.isArray(value.leaderboards)) {
    throw new Error('SWE-bench returned no leaderboards array')
  }

  return value.leaderboards.map((leaderboard, leaderboardIndex) => {
    if (!isRecord(leaderboard) || typeof leaderboard.name !== 'string') {
      throw new Error(`SWE-bench leaderboard ${leaderboardIndex} has no usable name`)
    }
    if (!Array.isArray(leaderboard.results)) {
      throw new Error(`SWE-bench leaderboard ${leaderboard.name} has no results array`)
    }

    return {
      name: leaderboard.name,
      results: leaderboard.results.map((result, resultIndex) => {
        if (
          !isRecord(result) ||
          typeof result.folder !== 'string' ||
          typeof result.name !== 'string' ||
          typeof result.resolved !== 'number'
        ) {
          throw new Error(
            `SWE-bench ${leaderboard.name} result ${resultIndex} is missing folder, name, or resolved`
          )
        }
        return {
          folder: result.folder,
          name: result.name,
          resolved: result.resolved,
        }
      }),
    }
  })
}

async function fetchSweBenchLeaderboards(
  fetchImpl: BenchmarkFetch
): Promise<SweBenchLeaderboard[]> {
  const response = await fetchImpl(SWE_BENCH_SOURCE_URL)
  if (!response.ok) {
    throw new Error(`${SWE_BENCH_SOURCE_URL} returned ${response.status} ${response.statusText}`)
  }
  return parseSweBenchLeaderboards(await response.json())
}

async function loadTrackedModels(rootDir: string): Promise<
  Array<{
    filePath: string
    manifest: ModelManifest
  }>
> {
  const directory = path.join(rootDir, 'manifests', 'models')
  const models = []
  for (const fileName of (await fs.readdir(directory))
    .filter(file => file.endsWith('.json'))
    .sort()) {
    const filePath = path.join(directory, fileName)
    const manifest = JSON.parse(await fs.readFile(filePath, 'utf8')) as ModelManifest
    if (manifest.benchmarkTracking?.length) {
      models.push({ filePath, manifest })
    }
  }
  return models
}

export async function syncBenchmarks(options: {
  rootDir: string
  write: boolean
  fetchImpl?: BenchmarkFetch
}): Promise<BenchmarkSyncResult> {
  const trackedModels = await loadTrackedModels(options.rootDir)
  const trackingEntries = trackedModels.flatMap(entry =>
    (entry.manifest.benchmarkTracking ?? []).map(tracking => ({ entry, tracking }))
  )
  const fetchImpl = options.fetchImpl ?? (fetch as BenchmarkFetch)
  const leaderboards = trackingEntries.length ? await fetchSweBenchLeaderboards(fetchImpl) : []

  const changes: BenchmarkChange[] = []
  for (const { entry, tracking } of trackingEntries) {
    const leaderboard = leaderboards.find(item => item.name === tracking.leaderboard)
    if (!leaderboard) {
      throw new Error(
        `models/${entry.manifest.id}: SWE-bench leaderboard ${tracking.leaderboard} was not found`
      )
    }
    const matches = leaderboard.results.filter(result => result.folder === tracking.resultId)
    if (matches.length !== 1) {
      throw new Error(
        `models/${entry.manifest.id}: expected exactly one SWE-bench result ${tracking.resultId}, found ${matches.length}`
      )
    }
    const result = matches[0]
    if (!result) {
      throw new Error(`models/${entry.manifest.id}: SWE-bench result disappeared after validation`)
    }
    if (result.name !== tracking.modelLabel) {
      throw new Error(
        `models/${entry.manifest.id}: SWE-bench label changed from "${tracking.modelLabel}" to "${result.name}"`
      )
    }

    const previousScore = entry.manifest.benchmarks[tracking.benchmark]
    if (typeof previousScore !== 'number' && previousScore !== null) {
      throw new Error(`models/${entry.manifest.id}: ${tracking.benchmark} must be a number or null`)
    }
    if (previousScore === result.resolved) continue
    changes.push({
      modelId: entry.manifest.id,
      filePath: entry.filePath,
      benchmark: tracking.benchmark,
      previousScore,
      nextScore: result.resolved,
      modelLabel: result.name,
      sourceUrl: SWE_BENCH_SOURCE_URL,
    })
  }

  if (options.write) {
    const changesByFile = Map.groupBy(changes, change => change.filePath)
    for (const [filePath, fileChanges] of changesByFile) {
      let source = await fs.readFile(filePath, 'utf8')
      for (const change of fileChanges) {
        const previousValue = escapeRegularExpression(JSON.stringify(change.previousScore))
        const pattern = new RegExp(
          `("${escapeRegularExpression(change.benchmark)}"\\s*:\\s*)${previousValue}`,
          'g'
        )
        const matches = [...source.matchAll(pattern)]
        if (matches.length !== 1) {
          throw new Error(
            `models/${change.modelId} must contain exactly one matching ${change.benchmark} field`
          )
        }
        source = source.replace(pattern, `$1${JSON.stringify(change.nextScore)}`)
      }
      await fs.writeFile(filePath, source, 'utf8')
    }
  }

  return { checked: trackingEntries.length, changes }
}
