#!/usr/bin/env node

/**
 * Merge Strategies - Smart merge logic for UPDATE mode
 */

import { FIELD_CATEGORIES } from './config.mjs'

/**
 * Check if field path matches a category pattern
 * @param {string} fieldPath - Dot-notation path
 * @param {string[]} patterns - Array of patterns to match
 * @returns {boolean}
 */
function matchesPattern(fieldPath, patterns) {
  return patterns.some(pattern => {
    // Exact match
    if (fieldPath === pattern) return true

    // Prefix match (e.g., 'communityUrls.discord' matches 'communityUrls')
    if (fieldPath.startsWith(`${pattern}.`)) return true

    // Array index match (e.g., 'pricing[0].value' matches 'pricing')
    if (fieldPath.startsWith(`${pattern}[`)) return true

    return false
  })
}

/**
 * Get field category
 * @param {string} fieldPath
 * @returns {string} - 'auto_update', 'preserve', 'merge_additive', 'conditional', or 'default'
 */
export function getFieldCategory(fieldPath) {
  if (matchesPattern(fieldPath, FIELD_CATEGORIES.AUTO_UPDATE)) {
    return 'auto_update'
  }
  if (matchesPattern(fieldPath, FIELD_CATEGORIES.PRESERVE)) {
    return 'preserve'
  }
  if (matchesPattern(fieldPath, FIELD_CATEGORIES.MERGE_ADDITIVE)) {
    return 'merge_additive'
  }
  if (matchesPattern(fieldPath, FIELD_CATEGORIES.CONDITIONAL)) {
    return 'conditional'
  }
  return 'default'
}

/**
 * Deep merge two objects
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function _deepMerge(target, source) {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = _deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * Merge arrays with unique items
 * @param {array} existing
 * @param {array} discovered
 * @param {string} uniqueKey - Key to use for uniqueness check
 * @returns {array}
 */
function mergeArrays(existing, discovered, uniqueKey = null) {
  if (!Array.isArray(existing)) return discovered
  if (!Array.isArray(discovered)) return existing

  if (!uniqueKey) {
    // Simple array - merge unique primitives
    const combined = [...existing]
    discovered.forEach(item => {
      if (!combined.includes(item)) {
        combined.push(item)
      }
    })
    return combined
  }

  // Object array - merge by unique key
  const combined = [...existing]
  const existingKeys = new Set(existing.map(item => item[uniqueKey]))

  discovered.forEach(item => {
    if (!existingKeys.has(item[uniqueKey])) {
      combined.push(item)
    }
  })

  return combined
}

/**
 * Smart merge two manifests
 * @param {object} existing - Existing manifest
 * @param {object} discovered - Newly discovered data
 * @returns {object} - Merged manifest with metadata
 */
export function smartMerge(existing, discovered) {
  const _merged = { ...existing }
  const changes = {
    updated: [],
    added: [],
    preserved: [],
    needsReview: [],
  }

  /**
   * Process field and track changes
   */
  function processField(fieldPath, existingValue, newValue) {
    const category = getFieldCategory(fieldPath)

    switch (category) {
      case 'auto_update':
        if (existingValue !== newValue && newValue !== null && newValue !== undefined) {
          changes.updated.push({
            field: fieldPath,
            old: existingValue,
            new: newValue,
            reason: 'AUTO_UPDATE - from official source',
          })
          return newValue
        }
        return existingValue

      case 'preserve':
        changes.preserved.push(fieldPath)
        return existingValue

      case 'merge_additive':
        if (Array.isArray(existingValue) && Array.isArray(newValue)) {
          // Determine unique key for object arrays
          let uniqueKey = null
          if (newValue.length > 0 && typeof newValue[0] === 'object') {
            // Common unique keys
            if ('id' in newValue[0]) uniqueKey = 'id'
            else if ('ideId' in newValue[0]) uniqueKey = 'ideId'
            else if ('os' in newValue[0]) uniqueKey = 'os'
            else if ('name' in newValue[0]) uniqueKey = 'name'
          }

          const mergedArray = mergeArrays(existingValue, newValue, uniqueKey)

          if (mergedArray.length > existingValue.length) {
            changes.added.push({
              field: fieldPath,
              count: mergedArray.length - existingValue.length,
              reason: 'MERGE_ADDITIVE - added new items',
            })
          }

          return mergedArray
        } else if (typeof existingValue === 'object' && typeof newValue === 'object') {
          // Merge objects (e.g., communityUrls)
          const merged = { ...existingValue }
          for (const key in newValue) {
            if (!(key in existingValue) && newValue[key] !== null) {
              merged[key] = newValue[key]
              changes.added.push({
                field: `${fieldPath}.${key}`,
                value: newValue[key],
                reason: 'MERGE_ADDITIVE - newly discovered',
              })
            }
          }
          return merged
        }
        return existingValue

      case 'conditional':
        if (existingValue !== newValue && newValue !== null && newValue !== undefined) {
          changes.needsReview.push({
            field: fieldPath,
            existing: existingValue,
            discovered: newValue,
            reason: 'CONDITIONAL - verify from authoritative source',
            recommendation: `Check official documentation for ${fieldPath}`,
          })
        }
        return existingValue // Keep existing until reviewed

      default:
        // Default: prefer discovered over null/undefined
        if (
          (existingValue === null || existingValue === undefined) &&
          newValue !== null &&
          newValue !== undefined
        ) {
          changes.added.push({
            field: fieldPath,
            value: newValue,
            reason: 'DEFAULT - filled missing field',
          })
          return newValue
        }
        return existingValue
    }
  }

  /**
   * Recursively merge objects
   */
  function mergeObject(path, existingObj, discoveredObj) {
    const result = { ...existingObj }

    for (const key in discoveredObj) {
      const fieldPath = path ? `${path}.${key}` : key
      const existingValue = existingObj[key]
      const newValue = discoveredObj[key]

      if (typeof newValue === 'object' && !Array.isArray(newValue) && newValue !== null) {
        // Recurse into nested objects
        result[key] = mergeObject(fieldPath, existingValue || {}, newValue)
      } else {
        // Process leaf values
        result[key] = processField(fieldPath, existingValue, newValue)
      }
    }

    return result
  }

  // Perform merge
  const mergedData = mergeObject('', existing, discovered)

  return {
    manifest: mergedData,
    changes,
  }
}

