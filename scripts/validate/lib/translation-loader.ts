/**
 * Translation file loader and indexer
 */

import fs from 'node:fs'
import path from 'node:path'
import type {
  AtReference,
  TranslationFile,
  TranslationIndex,
  TranslationLocation,
} from './types.js'

/**
 * Convert kebab-case to camelCase
 * Examples: model-providers -> modelProviders, open-source-rank -> openSourceRank
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase())
}

/**
 * Get all translation keys from a nested object
 */
function getKeysFromObject(obj: unknown, prefix = ''): string[] {
  const keys: string[] = []

  if (typeof obj !== 'object' || obj === null) {
    return keys
  }

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeysFromObject(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

/**
 * Count @: references in a translation object
 */
function countAtReferences(obj: unknown, file: string, locale: string, prefix = ''): AtReference[] {
  const refs: AtReference[] = []

  if (typeof obj !== 'object' || obj === null) {
    return refs
  }

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string' && value.startsWith('@:')) {
      refs.push({
        sourceFile: file,
        sourceKey: fullKey,
        targetKey: value.slice(2), // Remove '@:' prefix
        locale,
      })
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      refs.push(...countAtReferences(value, file, locale, fullKey))
    }
  }

  return refs
}

/**
 * Load a single translation file
 */
function loadTranslationFile(filePath: string, locale: string): TranslationFile | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const raw = JSON.parse(content) as unknown
    const keys = new Set(getKeysFromObject(raw))

    // Extract namespace from path
    // translations/en/pages/models.json -> pages.models
    // translations/en/pages/model-providers.json -> pages.modelProviders
    const relativePath = path.relative('translations', filePath)
    const parts = relativePath.split(path.sep)
    // ['en', 'pages', 'models.json'] or ['en', 'pages', 'model-providers.json']
    const namespaceParts = parts.slice(1, -1) // ['pages']
    const fileName = parts[parts.length - 1] // 'models.json' or 'model-providers.json'
    if (!fileName) return null
    const fileNameWithoutExt = fileName.replace('.json', '') // 'models' or 'model-providers'
    const fileNameCamelCase = kebabToCamel(fileNameWithoutExt) // 'models' or 'modelProviders'

    const namespace = [...namespaceParts, fileNameCamelCase].join('.')

    return {
      locale,
      namespace,
      path: filePath,
      keys,
      raw,
    }
  } catch {
    return null
  }
}

/**
 * Load all translation files for a given locale
 */
function loadTranslationFilesForLocale(translationsDir: string, locale: string): TranslationFile[] {
  const files: TranslationFile[] = []
  const localeDir = path.join(translationsDir, locale)

  if (!fs.existsSync(localeDir)) {
    return files
  }

  const traverse = (currentPath: string, namespacePrefix = ''): void => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)

      if (entry.isDirectory()) {
        const newPrefix = namespacePrefix ? `${namespacePrefix}.${entry.name}` : entry.name
        traverse(fullPath, newPrefix)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const translationFile = loadTranslationFile(fullPath, locale)
        if (translationFile) {
          files.push(translationFile)
        }
      }
    }
  }

  traverse(localeDir)

  return files
}

/**
 * Build index of all translation keys
 */
function buildKeyIndex(files: TranslationFile[]): Map<string, TranslationLocation[]> {
  const index = new Map<string, TranslationLocation[]>()

  for (const file of files) {
    for (const key of file.keys) {
      if (!index.has(key)) {
        index.set(key, [])
      }
      index.get(key)?.push({
        locale: file.locale,
        namespace: file.namespace,
        file: file.path,
      })
    }
  }

  return index
}

/**
 * Build index of @: references
 */
function buildAtReferenceIndex(files: TranslationFile[]): AtReference[] {
  const refs: AtReference[] = []

  for (const file of files) {
    const fileRefs = countAtReferences(file.raw, file.path, file.locale)
    refs.push(...fileRefs)
  }

  return refs
}

/**
 * Load all translations and build index
 */
export function loadTranslations(
  translationsDir: string,
  locales: readonly string[]
): TranslationIndex {
  const allFiles: TranslationFile[] = []

  for (const locale of locales) {
    const files = loadTranslationFilesForLocale(translationsDir, locale)
    allFiles.push(...files)
  }

  // Build by namespace index
  const byNamespace = new Map<string, TranslationFile[]>()
  for (const file of allFiles) {
    if (!byNamespace.has(file.namespace)) {
      byNamespace.set(file.namespace, [])
    }
    byNamespace.get(file.namespace)?.push(file)
  }

  // Build by key index
  const byKey = buildKeyIndex(allFiles)

  // Build @: references index
  const atReferences = buildAtReferenceIndex(allFiles)

  return {
    byNamespace,
    byKey,
    allFiles,
    atReferences,
  }
}

/**
 * Check if a namespace exists in translations
 */
export function namespaceExists(index: TranslationIndex, namespace: string): boolean {
  return index.byNamespace.has(namespace)
}

/**
 * Check if a translation key exists
 * Supports looking up keys from parent namespaces for nested translation file structures
 * Example: namespace='components.controls.copyButton', key='copied'
 *          will check 'components.controls' for 'copyButton.copied'
 */
export function keyExists(index: TranslationIndex, key: string, namespace: string): boolean {
  // First, check if the exact key exists in the given namespace
  const namespaceFiles = index.byNamespace.get(namespace)
  if (namespaceFiles && namespaceFiles.length > 0) {
    // Check if any file in this namespace has the key
    for (const file of namespaceFiles) {
      if (file.keys.has(key)) {
        return true
      }
    }
  }

  // Check the global key index with full namespace path
  if (index.byKey.has(`${namespace}.${key}`)) {
    return true
  }

  // If namespace has multiple parts (e.g., 'components.controls.copyButton'),
  // try looking in parent namespace with compound key
  // Example: 'components.controls.copyButton' + 'copied' -> 'components.controls' + 'copyButton.copied'
  const parts = namespace.split('.')
  if (parts.length > 2) {
    // Get the last part of namespace (e.g., 'copyButton' from 'components.controls.copyButton')
    const lastPart = parts[parts.length - 1] // 'copyButton'
    const parentNamespace = parts.slice(0, -1).join('.') // 'components.controls'
    const compoundKey = `${lastPart}.${key}` // 'copyButton.copied'

    // Check if parent namespace exists and has the compound key
    const parentFiles = index.byNamespace.get(parentNamespace)
    if (parentFiles && parentFiles.length > 0) {
      for (const file of parentFiles) {
        if (file.keys.has(compoundKey)) {
          return true
        }
      }
    }

    // Also check global index with parent namespace
    if (index.byKey.has(`${parentNamespace}.${compoundKey}`)) {
      return true
    }
  }

  return false
}

/**
 * Get all keys for a namespace
 */
export function getKeysForNamespace(index: TranslationIndex, namespace: string): Set<string> {
  const keys = new Set<string>()

  const namespaceFiles = index.byNamespace.get(namespace)
  if (namespaceFiles) {
    for (const file of namespaceFiles) {
      for (const key of file.keys) {
        keys.add(key)
      }
    }
  }

  return keys
}

/**
 * Get total count of @: references
 */
export function getAtReferencesStats(index: TranslationIndex): {
  total: number
  filesWithReferences: number
} {
  const filesWithRefs = new Set<string>()

  for (const ref of index.atReferences) {
    filesWithRefs.add(ref.sourceFile)
  }

  return {
    total: index.atReferences.length,
    filesWithReferences: filesWithRefs.size,
  }
}
