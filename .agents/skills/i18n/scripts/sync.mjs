#!/usr/bin/env node

/**
 * Sync all locale translation files with en/ as source of truth
 *
 * This script:
 * 1. Reads translations/en/ JSON files as the reference
 * 2. Scans all other enabled locale directories in translations/
 * 3. Adds missing keys (with English text as placeholder)
 * 4. Removes extra keys not present in English files
 * 5. Preserves JSON structure, key order, and formatting
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

// Get project root (4 levels up from .claude/skills/i18n/scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const TRANSLATIONS_DIR = path.join(PROJECT_ROOT, 'translations')
const EN_DIR = path.join(TRANSLATIONS_DIR, 'en')

/**
 * Get enabled locales from src/i18n/config.ts
 * @returns {string[]} Array of enabled locale codes
 */
function getEnabledLocales() {
  const configPath = path.join(PROJECT_ROOT, 'src/i18n/config.ts')
  const configContent = fs.readFileSync(configPath, 'utf-8')

  // Extract locales array from the config file
  const match = configContent.match(/export const locales\s*=\s*\[([^\]]+)\]/s)
  if (!match) {
    throw new Error('Could not find locales array in src/i18n/config.ts')
  }

  // Parse the locale codes
  const localesArray = match[1]
  const localeMatches = localesArray.matchAll(/'([^']+)'/g)
  return [...localeMatches].map(m => m[1])
}

/**
 * Get all JSON files in a directory recursively
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of relative JSON file paths
 */
function getJsonFiles(dir) {
  const files = []

  function traverse(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        traverse(path.join(currentDir, entry.name), path.join(relativePath, entry.name))
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(path.join(relativePath, entry.name))
      }
    }
  }

  traverse(dir)
  return files
}

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to traverse
 * @param {string} prefix - Current key path prefix
 * @returns {string[]} Array of dot-notation key paths
 */
function getAllKeys(obj, prefix = '') {
  const keys = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

/**
 * Recursively rebuild object with same structure and order as reference
 * @param {Object} reference - The reference object (en.json)
 * @param {Object} target - The target object to sync
 * @param {Array} added - Array to track added keys
 * @param {Array} removed - Array to track removed keys
 * @param {string} prefix - Current key path prefix
 * @returns {Object} Rebuilt object with same structure as reference
 */
function rebuildWithSameOrder(reference, target, added, removed, prefix = '') {
  const result = {}

  // Iterate through reference keys in order
  for (const [key, refValue] of Object.entries(reference)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (refValue !== null && typeof refValue === 'object' && !Array.isArray(refValue)) {
      // It's a nested object
      if (
        key in target &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        // Recursively rebuild nested object
        result[key] = rebuildWithSameOrder(refValue, target[key], added, removed, fullKey)
      } else {
        // Missing nested object, use reference structure
        result[key] = rebuildWithSameOrder(refValue, {}, added, removed, fullKey)
        // Track all leaf keys as added
        const leafKeys = getAllKeys(refValue, fullKey)
        added.push(...leafKeys)
      }
    } else {
      // It's a leaf value
      if (key in target) {
        // Use target's translation
        result[key] = target[key]
      } else {
        // Missing key, use English as placeholder
        result[key] = refValue
        added.push(fullKey)
      }
    }
  }

  // Track removed keys (keys in target but not in reference)
  for (const key in target) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (!(key in reference)) {
      if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        const leafKeys = getAllKeys(target[key], fullKey)
        removed.push(...leafKeys)
      } else {
        removed.push(fullKey)
      }
    }
  }

  return result
}

/**
 * Sync a target JSON file with the English reference
 * @param {string} enFile - Path to the English reference file
 * @param {string} targetFile - Path to the target language file
 * @returns {Object} Sync report
 */
function syncJsonFile(enFile, targetFile) {
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'))

  // Create target directory if it doesn't exist
  const targetDir = path.dirname(targetFile)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  let added = []
  const removed = []

  if (fs.existsSync(targetFile)) {
    const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
    const syncedData = rebuildWithSameOrder(enData, targetData, added, removed)
    fs.writeFileSync(targetFile, `${JSON.stringify(syncedData, null, 2)}\n`, 'utf-8')
  } else {
    // File doesn't exist, create it with English content
    fs.writeFileSync(targetFile, `${JSON.stringify(enData, null, 2)}\n`, 'utf-8')
    added = getAllKeys(enData)
  }

  return { added, removed }
}

