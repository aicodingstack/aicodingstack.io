#!/usr/bin/env node

/**
 * Translate locale files with Claude Code assistance
 *
 * This script:
 * 1. Reads all JSON files from translations/en/ and translations/<locale>/
 * 2. Identifies keys that need translation (currently in English)
 * 3. Outputs translation tasks for Claude Code to perform
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

// Get project root (4 levels up from .claude/skills/i18n/scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const TRANSLATIONS_DIR = path.join(PROJECT_ROOT, 'translations')
const EN_DIR = path.join(TRANSLATIONS_DIR, 'en')

// Locale display names
const LOCALE_NAMES = {
  'zh-Hans': '简体中文 (Simplified Chinese)',
  'zh-Hant': '繁體中文 (Traditional Chinese)',
  ja: '日本語 (Japanese)',
  ko: '한국어 (Korean)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
  es: 'Español (Spanish)',
  pt: 'Português (Portuguese)',
  ru: 'Русский (Russian)',
  id: 'Bahasa Indonesia (Indonesian)',
  tr: 'Türkçe (Turkish)',
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
 * Recursively get all key-value pairs from nested object
 * @param {Object} obj - The object to traverse
 * @param {string} prefix - Current key path prefix
 * @returns {Array<{key: string, value: *}>} Array of key-value pairs
 */
function getAllEntries(obj, prefix = '') {
  const entries = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...getAllEntries(value, fullKey))
    } else {
      entries.push({ key: fullKey, value })
    }
  }

  return entries
}

/**
 * Get value from nested object using dot notation
 * @param {Object} obj - The object to query
 * @param {string} path - Dot notation path
 * @returns {*} The value at the path
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Set value in nested object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
function setValueByPath(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

/**
 * Check if a string contains English characters
 * Simple heuristic: if it contains Latin alphabet, assume English
 * @param {string} text - Text to check
 * @returns {boolean} True if likely English
 */
function isLikelyEnglish(text) {
  if (typeof text !== 'string') return false
  // Check if contains English letters (excluding URLs, placeholders, and references)
  const cleanText = text
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/\{[^}]+\}/g, '') // Remove {placeholders}
    .replace(/\$\{[^}]+\}/g, '') // Remove ${variables}
    .replace(/@[:.][^\s]+/g, '') // Remove @:reference and @.modifier:reference
    .replace(/<[^>]+>/g, '') // Remove <html> tags

  // If after cleaning, contains English letters, it's likely English
  return /[a-zA-Z]{2,}/.test(cleanText)
}

/**
 * Find entries that need translation across all JSON files
 * @param {string} locale - Target locale code
 * @returns {Array<{file: string, key: string, enValue: string, targetValue: string}>} Entries needing translation
 */
function findTranslationNeeded(locale) {
  const targetDir = path.join(TRANSLATIONS_DIR, locale)
  const jsonFiles = getJsonFiles(EN_DIR)
  const needsTranslation = []

  for (const relativePath of jsonFiles) {
    const enFile = path.join(EN_DIR, relativePath)
    const targetFile = path.join(targetDir, relativePath)

    if (!fs.existsSync(targetFile)) {
      // File doesn't exist, all entries need translation
      const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const enEntries = getAllEntries(enData)
      for (const { key, value: enValue } of enEntries) {
        needsTranslation.push({ file: relativePath, key, enValue, targetValue: null })
      }
    } else {
      const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
      const enEntries = getAllEntries(enData)

      for (const { key, value: enValue } of enEntries) {
        const targetValue = getValueByPath(targetData, key)

        // Need translation if:
        // 1. Value is missing in target
        // 2. Value in target is same as English (not translated yet)
        // 3. Value in target still contains significant English text
        if (!targetValue || targetValue === enValue || isLikelyEnglish(targetValue)) {
          needsTranslation.push({ file: relativePath, key, enValue, targetValue })
        }
      }
    }
  }

  return needsTranslation
}

/**
 * Display translation instructions for Claude Code
 * @param {string} locale - Target locale
 * @param {Array} entries - Entries to translate
 */
