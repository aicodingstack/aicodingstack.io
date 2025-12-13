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
 * Validate translation structures are identical across all locales.
 * Mirrors scripts/validate/validate-translations-structure.mjs behavior.
 */
function validateTranslationStructures(rootDir: string): string[] {
  const failures: string[] = []
  const translationsDir = path.join(rootDir, 'translations')
  const locales = discoverLocales(translationsDir)

  if (locales.length <= 1) {
    return failures
  }

  const structures = new Map<string, { fileList: string[]; files: Map<string, Set<string>> }>()
  for (const locale of locales) {
    structures.set(locale, getLocaleStructure(translationsDir, locale))
  }

  const referenceLocale = locales[0]
  const reference = structures.get(referenceLocale)
  if (!reference) return failures

  for (let i = 1; i < locales.length; i++) {
    const locale = locales[i]
    const current = structures.get(locale)
    if (!current) continue

    const fileDiff = diffSets(new Set(reference.fileList), new Set(current.fileList))
    if (fileDiff.onlyInA.length > 0 || fileDiff.onlyInB.length > 0) {
      const parts: string[] = []
      if (fileDiff.onlyInA.length > 0) {
        parts.push(`missing files:\n${fileDiff.onlyInA.map(f => `- ${f}`).join('\n')}`)
      }
      if (fileDiff.onlyInB.length > 0) {
        parts.push(`extra files:\n${fileDiff.onlyInB.map(f => `- ${f}`).join('\n')}`)
      }
      failures.push(`[${locale}] file list mismatch vs ${referenceLocale}:\n${parts.join('\n')}`)
    }

    const allFiles = new Set([...reference.fileList, ...current.fileList])
    for (const file of allFiles) {
      const refKeys = reference.files.get(file)
      const curKeys = current.files.get(file)

      if (refKeys && !curKeys) {
        failures.push(`[${locale}] missing file '${file}' (present in ${referenceLocale})`)
        continue
      }
      if (!refKeys && curKeys) {
        failures.push(`[${locale}] extra file '${file}' (not present in ${referenceLocale})`)
        continue
      }
      if (!refKeys || !curKeys) continue

      const keyDiff = diffSets(refKeys, curKeys)
      if (keyDiff.onlyInA.length > 0 || keyDiff.onlyInB.length > 0) {
        const parts: string[] = []
        if (keyDiff.onlyInA.length > 0) {
          parts.push(`missing keys:\n${keyDiff.onlyInA.map(k => `- ${k}`).join('\n')}`)
        }
        if (keyDiff.onlyInB.length > 0) {
          parts.push(`extra keys:\n${keyDiff.onlyInB.map(k => `- ${k}`).join('\n')}`)
        }
        failures.push(
          `[${locale}] key structure mismatch in '${file}' vs ${referenceLocale}:\n${parts.join('\n')}`
        )
      }
    }
  }

  return failures
}

describe('validate: translations structure', () => {
  it('all locales have identical translation structure', () => {
    const failures = validateTranslationStructures(process.cwd())
    if (failures.length > 0) {
      throw new Error(`Translation structure validation failed:\n\n${failures.join('\n\n')}`)
    }
  })
})
