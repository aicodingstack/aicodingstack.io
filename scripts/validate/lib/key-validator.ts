/**
 * Translation key validator - checks if used keys exist in translation files
 */

import { keyExists } from './translation-loader.js'
import type {
  DynamicKeyWarning,
  MissingKeyViolation,
  MissingTranslationFileWarning,
  ParsedFile,
  SyntaxErrorWarning,
  TranslationIndex,
  Warning,
} from './types.js'
import { ViolationType, WarningType } from './types.js'

/**
 * Validate translation keys for a single parsed file
 */
export function validateKeys(
  parsedFile: ParsedFile,
  translationIndex: TranslationIndex
): { violations: MissingKeyViolation[]; warnings: Warning[] } {
  const violations: MissingKeyViolation[] = []
  const warnings: Warning[] = []

  // Handle files with parsing errors
  if (parsedFile.error) {
    warnings.push({
      type: 'syntax_error',
      file: parsedFile.path,
      error: parsedFile.error,
    } as SyntaxErrorWarning)
    return { violations, warnings }
  }

  // Check each usage
  for (const usage of parsedFile.usages) {
    const { variableName, namespace, calls } = usage

    // Check if namespace exists in translations
    const namespaceExists = translationIndex.byNamespace.has(namespace)

    // If the exact namespace doesn't exist, check if it might be a sub-namespace
    // (e.g., 'components.common.header' where 'header' is a nested key in 'components.common')
    if (!namespaceExists) {
      const parts = namespace.split('.')
      // Only warn if there's no possible parent namespace either
      // For 'components.common.header', check if 'components.common' exists
      let hasPotentialParentNamespace = false
      if (parts.length >= 2) {
        const parentNamespace = parts.slice(0, -1).join('.')
        if (translationIndex.byNamespace.has(parentNamespace)) {
          hasPotentialParentNamespace = true
        }
      }

      if (!hasPotentialParentNamespace) {
        warnings.push({
          type: 'missing_translation_file',
          file: parsedFile.path,
          namespace,
          locale: 'en', // Default to English for missing file warning
        } as MissingTranslationFileWarning)
      }
    }

    // Check each call
    for (const call of calls) {
      const { key, keyType, location } = call

      if (keyType === 'dynamic') {
        // Dynamic keys cannot be validated - add warning
        warnings.push({
          type: WarningType.DYNAMIC_KEY,
          file: parsedFile.path,
          line: location.line,
          column: location.column,
          variableName,
          namespace,
          description: `Dynamic key detected at ${parsedFile.path}:${location.line}:${location.column}`,
        })
        continue
      }

      if (keyType === 'partial') {
        // Unknown key type - skip validation
        continue
      }

      // Check if key exists
      if (!keyExists(translationIndex, key, namespace)) {
        violations.push({
          type: ViolationType.MISSING_KEY,
          file: parsedFile.path,
          line: location.line,
          column: location.column,
          variableName,
          namespace,
          key,
        })
      }
    }
  }

  return { violations, warnings }
}

/**
 * Validate translation keys across multiple parsed files
 */
export function validateKeysAll(
  parsedFiles: ParsedFile[],
  translationIndex: TranslationIndex
): { violations: MissingKeyViolation[]; warnings: Warning[] } {
  const allViolations: MissingKeyViolation[] = []
  const allWarnings: Warning[] = []

  for (const parsedFile of parsedFiles) {
    const { violations, warnings } = validateKeys(parsedFile, translationIndex)
    allViolations.push(...violations)
    allWarnings.push(...warnings)
  }

  return { violations: allViolations, warnings: allWarnings }
}

/**
 * Get summary of missing key violations
 */
export function getMissingKeySummary(violations: MissingKeyViolation[]): {
  byNamespace: Record<string, number>
  byVariable: Record<string, number>
} {
  const byNamespace: Record<string, number> = {}
  const byVariable: Record<string, number> = {}

  for (const violation of violations) {
    byNamespace[violation.namespace] = (byNamespace[violation.namespace] || 0) + 1
    byVariable[violation.variableName] = (byVariable[violation.variableName] || 0) + 1
  }

  return { byNamespace, byVariable }
}

/**
 * Get summary of warnings
 */
export function getWarningSummary(warnings: Warning[]): {
  byType: Record<string, number>
  dynamicKeyWarnings: DynamicKeyWarning[]
  syntaxErrorWarnings: SyntaxErrorWarning[]
  missingFileWarnings: MissingTranslationFileWarning[]
} {
  const byType: Record<string, number> = {
    dynamic_key: 0,
    syntax_error: 0,
    missing_translation_file: 0,
  }

  const dynamicKeyWarnings: DynamicKeyWarning[] = []
  const syntaxErrorWarnings: SyntaxErrorWarning[] = []
  const missingFileWarnings: MissingTranslationFileWarning[] = []

  for (const warning of warnings) {
    const typeKey = String(warning.type)
    if (!(typeKey in byType)) {
      byType[typeKey] = 0
    }
    byType[typeKey] = (byType[typeKey] ?? 0) + 1

    switch (warning.type) {
      case WarningType.DYNAMIC_KEY:
        dynamicKeyWarnings.push(warning)
        break
      case WarningType.SYNTAX_ERROR:
        syntaxErrorWarnings.push(warning)
        break
      case WarningType.MISSING_TRANSLATION_FILE:
        missingFileWarnings.push(warning)
        break
    }
  }

  return {
    byType,
    dynamicKeyWarnings,
    syntaxErrorWarnings,
    missingFileWarnings,
  }
}