/**
 * Main sync function
 */
function main() {
  console.log(`${colors.cyan}🔄 Syncing translation files with en/...${colors.reset}\n`)

  // Check if translations directory exists
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.error(
      `${colors.red}✗ Translations directory not found: ${TRANSLATIONS_DIR}${colors.reset}`
    )
    process.exit(1)
  }

  // Check if English directory exists
  if (!fs.existsSync(EN_DIR)) {
    console.error(`${colors.red}✗ English directory not found: ${EN_DIR}${colors.reset}`)
    process.exit(1)
  }

  // Get enabled locales
  const enabledLocales = getEnabledLocales()
  const targetLocales = enabledLocales.filter(locale => locale !== 'en')

  if (targetLocales.length === 0) {
    console.log(`${colors.yellow}⚠ No other locales enabled in config${colors.reset}`)
    return
  }

  // Get all JSON files in English directory (relative paths)
  const jsonFiles = getJsonFiles(EN_DIR)

  if (jsonFiles.length === 0) {
    console.log(`${colors.yellow}⚠ No JSON files found in en/${colors.reset}`)
    return
  }

  let totalAdded = 0
  let totalRemoved = 0
  let filesModified = 0
  const localeReports = {}

  // Sync each locale
  for (const locale of targetLocales) {
    const localeDir = path.join(TRANSLATIONS_DIR, locale)
    const localeAdded = []
    const localeRemoved = []
    const fileChanges = []

    // Check if locale directory exists
    if (!fs.existsSync(localeDir)) {
      console.log(`${colors.yellow}⚠ Creating directory for ${locale}/${colors.reset}`)
      fs.mkdirSync(localeDir, { recursive: true })
    }

    // Sync each JSON file
    for (const relativePath of jsonFiles) {
      const enFile = path.join(EN_DIR, relativePath)
      const targetFile = path.join(localeDir, relativePath)

      const { added, removed } = syncJsonFile(enFile, targetFile)

      if (added.length > 0 || removed.length > 0) {
        fileChanges.push({ file: relativePath, added, removed })
        localeAdded.push(...added)
        localeRemoved.push(...removed)
      }
    }

    localeReports[locale] = {
      added: localeAdded,
      removed: localeRemoved,
      fileChanges,
    }

    totalAdded += localeAdded.length
    totalRemoved += localeRemoved.length
    if (fileChanges.length > 0) filesModified++
  }

  // Display results
  for (const locale of targetLocales) {
    const report = localeReports[locale]

    if (report.fileChanges.length > 0) {
      console.log(`${colors.green}✓${colors.reset} Synced ${colors.blue}${locale}/${colors.reset}`)

      for (const change of report.fileChanges) {
        if (change.added.length > 0) {
          console.log(
            `  ${colors.green}+${colors.reset} Added ${change.added.length} key${change.added.length > 1 ? 's' : ''} in ${colors.blue}${change.file}${colors.reset}`
          )
        }
        if (change.removed.length > 0) {
          console.log(
            `  ${colors.red}-${colors.reset} Removed ${change.removed.length} key${change.removed.length > 1 ? 's' : ''} in ${colors.blue}${change.file}${colors.reset}`
          )
        }
      }

      console.log('')
    } else {
      console.log(
        `${colors.green}✓${colors.reset} ${colors.blue}${locale}/${colors.reset} already in sync`
      )
    }
  }

  // Summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)

  if (filesModified > 0) {
    console.log(`${colors.green}✓ Sync complete!${colors.reset}`)
    console.log(`  Modified: ${filesModified} locale${filesModified > 1 ? 's' : ''}`)
    console.log(`  Added: ${totalAdded} key${totalAdded > 1 ? 's' : ''}`)
    console.log(`  Removed: ${totalRemoved} key${totalRemoved > 1 ? 's' : ''}`)
  } else {
    console.log(`${colors.green}✓ all locales are already in sync${colors.reset}`)
  }
}

// Run the script
try {
  main()
} catch (error) {
  console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`)
  console.error(error.stack)
  process.exit(1)
}
