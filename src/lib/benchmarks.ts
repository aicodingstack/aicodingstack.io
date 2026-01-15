/**
 * Benchmark utility functions for AI model performance metrics
 */

/**
 * Format benchmark value with appropriate precision and units
 * @param key - The benchmark key identifier
 * @param value - The numeric benchmark score
 * @returns Formatted string representation of the benchmark value
 */
export function formatBenchmarkValue(key: string, value: number): string {
  if (key === 'terminalBench') {
    // TerminalBench scores are typically between 0-1 (decimal format)
    // Display as percentage: 0.428 → 42.8%
    return value < 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(3)}`
  }
  // All other benchmarks display as percentage with 1 decimal place
  return `${value.toFixed(1)}%`
}

/**
 * Check if a benchmarks object has any non-null values
 * @param benchmarks - The benchmarks object to check
 * @returns True if at least one benchmark has a non-null value
 */
export function hasBenchmarks(benchmarks: object | null | undefined): boolean {
  if (!benchmarks) return false
  return Object.values(benchmarks).some(value => value !== null && value !== undefined)
}

/**
 * List of supported benchmark keys in display order
 */
export const BENCHMARK_KEYS = [
  'sweBench',
  'terminalBench',
  'mmmu',
  'mmmuPro',
  'webDevArena',
  'sciCode',
  'liveCodeBench',
] as const

/**
 * Type for benchmark keys
 */
export type BenchmarkKey = (typeof BENCHMARK_KEYS)[number]
