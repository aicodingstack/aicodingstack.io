/**
 * Model name mapping utilities
 * Maps website-specific model names to manifest IDs using configurable mappings
 */

/**
 * Normalize model name for fuzzy matching
 * Removes spaces, hyphens, and special characters, converts to lowercase
 *
 * @param {string} name - Model name to normalize
 * @returns {string} Normalized model name
 */
function normalizeModelName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/-/g, '') // Remove hyphens
    .replace(/[^a-z0-9]/g, '') // Remove special characters
}

/**
 * Map website model name to manifest ID using 3-tier fallback strategy
 *
 * Strategy:
 * 1. Exact match (case-sensitive)
 * 2. Case-insensitive match
 * 3. Fuzzy match (normalized)
 *
 * @param {string} benchmarkId - Benchmark identifier (e.g., 'swebench')
 * @param {string} websiteName - Model name as shown on website
 * @param {Object} mappings - Mapping configuration object
 * @returns {string|null} Manifest ID or null if not found
 */
export function mapModelName(benchmarkId, websiteName, mappings) {
  const benchmarkMappings = mappings.mappings[benchmarkId]

  if (!benchmarkMappings) {
    console.warn(`⚠️  No mappings configured for benchmark: ${benchmarkId}`)
    return null
  }

  const websiteModels = benchmarkMappings.websiteModels

  // Strategy 1: Exact match (case-sensitive)
  if (websiteModels[websiteName]) {
    return websiteModels[websiteName]
  }

  // Strategy 2: Case-insensitive match
  const lowerName = websiteName.toLowerCase()
  for (const [key, value] of Object.entries(websiteModels)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }

  // Strategy 3: Fuzzy match (normalized)
  const normalizedName = normalizeModelName(websiteName)
  for (const [key, value] of Object.entries(websiteModels)) {
    if (normalizeModelName(key) === normalizedName) {
      return value
    }
  }

  // Not found - log for manual mapping
  console.warn(`⚠️  Unmapped model on ${benchmarkId}: "${websiteName}"`)
  return null
}

/**
 * Get all unmapped models from extraction results
 *
 * @param {Object} benchmarkResults - Results from all benchmark extractions
 * @param {Object} mappings - Mapping configuration object
 * @returns {Array} Array of unmapped models grouped by benchmark
 */
export function getUnmappedModels(benchmarkResults, _mappings) {
  const unmapped = []

  for (const [benchmarkId, result] of Object.entries(benchmarkResults)) {
    if (!result.success || !result.unmappedModels) {
      continue
    }

    if (result.unmappedModels.length > 0) {
      unmapped.push({
        benchmarkId,
        benchmarkName: getBenchmarkName(benchmarkId),
        models: result.unmappedModels,
      })
    }
  }

  return unmapped
}

/**
 * Get benchmark display name from ID
 *
 * @param {string} benchmarkId - Benchmark identifier
 * @returns {string} Benchmark display name
 */
function getBenchmarkName(benchmarkId) {
  const names = {
    swebench: 'SWE-bench',
    terminalBench: 'TerminalBench',
    mmmu: 'MMMU',
    sciCode: 'SciCode',
    liveCodeBench: 'LiveCodeBench',
    webDevArena: 'WebDevArena',
  }
  return names[benchmarkId] || benchmarkId
}

/**
 * Track unmapped models during extraction
 * Call this when a model name cannot be mapped
 *
 * @param {Set} unmappedSet - Set to track unmapped model names
 * @param {string} websiteName - Model name that couldn't be mapped
 */
export function trackUnmapped(unmappedSet, websiteName) {
  unmappedSet.add(websiteName)
}
