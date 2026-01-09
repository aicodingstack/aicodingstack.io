import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'

/**
 * Discover locales by scanning translations/* directories that contain index.ts.
 */
function discoverLocales(translationsDir: string): string[] {
  if (!fs.existsSync(translationsDir)) {
    return []
  }
  const entries = fs.readdirSync(translationsDir, { withFileTypes: true })
  const locales: string[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name
    if (name.startsWith('_') || name.startsWith('.')) continue
    const indexPath = path.join(translationsDir, name, 'index.ts')
    if (fs.existsSync(indexPath)) locales.push(name)
  }

  return locales.sort()
}

/**
 * Recursively collect nested keys from a JSON value into a set.
 * Returns a set of all key paths (e.g., "actions.backTo", "common.articles").
 */
function collectKeys(value: unknown, prefix: string, keys: Set<string>) {
  if (value === null || typeof value !== 'object') return

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item !== null && typeof item === 'object') {
        collectKeys(item, `${prefix}[${index}]`, keys)
      }
    })
    return
  }

  for (const [key, val] of Object.entries(value)) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    keys.add(fullPath)
    if (val !== null && typeof val === 'object') {
      collectKeys(val, fullPath, keys)
    }
  }
}

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Get the structure (file list + key sets) of a locale translation folder.
 */
function getLocaleStructure(
  translationsDir: string,
  locale: string
): {
  fileList: string[]
  files: Map<string, Set<string>>
} {
  const localeDir = path.join(translationsDir, locale)
  const files = new Map<string, Set<string>>()
  const fileList: string[] = []

  /**
   * Process a JSON file and collect its keys.
   */
  function processJson(filePath: string, relativePath: string) {
    const json = readJsonFile(filePath)
    const keys = new Set<string>()
    collectKeys(json, '', keys)
    files.set(relativePath, keys)
    fileList.push(relativePath)
  }

  const rootFiles = fs.readdirSync(localeDir).filter(file => {
    const filePath = path.join(localeDir, file)
    return fs.statSync(filePath).isFile() && file.endsWith('.json')
  })
  for (const file of rootFiles) {
    processJson(path.join(localeDir, file), file)
  }

  const pagesDir = path.join(localeDir, 'pages')
  if (fs.existsSync(pagesDir) && fs.statSync(pagesDir).isDirectory()) {
    const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.json'))
    for (const file of pageFiles) {
      processJson(path.join(pagesDir, file), `pages/${file}`)
    }
  }

  fileList.sort()
  return { fileList, files }
}

/**
 * Compare sets and return differences.
 */
function diffSets(a: Set<string>, b: Set<string>): { onlyInA: string[]; onlyInB: string[] } {
  const onlyInA: string[] = []
  const onlyInB: string[] = []

  for (const item of a) if (!b.has(item)) onlyInA.push(item)
  for (const item of b) if (!a.has(item)) onlyInB.push(item)

  return { onlyInA: onlyInA.sort(), onlyInB: onlyInB.sort() }
}

/**
 * Check if a value is a reference (starts with @:)
 */
function isReference(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith('@:')
}

/**
 * Extract the reference path from a @: value
 * e.g., "@:shared.terms.aiCodingStack" -> "shared.terms.aiCodingStack"
 */
function extractReferencePath(value: string): string | null {
  if (!value.startsWith('@:')) return null
  return value.slice(2)
}

/**
 * Collect all leaf values by their key paths.
 * Returns a map of key paths to their actual values.
 */
function collectValueMap(
  value: unknown,
  prefix: string,
  map: Map<string, unknown>
): void {
  if (value === null || typeof value !== 'object') return

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item !== null && typeof item === 'object') {
        collectValueMap(item, `${prefix}[${index}]`, map)
      }
    })
    return
  }

  const entries = Object.entries(value)
  for (const [key, val] of entries) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object') {
      collectValueMap(val, fullPath, map)
    } else {
      // Store leaf values
      map.set(fullPath, val)
    }
  }
}

/**
 * Validate that locale values follow the same reference pattern as English.
 * - If English uses a reference (@:...), the locale must use the same reference
 * - If English uses a direct value, the locale must also use a direct value (not a reference)
 */
