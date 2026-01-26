#!/usr/bin/env tsx
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

interface FileInfo {
  filePath: string
  relativePath: string
}

interface KeyLocation {
  file: string
  fullKey: string
}

interface FlattenedObject {
  [key: string]: string | number | boolean | null
}

/**
 * Flatten a nested object into dot-notation keys
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): FlattenedObject {
  const flattened: FlattenedObject = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey))
    } else {
      flattened[newKey] = value as string | number | boolean | null
    }
  }

  return flattened
}

/**
 * Read and parse a JSON file
 */
function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content) as Record<string, unknown>
  } catch (error) {
    const err = error as Error
    console.warn(`Warning: Failed to read ${filePath}: ${err.message}`)
    return null
  }
}

/**
 * Get all JSON files recursively from a directory
 */
function getAllJsonFiles(dir: string, baseDir = dir): FileInfo[] {
  const files: FileInfo[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push({
        filePath: fullPath,
        relativePath,
      })
    }
  }

  return files
}

/**
 * Analysis results
 */
interface AnalysisResults {
  totalFiles: number
  totalKeys: number
  duplicateKeys: Array<{ key: string; locations: KeyLocation[] }>
  duplicateValues: Array<{ value: string; locations: KeyLocation[] }>
}

/**
 * Analyze all translation files
 */
function analyzeTranslations(): AnalysisResults {
  const files = getAllJsonFiles(TRANSLATIONS_DIR)
  const keyMap = new Map<string, KeyLocation[]>()
  const valueMap = new Map<string, KeyLocation[]>()

  console.log(`Scanning ${files.length} translation files...\n`)

  for (const { filePath, relativePath } of files) {
    const data = readJsonFile(filePath)
    if (!data) continue

    const flattened = flattenObject(data)

    for (const [fullKey, value] of Object.entries(flattened)) {
      if (!keyMap.has(fullKey)) {
        keyMap.set(fullKey, [])
      }
      keyMap.get(fullKey)!.push({ file: relativePath, fullKey })

      if (typeof value === 'string') {
        if (!valueMap.has(value)) {
          valueMap.set(value, [])
        }
        valueMap.get(value)!.push({ file: relativePath, fullKey })
      }
    }
  }

  const duplicateKeys: Array<{ key: string; locations: KeyLocation[] }> = []
  for (const [key, locations] of keyMap.entries()) {
    if (locations.length > 1) {
      duplicateKeys.push({ key, locations })
    }
  }

  const duplicateValues: Array<{ value: string; locations: KeyLocation[] }> = []
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
function printReport(results: AnalysisResults): void {
  const { totalFiles, totalKeys, duplicateKeys, duplicateValues } = results

  console.log('='.repeat(80))
  console.log('TRANSLATION DUPLICATE ANALYSIS REPORT')
  console.log('='.repeat(80))
  console.log()

  console.log('SUMMARY')
  console.log('-'.repeat(80))
  console.log(`Total files scanned: ${totalFiles}`)
  console.log(`Total unique keys: ${totalKeys}`)
  console.log(`Duplicate keys (same key in multiple files): ${duplicateKeys.length}`)
  console.log(`Duplicate values (same value for different keys): ${duplicateValues.length}`)
  console.log()

  if (duplicateKeys.length > 0) {
    console.log('='.repeat(80))
    console.log('DUPLICATE KEYS')
    console.log('='.repeat(80))
    console.log('The following keys appear in multiple files:')
    console.log()

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

  if (duplicateValues.length > 0) {
    console.log('='.repeat(80))
    console.log('DUPLICATE VALUES')
    console.log('='.repeat(80))
    console.log('The following values are used by multiple keys:')
    console.log()

    duplicateValues.sort((a, b) => b.locations.length - a.locations.length)

    for (const { value, locations } of duplicateValues) {
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
function main(): void {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.error(`Error: Translations directory not found: ${TRANSLATIONS_DIR}`)
    process.exit(1)
  }

  const results = analyzeTranslations()
  printReport(results)

  if (results.duplicateKeys.length > 0 || results.duplicateValues.length > 0) {
    process.exit(1)
  }
}

main()
