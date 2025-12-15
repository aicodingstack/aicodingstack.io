/**
 * Manifest updater utilities
 * Updates model manifests with latest benchmark data using atomic file writes
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { BENCHMARK_FIELD_MAP, BENCHMARK_SOURCES } from './config.mjs'

/**
 * Update all model manifests with benchmark results
 * Always overwrites existing benchmark values with latest data
 *
 * @param {Object} manifests - Map of manifest IDs to manifest objects
 * @param {Object} benchmarkResults - Results from all benchmark extractions
 * @param {string} manifestsDir - Directory containing manifest files
 * @returns {Promise<Array>} Array of update results
 */
export async function updateManifests(manifests, benchmarkResults, manifestsDir) {
  const updates = []

  for (const [manifestId, manifest] of Object.entries(manifests)) {
    const changes = collectChanges(manifestId, manifest, benchmarkResults)

    if (changes.length === 0) {
      continue // No updates for this model
    }

    // Apply changes to manifest object
    for (const change of changes) {
      if (!manifest.benchmarks) {
        manifest.benchmarks = {}
      }
      manifest.benchmarks[change.field] = change.newValue
    }

    // Write manifest to file
    const manifestPath = path.join(manifestsDir, `${manifestId}.json`)
    try {
      await writeManifestSafely(manifestPath, manifest)
      updates.push({
        manifestId,
        changes,
        success: true,
      })
    } catch (error) {
      updates.push({
        manifestId,
        changes,
        success: false,
        error: error.message,
      })
    }
  }

  return updates
}

/**
 * Collect all benchmark changes for a single model
 *
 * @param {string} manifestId - Manifest identifier
 * @param {Object} manifest - Manifest object
 * @param {Object} benchmarkResults - Results from all benchmark extractions
 * @returns {Array} Array of change objects
 */
function collectChanges(manifestId, manifest, benchmarkResults) {
  const changes = []

  for (const [benchmarkId, result] of Object.entries(benchmarkResults)) {
    if (!result.success || !result.data) {
      continue // Skip failed extractions
    }

    // Handle MMMU special case (two fields from one extraction)
    if (benchmarkId === 'mmmu') {
      // Process mmmu field
      if (result.data.mmmu?.has(manifestId)) {
        const newValue = result.data.mmmu.get(manifestId)
        const oldValue = manifest.benchmarks?.mmmu ?? null

        if (newValue !== oldValue) {
          changes.push({
            field: 'mmmu',
            oldValue,
            newValue,
            source: BENCHMARK_SOURCES.mmmu,
          })
        }
      }

      // Process mmmuPro field
      if (result.data.mmmuPro?.has(manifestId)) {
        const newValue = result.data.mmmuPro.get(manifestId)
        const oldValue = manifest.benchmarks?.mmmuPro ?? null

        if (newValue !== oldValue) {
          changes.push({
            field: 'mmmuPro',
            oldValue,
            newValue,
            source: BENCHMARK_SOURCES.mmmu,
          })
        }
      }
    } else {
      // Standard benchmark (single value)
      const fieldName = BENCHMARK_FIELD_MAP[benchmarkId]

      if (!fieldName) {
        console.warn(`⚠️  No field mapping for benchmark: ${benchmarkId}`)
        continue
      }

      if (result.data.has(manifestId)) {
        const newValue = result.data.get(manifestId)
        const oldValue = manifest.benchmarks?.[fieldName] ?? null

        if (newValue !== oldValue) {
          changes.push({
            field: fieldName,
            oldValue,
            newValue,
            source: BENCHMARK_SOURCES[benchmarkId],
          })
        }
      }
    }
  }

  return changes
}

/**
 * Write manifest to file safely using atomic writes
 * Validates JSON structure, writes to temp file, then renames atomically
 *
 * @param {string} manifestPath - Path to manifest file
 * @param {Object} manifest - Manifest object to write
 * @returns {Promise<void>}
 */
async function writeManifestSafely(manifestPath, manifest) {
  // 1. Validate JSON structure
  validateManifestStructure(manifest)

  // 2. Convert to JSON with 2-space indentation
  const json = JSON.stringify(manifest, null, 2)

  // 3. Write to temporary file
  const tempPath = `${manifestPath}.tmp`
  await fs.writeFile(tempPath, `${json}\n`, 'utf8')

  // 4. Atomic rename
  await fs.rename(tempPath, manifestPath)
}

/**
 * Validate manifest structure before writing
 * Ensures required fields exist
 *
 * @param {Object} manifest - Manifest object to validate
 * @throws {Error} If manifest structure is invalid
 */
function validateManifestStructure(manifest) {
  if (!manifest.id) {
    throw new Error('Manifest missing required field: id')
  }

  if (!manifest.name) {
    throw new Error('Manifest missing required field: name')
  }

  if (manifest.benchmarks && typeof manifest.benchmarks !== 'object') {
    throw new Error('Manifest benchmarks field must be an object')
  }

  // Ensure benchmarks is an object, not an array
  if (Array.isArray(manifest.benchmarks)) {
    throw new Error('Manifest benchmarks field must be an object, not an array')
  }
}