function validateValueAlignment(
  translationsDir: string,
  locale: string,
  filePath: string
): string[] {
  const failures: string[] = []

  const enFilePath = path.join(translationsDir, 'en', filePath)
  const localeFilePath = path.join(translationsDir, locale, filePath)

  // Collect English values
  const enJson = readJsonFile(enFilePath) as Record<string, unknown>
  const enValues = new Map<string, unknown>()
  collectValueMap(enJson, '', enValues)

  // Collect locale values
  const localeJson = readJsonFile(localeFilePath) as Record<string, unknown>
  const localeValues = new Map<string, unknown>()
  collectValueMap(localeJson, '', localeValues)

  // Check each key for reference pattern consistency
  for (const [keyPath, enValue] of enValues) {
    const localeValue = localeValues.get(keyPath)

    // Skip if locale doesn't have this key (already caught by structure check)
    if (localeValue === undefined) continue

    const enIsRef = isReference(enValue)
    const localeIsRef = isReference(localeValue)

    // English uses a reference - locale must use the same reference
    if (enIsRef) {
      const enRefPath = extractReferencePath(enValue as string)

      if (!localeIsRef) {
        failures.push(
          `[${locale}] ${filePath}:${keyPath}\n` +
          `  English uses reference: ${enValue}\n` +
          `  Locale uses direct value: "${localeValue}"\n` +
          `  Expected: ${enValue}`
        )
      } else if (extractReferencePath(localeValue as string) !== enRefPath) {
        failures.push(
          `[${locale}] ${filePath}:${keyPath}\n` +
          `  English reference: ${enValue}\n` +
          `  Locale reference: ${localeValue}\n` +
          `  Expected same reference path`
        )
      }
    }
    // English uses a direct value - locale must also use a direct value (not a reference)
    else {
      if (localeIsRef) {
        failures.push(
          `[${locale}] ${filePath}:${keyPath}\n` +
          `  English uses direct value: "${enValue}"\n` +
          `  Locale uses reference: ${localeValue}\n` +
          `  Expected: a direct translation (not a reference)`
        )
      }
    }
  }

  return failures
}

/**
 * Validate all locales have identical structure to English (en) locale.
 */
function validateEnglishAlignment(rootDir: string): string[] {
  const failures: string[] = []
  const translationsDir = path.join(rootDir, 'translations')
  const locales = discoverLocales(translationsDir)

  // English must exist as the reference
  if (!locales.includes('en')) {
    failures.push('English (en) locale not found - cannot validate alignment')
    return failures
  }

  const referenceLocale = 'en'
  const reference = getLocaleStructure(translationsDir, referenceLocale)
  if (!reference) {
    failures.push(`Reference locale '${referenceLocale}' structure not found`)
    return failures
  }

  // Validate all other locales against English
  for (const locale of locales) {
    if (locale === referenceLocale) continue

    const current = getLocaleStructure(translationsDir, locale)
    if (!current) {
      failures.push(`[${locale}] structure not found`)
      continue
    }

    // Check file list alignment
    const fileDiff = diffSets(new Set(reference.fileList), new Set(current.fileList))
    if (fileDiff.onlyInA.length > 0 || fileDiff.onlyInB.length > 0) {
      const parts: string[] = []
      if (fileDiff.onlyInA.length > 0) {
        parts.push(
          `missing files (present in en):\n${fileDiff.onlyInA.map(f => `  - ${f}`).join('\n')}`
        )
      }
      if (fileDiff.onlyInB.length > 0) {
        parts.push(`extra files (not in en):\n${fileDiff.onlyInB.map(f => `  - ${f}`).join('\n')}`)
      }
      failures.push(`[${locale}] file list mismatch vs en:\n${parts.join('\n')}`)
    }

    // Check key structure alignment for each file
    const allFiles = new Set([...reference.fileList, ...current.fileList])
    for (const file of allFiles) {
      const refKeys = reference.files.get(file)
      const curKeys = current.files.get(file)

      if (refKeys && !curKeys) {
        failures.push(`[${locale}] missing file '${file}' (present in en)`)
        continue
      }
      if (!refKeys && curKeys) {
        failures.push(`[${locale}] extra file '${file}' (not present in en)`)
        continue
      }
      if (!refKeys || !curKeys) continue

      const keyDiff = diffSets(refKeys, curKeys)
      if (keyDiff.onlyInA.length > 0 || keyDiff.onlyInB.length > 0) {
        const parts: string[] = []
        if (keyDiff.onlyInA.length > 0) {
          parts.push(
            `missing keys (present in en):\n${keyDiff.onlyInA.map(k => `  - ${k}`).join('\n')}`
          )
        }
        if (keyDiff.onlyInB.length > 0) {
          parts.push(`extra keys (not in en):\n${keyDiff.onlyInB.map(k => `  - ${k}`).join('\n')}`)
        }
        failures.push(`[${locale}] key structure mismatch in '${file}' vs en:\n${parts.join('\n')}`)
      }

      // Check value alignment for this file
      if (!fileDiff.onlyInA.length && !fileDiff.onlyInB.length && !keyDiff.onlyInA.length && !keyDiff.onlyInB.length) {
        const valueFailures = validateValueAlignment(translationsDir, locale, file)
        failures.push(...valueFailures)
      }
    }
  }

  return failures
}

describe('validate: translations English alignment', () => {
  it('all locales have identical key and structure to English (en)', () => {
    const failures = validateEnglishAlignment(process.cwd())
    if (failures.length > 0) {
      throw new Error(
        `Translation English alignment validation failed:\n\n${failures.join('\n\n')}`
      )
    }
  })
})
