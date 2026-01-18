import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'
import { locales } from '@/i18n/config'

/**
 * Manifest entity types
 */
const MANIFEST_TYPES = ['models', 'vendors', 'clis', 'ides', 'extensions', 'providers'] as const

/**
 * Expected non-English locales (all locales except 'en')
 */
const EXPECTED_LOCALES = locales.filter(l => l !== 'en')

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Get all manifest files for a given type.
 */
function getManifestFiles(rootDir: string, type: string): string[] {
  const manifestDir = path.join(rootDir, 'manifests', type)
  if (!fs.existsSync(manifestDir)) return []

  const files = fs.readdirSync(manifestDir).filter(file => file.endsWith('.json'))
  return files.map(file => path.join(manifestDir, file))
}

/**
 * Type for manifest entity with translations
 */
type ManifestEntity = {
  id: string
  name: string
  title?: string
  description?: string
  translations?: Record<string, Partial<{ name: string; title: string; description: string }>>
}

/**
 * Check if a value is a manifest entity.
 */
function isManifestEntity(value: unknown): value is ManifestEntity {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (obj.translations === undefined || typeof obj.translations === 'object')
  )
}

/**
 * Validate that a single manifest has all expected locales.
 */
function validateManifestLocales(
  _filePath: string,
  entity: ManifestEntity
): {
  missingLocales: string[]
} {
  const missingLocales: string[] = []

  if (!entity.translations) {
    missingLocales.push(...EXPECTED_LOCALES)
    return { missingLocales }
  }

  for (const locale of EXPECTED_LOCALES) {
    if (!entity.translations[locale]) {
      missingLocales.push(locale)
    }
  }

  return { missingLocales }
}

/**
 * Validate that all manifests have translations for all non-English locales.
 */
function validateManifestsI18nCompleteness(rootDir: string): string[] {
  const failures: string[] = []

  for (const type of MANIFEST_TYPES) {
    const files = getManifestFiles(rootDir, type)

    for (const file of files) {
      const json = readJsonFile(file)

      if (!isManifestEntity(json)) {
        failures.push(`${file}: invalid manifest structure`)
        continue
      }

      const { missingLocales } = validateManifestLocales(file, json)

      if (missingLocales.length > 0) {
        failures.push(
          `${file} (${json.id}): missing translations for locales: ${missingLocales.join(', ')}`
        )
      }
    }
  }

  return failures
}

/**
 * Get the expected translation fields based on the manifest's top-level fields.
 * If the manifest has 'description' or 'title' at the top level (English),
 * then all translations should also have those fields.
 * Note: 'name' is excluded as product names typically don't need translation.
 */
function getExpectedTranslationFields(entity: ManifestEntity): string[] {
  const expectedFields: string[] = []

  // title and description are optional, only require them if present at top level
  if (entity.title) {
    expectedFields.push('title')
  }
  if (entity.description) {
    expectedFields.push('description')
  }

  return expectedFields
}

/**
 * Validate that a single manifest has consistent translation fields across all locales.
 */
function validateManifestTranslationFields(
  _filePath: string,
  entity: ManifestEntity
): {
  missingFieldsByLocale: Record<string, string[]>
} {
  const missingFieldsByLocale: Record<string, string[]> = {}

  if (!entity.translations) {
    for (const locale of EXPECTED_LOCALES) {
      missingFieldsByLocale[locale] = ['no translations object']
    }
    return { missingFieldsByLocale }
  }

  const expectedFields = getExpectedTranslationFields(entity)

  for (const locale of EXPECTED_LOCALES) {
    const translation = entity.translations[locale]

    if (!translation || typeof translation !== 'object') {
      missingFieldsByLocale[locale] = expectedFields
      continue
    }

    const missingFields: string[] = []

    for (const field of expectedFields) {
      if (!(translation as Record<string, unknown>)[field]) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      missingFieldsByLocale[locale] = missingFields
    }
  }

  return { missingFieldsByLocale }
}

/**
 * Validate that all manifests have consistent translation fields across all locales.
 */
function validateManifestsTranslationFields(rootDir: string): string[] {
  const failures: string[] = []

  for (const type of MANIFEST_TYPES) {
    const files = getManifestFiles(rootDir, type)

    for (const file of files) {
      const json = readJsonFile(file)

      if (!isManifestEntity(json)) {
        failures.push(`${file}: invalid manifest structure`)
        continue
      }

      const { missingFieldsByLocale } = validateManifestTranslationFields(file, json)

      const localesWithMissingFields = Object.entries(missingFieldsByLocale)
        .filter(([, fields]) => fields.length > 0)
        .map(([locale, fields]) => `${locale}: missing ${fields.join(', ')}`)

      if (localesWithMissingFields.length > 0) {
        failures.push(`${file} (${json.id}):\n  ${localesWithMissingFields.join('\n  ')}`)
      }
    }
  }

  return failures
}

describe('validate: manifests i18n completeness', () => {
  it('all manifests have translations for all non-English locales', () => {
    const failures = validateManifestsI18nCompleteness(process.cwd())
    if (failures.length > 0) {
      throw new Error(`Manifest i18n completeness validation failed:\n\n${failures.join('\n\n')}`)
    }
  })

  it('all manifest translations have fields matching top-level English fields', () => {
    // For each manifest, if it has 'name' and 'description' at the top level (English),
    // then all translations should also have 'name' and 'description'.
    const failures = validateManifestsTranslationFields(process.cwd())
    if (failures.length > 0) {
      throw new Error(
        `Manifest translation fields consistency validation failed:\n\n${failures.join('\n\n')}`
      )
    }
  })
})