/**
 * Generate change report
 * @param {object} changes - Changes from smartMerge
 * @param {string} mode - 'UPDATE' or 'CREATE'
 * @param {string} manifestPath - Path to manifest file
 * @returns {string}
 */
export function generateChangeReport(changes, mode, manifestPath) {
  const summary = {
    fieldsUpdated: changes.updated.length,
    fieldsAdded: changes.added.length,
    fieldsPreserved: changes.preserved.length,
    needsReview: changes.needsReview.length,
  }

  let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  output += '📊 Smart Merge Report\n'
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
  output += `Mode: ${mode}\n`
  output += `Manifest: ${manifestPath}\n\n`

  output += 'Summary:\n'
  output += `  Updated: ${summary.fieldsUpdated} field${summary.fieldsUpdated !== 1 ? 's' : ''}\n`
  output += `  Added: ${summary.fieldsAdded} field${summary.fieldsAdded !== 1 ? 's' : ''}\n`
  output += `  Preserved: ${summary.fieldsPreserved} field${summary.fieldsPreserved !== 1 ? 's' : ''}\n`
  if (summary.needsReview > 0) {
    output += `  Needs Review: ${summary.needsReview} field${summary.needsReview !== 1 ? 's' : ''}\n`
  }

  if (changes.updated.length > 0) {
    output += '\n✏️  Updated Fields:\n'
    changes.updated.forEach((change, index) => {
      output += `   ${index + 1}. ${change.field}\n`
      output += `      Old: ${JSON.stringify(change.old)}\n`
      output += `      New: ${JSON.stringify(change.new)}\n`
      output += `      Reason: ${change.reason}\n`
    })
  }

  if (changes.added.length > 0) {
    output += '\n➕ Added Fields:\n'
    changes.added.forEach((change, index) => {
      output += `   ${index + 1}. ${change.field}\n`
      if (change.value !== undefined) {
        output += `      Value: ${JSON.stringify(change.value)}\n`
      }
      if (change.count !== undefined) {
        output += `      Count: ${change.count} new item${change.count !== 1 ? 's' : ''}\n`
      }
      output += `      Reason: ${change.reason}\n`
    })
  }

  if (changes.needsReview.length > 0) {
    output += '\n⚠️  Needs Review:\n'
    changes.needsReview.forEach((change, index) => {
      output += `   ${index + 1}. ${change.field}\n`
      output += `      Existing: ${JSON.stringify(change.existing)}\n`
      output += `      Discovered: ${JSON.stringify(change.discovered)}\n`
      output += `      Reason: ${change.reason}\n`
      output += `      Recommendation: ${change.recommendation}\n`
    })
  }

  output += '\n📝 Next Steps:\n'
  output += `1. Review merged manifest: ${manifestPath}\n`
  if (summary.needsReview > 0) {
    output += '2. Resolve fields marked "Needs Review"\n'
    output += '3. Run validation: npm run test:validate\n'
  } else {
    output += '2. Run validation: npm run test:validate\n'
  }

  return output
}
