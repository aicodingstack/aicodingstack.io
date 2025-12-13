import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'

// TypeScript can import .mjs because allowJs=true and moduleResolution=bundler.
// These exports are the source of truth for reference parsing/resolution.
import { extractReferences, getValueByPath, resolveReference } from '../../src/i18n/lib-core.mjs'

type Reference = { match: string; modifier?: string; path: string }

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
    if (fs.existsSync(path.join(translationsDir, name, 'index.ts'))) locales.push(name)
  }

  return locales.sort()
}

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Convert kebab-case filename to camelCase key (used in translation file loading).
 */
function toCamelCase(filename: string): string {
  return filename.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Load translation messages by reading JSON files directly (mirrors validate-translations-refs.mjs).
 */
function loadMessages(
  translationsDir: string,
  locale: string
): {
  messages: Record<string, unknown>
  fileMap: Map<string, string>
} {
  const localeDir = path.join(translationsDir, locale)
  const messages: Record<string, unknown> = {}
  const fileMap = new Map<string, string>()

  /**
   * Mark all string paths within an object as originating from filePath.
   */
  function markPaths(value: unknown, prefix: string, filePath: string) {
    if (typeof value === 'string') {
      fileMap.set(prefix, filePath)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        markPaths(item, `${prefix}[${index}]`, filePath)
      })
      return
    }
    if (value !== null && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        const next = prefix ? `${prefix}.${key}` : key
        markPaths(val, next, filePath)
      }
    }
  }

  const rootJsonFiles = fs.readdirSync(localeDir).filter(file => {
    const filePath = path.join(localeDir, file)
    return fs.statSync(filePath).isFile() && file.endsWith('.json')
  })

  for (const file of rootJsonFiles) {
    const filePath = path.join(localeDir, file)
    const key = path.basename(file, '.json')
    const content = readJsonFile(filePath)

    if (key === 'shared') {
      messages.shared = content
      markPaths(content, 'shared', filePath)

      // Legacy keys from shared.json.
      const shared = content as {
        dict?: { common?: unknown; stacks?: unknown; platforms?: unknown }
        header?: unknown
        footer?: unknown
        search?: unknown
        license?: unknown
      }
      if (shared.dict) {
        messages.common = shared.dict.common
        messages.stacks = shared.dict.stacks
        messages.community = shared.dict.platforms
        markPaths(shared.dict.common, 'common', filePath)
        markPaths(shared.dict.stacks, 'stacks', filePath)
        markPaths(shared.dict.platforms, 'community', filePath)
      }
      if (shared.header) {
        messages.header = shared.header
        markPaths(shared.header, 'header', filePath)
      }
      if (shared.footer) {
        messages.footer = shared.footer
        markPaths(shared.footer, 'footer', filePath)
      }
      if (shared.search) {
        messages.search = shared.search
        markPaths(shared.search, 'search', filePath)
      }
      if (shared.license) {
        messages.license = shared.license
        markPaths(shared.license, 'license', filePath)
      }
    } else {
      messages[key] = content
      markPaths(content, key, filePath)
    }
  }

  const pagesDir = path.join(localeDir, 'pages')
  if (fs.existsSync(pagesDir) && fs.statSync(pagesDir).isDirectory()) {
    const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.json'))
    if (!messages.pages) messages.pages = {}

    for (const file of pageFiles) {
      const filePath = path.join(pagesDir, file)
      const key = path.basename(file, '.json')
      const content = readJsonFile(filePath)

      if (key === 'stacks') {
        const stacks = content as Record<string, unknown>
        messages.stacksPages = {
          overview: stacks.overview,
          ides: stacks.ides,
          clis: stacks.clis,
          extensions: stacks.extensions,
          models: stacks.models,
          modelProviders: stacks.modelProviders,
          vendors: stacks.vendors,
        }
        messages.stackDetailPages = {
          ideDetail: stacks.ideDetail,
          cliDetail: stacks.cliDetail,
          extensionDetail: stacks.extensionDetail,
          modelDetail: stacks.modelDetail,
          vendorDetail: stacks.vendorDetail,
          modelProviderDetail: stacks.modelProviderDetail,
        }
        markPaths(messages.stacksPages, 'stacksPages', filePath)
        markPaths(messages.stackDetailPages, 'stackDetailPages', filePath)
      } else if (key === 'comparison') {
        messages.comparison = content
        markPaths(content, 'comparison', filePath)
      } else {
        const camelKey = toCamelCase(key)
        ;(messages.pages as Record<string, unknown>)[camelKey] = content
        markPaths(content, `pages.${camelKey}`, filePath)
      }
    }
  }

  return { messages, fileMap }
}

