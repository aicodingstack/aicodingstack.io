/**
 * Formatting utility functions
 */

/**
 * Format a large number with K/M suffix for display
 * Examples:
 * - 32000 -> "32K"
 * - 128000 -> "128K"
 * - 200000 -> "200K"
 * - 1000000 -> "1M"
 * - 4096 -> "4K"
 * @param value - The number to format
 * @returns Formatted string with K/M suffix
 */
export function formatTokenCount(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`.replace(/\.0$/, '')
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`.replace(/\.0$/, '')
  }
  return value.toString()
}