function displayTranslationTask(locale, entries) {
  const localeName = LOCALE_NAMES[locale] || locale

  // Group entries by file for better context
  const byFile = {}
  for (const entry of entries) {
    if (!byFile[entry.file]) byFile[entry.file] = []
    byFile[entry.file].push(entry)
  }

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.magenta}📝 Translation Task${colors.reset}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

  console.log(`${colors.blue}Target Language:${colors.reset} ${localeName}`)
  console.log(`${colors.blue}Entries to translate:${colors.reset} ${entries.length}\n`)

  console.log(`${colors.yellow}Files affected:${colors.reset}`)
  for (const [file, fileEntries] of Object.entries(byFile)) {
    console.log(`  - ${colors.blue}${file}${colors.reset}: ${fileEntries.length} entries`)
  }
  console.log('')

  console.log(`${colors.yellow}⚠ Translation Guidelines:${colors.reset}`)
  console.log(`  1. Preserve brand names: "AI Coding Stack", "Claude Code", etc.`)
  console.log(`  2. Keep placeholders intact: {count}, {name}, \${variable}`)
  console.log(`  3. Don't translate URLs and file paths`)
  console.log(`  4. Maintain consistent terminology throughout`)
  console.log(`  5. Preserve reference syntax: @:path.to.key${colors.reset}\n`)

  console.log(`${colors.green}Content to translate:${colors.reset}\n`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)

  // Output as grouped JSON with file context
  console.log('```json')
  const translationMap = {}
  for (const { key, enValue } of entries) {
    translationMap[key] = enValue
  }
  console.log(JSON.stringify(translationMap, null, 2))
  console.log('```\n')

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
  console.log(`${colors.yellow}👉 Next Steps:${colors.reset}`)
  console.log(`  1. Translate each value in the JSON above to ${localeName}`)
  console.log(`  2. Reply with the translated JSON in the same format`)
  console.log(`  3. The script will apply the translations to the appropriate files\n`)
}

/**
 * Apply translations to target locale files
 * @param {string} locale - Target locale code
 * @param {Object} translations - Translation map {key: translatedValue}
 * @returns {Object} Application report
 */
function _applyTranslations(locale, translations) {
  const targetDir = path.join(TRANSLATIONS_DIR, locale)
  const jsonFiles = getJsonFiles(EN_DIR)
  const report = {
    filesUpdated: [],
    totalKeys: 0,
  }

  // Group translations by file
  const translationsByFile = {}
  for (const jsonFile of jsonFiles) {
    translationsByFile[jsonFile] = {}
  }

  // Read English files to map keys to files
  for (const relativePath of jsonFiles) {
    const enFile = path.join(EN_DIR, relativePath)
    const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
    const enEntries = getAllEntries(enData)

    for (const { key } of enEntries) {
      if (key in translations) {
        translationsByFile[relativePath][key] = translations[key]
      }
    }
  }

  // Apply translations to each file
  for (const [relativePath, fileTranslations] of Object.entries(translationsByFile)) {
    if (Object.keys(fileTranslations).length === 0) continue

    const targetFile = path.join(targetDir, relativePath)
    const targetData = fs.existsSync(targetFile)
      ? JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
      : {}

    let count = 0
    for (const [key, value] of Object.entries(fileTranslations)) {
      setValueByPath(targetData, key, value)
      count++
    }

    // Ensure directory exists
    const targetDirPath = path.dirname(targetFile)
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true })
    }

    // Write back with consistent formatting
    fs.writeFileSync(targetFile, `${JSON.stringify(targetData, null, 2)}\n`, 'utf-8')

    report.filesUpdated.push(relativePath)
    report.totalKeys += count
  }

  return report
}

/**
 * Main translate function
 */
function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  const locale = args[0]

  if (!locale) {
    console.error(`${colors.red}✗ Usage: node translate.mjs <locale>${colors.reset}`)
    console.error(`${colors.yellow}  Example: node translate.mjs zh-Hans${colors.reset}\n`)
    console.error(`${colors.blue}Available locales:${colors.reset}`)
    for (const [code, name] of Object.entries(LOCALE_NAMES)) {
      console.error(`  ${code} - ${name}`)
    }
    process.exit(1)
  }

  console.log(`${colors.cyan}🌐 Translation Assistant for ${locale}${colors.reset}\n`)

  // Check English directory exists
  if (!fs.existsSync(EN_DIR)) {
    console.error(`${colors.red}✗ English directory not found: ${EN_DIR}${colors.reset}`)
    process.exit(1)
  }

  // Find entries needing translation
  const toTranslate = findTranslationNeeded(locale)

  if (toTranslate.length === 0) {
    console.log(`${colors.green}✓ All entries in ${locale}/ are already translated!${colors.reset}`)
    return
  }

  // Display translation task for Claude Code
  displayTranslationTask(locale, toTranslate)
}

// Run the script
try {
  main()
} catch (error) {
  console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`)
  console.error(error.stack)
  process.exit(1)
}
