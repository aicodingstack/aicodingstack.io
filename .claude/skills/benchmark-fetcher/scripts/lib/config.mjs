/**
 * Configuration constants for benchmark-fetcher skill
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Project root (5 levels up from .claude/skills/benchmark-fetcher/scripts/lib/)
export const PROJECT_ROOT = path.resolve(__dirname, '../../../../..')

/**
 * Benchmark configurations
 * Each benchmark defines its website, target field in manifests, and data format
 */
export const BENCHMARKS = [
  {
    id: 'swebench',
    name: 'SWE-bench',
    url: 'https://www.swebench.com',
    field: 'sweBench',
    format: 'percentage',
    description: 'SWE-bench Verified score',
  },
  {
    id: 'terminalBench',
    name: 'TerminalBench',
    url: 'https://www.tbench.ai/leaderboard/terminal-bench/2.0',
    field: 'terminalBench',
    format: 'decimal', // CRITICAL: 0-1 scale, not percentage
    description: 'TerminalBench 2.0 accuracy score',
  },
  {
    id: 'mmmu',
    name: 'MMMU',
    url: 'https://mmmu-benchmark.github.io/#leaderboard',
    fields: ['mmmu', 'mmmuPro'], // Special case: two fields from one website
    format: 'percentage',
    description: 'MMMU and MMMU Pro benchmark scores',
  },
  {
    id: 'sciCode',
    name: 'SciCode',
    url: 'https://scicode-bench.github.io/leaderboard/',
    field: 'sciCode',
    format: 'percentage',
    description: 'SciCode benchmark score',
  },
  {
    id: 'liveCodeBench',
    name: 'LiveCodeBench',
    url: 'https://livecodebench.github.io/leaderboard.html',
    field: 'liveCodeBench',
    format: 'percentage',
    description: 'LiveCodeBench Pass@1 score',
  },
  {
    id: 'webDevArena',
    name: 'WebDevArena',
    url: 'https://web.lmarena.ai/leaderboard',
    field: 'webDevArena',
    format: 'percentage',
    description: 'WebDevArena score',
  },
]

/**
 * Retry configuration for benchmark extraction
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2, // Exponential backoff multiplier
}

/**
 * Timeout configuration for browser operations
 */
export const TIMEOUT_CONFIG = {
  navigation: 30000, // 30 seconds for page navigation
  waitFor: 10000, // 10 seconds for element to appear
  snapshot: 5000, // 5 seconds for taking snapshot
}

/**
 * File paths for manifests and configuration
 */
export const MANIFEST_PATHS = {
  modelsDir: path.join(PROJECT_ROOT, 'manifests/models'),
  schema: path.join(PROJECT_ROOT, 'manifests/$schemas/model.schema.json'),
  mappings: path.join(
    PROJECT_ROOT,
    '.claude/skills/benchmark-fetcher/references/model-name-mappings.json'
  ),
}

/**
 * Debug configuration
 */
export const DEBUG_CONFIG = {
  saveScreenshots: true,
  screenshotDir: '/tmp/benchmark-fetcher-debug',
  saveSnapshots: true,
  snapshotDir: '/tmp/benchmark-fetcher-snapshots',
}

/**
 * Benchmark field mapping for manifest updates
 * Maps benchmark IDs to manifest field names
 */
export const BENCHMARK_FIELD_MAP = {
  swebench: 'sweBench',
  terminalBench: 'terminalBench',
  sciCode: 'sciCode',
  liveCodeBench: 'liveCodeBench',
  webDevArena: 'webDevArena',
  // mmmu is handled specially (returns both mmmu and mmmuPro)
}

/**
 * Benchmark source URLs for reporting
 */
export const BENCHMARK_SOURCES = {
  swebench: 'swebench.com',
  terminalBench: 'tbench.ai',
  mmmu: 'mmmu-benchmark.github.io',
  sciCode: 'scicode-bench.github.io',
  liveCodeBench: 'livecodebench.github.io',
  webDevArena: 'web.lmarena.ai',
}
