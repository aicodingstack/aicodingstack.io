#!/usr/bin/env node
/**
 * Script to analyze duplicate keys and values in translation files
 * Scans all JSON files in translations/en/ directory and reports:
 * - Duplicate keys (same key path in multiple files)
 * - Duplicate values (same value used for different keys)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const TRANSLATIONS_DIR = path.join(ROOT_DIR, 'translations', 'en')

/**
 * Flatten a nested object into dot-notation keys
 * @param {object} obj - The object to flatten
 * @param {string} prefix - The prefix for keys
 * @returns {object} - Flattened object with dot-notation keys
 */
function flattenObject(obj, prefix = '') {
  const flattened = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey))
    } else {
      // Store the value
      flattened[newKey] = value
    }
  }

  return flattened
}

/**
 * Read and parse a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON object or null if error
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`Warning: Failed to read ${filePath}: ${error.message}`)
    return null
  }
}

/**
 * Get all JSON files recursively from a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Array<{filePath: string, relativePath: string}>} - Array of file info
 */
function getAllJsonFiles(dir, baseDir = dir) {
  const files = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      files.push(...getAllJsonFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push({
        filePath: fullPath,
        relativePath: relativePath,
      })
    }
  }

  return files
}

/**
 * Analyze all translation files
 * @returns {object} - Analysis results
 */
function analyzeTranslations() {
  const files = getAllJsonFiles(TRANSLATIONS_DIR)
  const keyMap = new Map() // key -> Array of {file, fullKey}
  const valueMap = new Map() // value -> Array of {file, fullKey}

  console.log(`Scanning ${files.length} translation files...\n`)

  // Process each file
  for (const { filePath, relativePath } of files) {
    const data = readJsonFile(filePath)
    if (!data) continue

    const flattened = flattenObject(data)

    // Track keys
    for (const [fullKey, value] of Object.entries(flattened)) {
      // Track duplicate keys
      if (!keyMap.has(fullKey)) {
        keyMap.set(fullKey, [])
      }
      keyMap.get(fullKey).push({ file: relativePath, fullKey })

      // Track duplicate values (only for string values)
      if (typeof value === 'string') {
        if (!valueMap.has(value)) {
          valueMap.set(value, [])
        }
        valueMap.get(value).push({ file: relativePath, fullKey })
      }
    }
  }

  // Find duplicate keys (keys that appear in multiple files)
  const duplicateKeys = []
  for (const [key, locations] of keyMap.entries()) {
    if (locations.length > 1) {
      duplicateKeys.push({ key, locations })
    }
  }

  // Find duplicate values (values used by multiple keys)
  const duplicateValues = []
  for (const [value, locations] of valueMap.entries()) {
    if (locations.length > 1) {
      duplicateValues.push({ value, locations })
    }
  }

  return {
    totalFiles: files.length,
    totalKeys: keyMap.size,
    duplicateKeys,
    duplicateValues,
  }
}

/**
 * Generate and print report
 */
function printReport(results) {
  const { totalFiles, totalKeys, duplicateKeys, duplicateValues } = results

  console.log('='.repeat(80))
  console.log('TRANSLATION DUPLICATE ANALYSIS REPORT')
  console.log('='.repeat(80))
  console.log()

  // Summary
  console.log('SUMMARY')
  console.log('-'.repeat(80))
  console.log(`Total files scanned: ${totalFiles}`)
  console.log(`Total unique keys: ${totalKeys}`)
  console.log(`Duplicate keys (same key in multiple files): ${duplicateKeys.length}`)
  console.log(`Duplicate values (same value for different keys): ${duplicateValues.length}`)
  console.log()

  // Duplicate keys report
  if (duplicateKeys.length > 0) {
    console.log('='.repeat(80))
    console.log('DUPLICATE KEYS')
    console.log('='.repeat(80))
    console.log('The following keys appear in multiple files:')
    console.log()

    // Sort by key name for better readability
    duplicateKeys.sort((a, b) => a.key.localeCompare(b.key))

    for (const { key, locations } of duplicateKeys) {
      console.log(`Key: "${key}"`)
      console.log(`  Found in ${locations.length} file(s):`)
      for (const { file } of locations) {
        console.log(`    - ${file}`)
      }
      console.log()
    }
  } else {
    console.log('='.repeat(80))
    console.log('DUPLICATE KEYS')
    console.log('='.repeat(80))
    console.log('✓ No duplicate keys found (each key appears in only one file)')
    console.log()
  }

  // Duplicate values report
  if (duplicateValues.length > 0) {
    console.log('='.repeat(80))
    console.log('DUPLICATE VALUES')
    console.log('='.repeat(80))
    console.log('The following values are used by multiple keys:')
    console.log()

    // Sort by number of occurrences (descending) for better readability
    duplicateValues.sort((a, b) => b.locations.length - a.locations.length)

    for (const { value, locations } of duplicateValues) {
      // Truncate long values for display
      const displayValue = value.length > 60 ? `${value.substring(0, 60)}...` : value
      console.log(`Value: "${displayValue}"`)
      console.log(`  Used by ${locations.length} key(s):`)
      for (const { file, fullKey } of locations) {
        console.log(`    - ${file} -> "${fullKey}"`)
      }
      console.log()
    }
  } else {
    console.log('='.repeat(80))
    console.log('DUPLICATE VALUES')
    console.log('='.repeat(80))
    console.log('✓ No duplicate values found (each value is unique)')
    console.log()
  }

  console.log('='.repeat(80))
  console.log('END OF REPORT')
  console.log('='.repeat(80))
}

/**
 * Main function
 */
function main() {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.error(`Error: Translations directory not found: ${TRANSLATIONS_DIR}`)
    process.exit(1)
  }

  const results = analyzeTranslations()
  printReport(results)

  // Exit with non-zero code if duplicates found
  if (results.duplicateKeys.length > 0 || results.duplicateValues.length > 0) {
    process.exit(1)
  }
}

// Run the script
main()