/**
 * Collect all string values in messages with their paths.
 */
function collectStrings(
  value: unknown,
  currentPath: string,
  out: Array<{ path: string; value: string }>
) {
  if (typeof value === 'string') {
    out.push({ path: currentPath, value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStrings(item, `${currentPath}[${index}]`, out)
    })
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      const next = currentPath ? `${currentPath}.${key}` : key
      collectStrings(val, next, out)
    }
  }
}

/**
 * Validate i18n references for one locale.
 */
function validateLocale(
  translationsDir: string,
  locale: string
): Array<{ path: string; filePath: string; message: string; details: string }> {
  const errors: Array<{ path: string; filePath: string; message: string; details: string }> = []
  const { messages, fileMap } = loadMessages(translationsDir, locale)

  const strings: Array<{ path: string; value: string }> = []
  collectStrings(messages, '', strings)

  const invalidRefs = new Set<string>()
  const allowedModifiers = new Set(['upper', 'lower', 'capitalize'])

  for (const { path: stringPath, value } of strings) {
    const references = extractReferences(value) as Reference[]
    if (references.length === 0) continue
    const sourceFile = fileMap.get(stringPath) ?? 'unknown'

    for (const ref of references) {
      const key = `${stringPath}:${ref.match}`

      if (ref.modifier && !allowedModifiers.has(ref.modifier)) {
        errors.push({
          path: stringPath,
          filePath: sourceFile,
          message: 'Invalid modifier',
          details: `Modifier "${ref.modifier}" in reference "${ref.match}" is not supported`,
        })
        invalidRefs.add(key)
        continue
      }

      try {
        const referencedValue = getValueByPath(messages, ref.path)
        if (typeof referencedValue !== 'string') {
          const actualType = Array.isArray(referencedValue) ? 'array' : typeof referencedValue
          errors.push({
            path: stringPath,
            filePath: sourceFile,
            message: 'Invalid reference type',
            details: `Reference "${ref.match}" points to a ${actualType} at "${ref.path}" (only strings can be referenced)`,
          })
          invalidRefs.add(key)
        }
      } catch (error) {
        errors.push({
          path: stringPath,
          filePath: sourceFile,
          message: 'Path not found',
          details: `Reference "${ref.match}" points to non-existent path "${ref.path}": ${(error as Error).message}`,
        })
        invalidRefs.add(key)
      }
    }
  }

  // Second pass: full resolution to detect circular references, skipping strings with already-invalid refs.
  const messagesCopy = JSON.parse(JSON.stringify(messages)) as Record<string, unknown>
  for (const { path: stringPath, value } of strings) {
    const references = extractReferences(value) as Reference[]
    const hasInvalid = references.some(ref => invalidRefs.has(`${stringPath}:${ref.match}`))
    if (hasInvalid) continue

    try {
      resolveReference(value, messagesCopy, [])
    } catch (error) {
      const sourceFile = fileMap.get(stringPath) ?? 'unknown'
      errors.push({
        path: stringPath,
        filePath: sourceFile,
        message: 'Resolution failed',
        details: `Failed to resolve references in "${stringPath}": ${(error as Error).message}`,
      })
    }
  }

  return errors
}

/**
 * Validate i18n references across all locales.
 */
function validateAllLocales(rootDir: string): string[] {
  const failures: string[] = []
  const translationsDir = path.join(rootDir, 'translations')
  const locales = discoverLocales(translationsDir)

  for (const locale of locales) {
    const errors = validateLocale(translationsDir, locale)
    if (errors.length === 0) continue

    const formatted = errors
      .map(
        e =>
          `- [${locale}] ${e.message}\n  path: ${e.path}\n  file: ${path.relative(rootDir, e.filePath)}\n  details: ${e.details}`
      )
      .join('\n')
    failures.push(formatted)
  }

  return failures
}

describe('validate: translations refs', () => {
  it('all i18n references resolve and are valid', () => {
    const failures = validateAllLocales(process.cwd())
    if (failures.length > 0) {
      throw new Error(`Translation reference validation failed:\n\n${failures.join('\n\n')}`)
    }
  })
})
