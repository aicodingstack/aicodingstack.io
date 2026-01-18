#!/usr/bin/env -S npx tsx

/**
 * I18N Usage Validation Script
 *
 * This script validates that i18n translations are used correctly according to
 * the project's i18n architecture rules:
 *
 * 1. Namespace rules:
 *    - Pages: should use tPage, tShared (or names ending with Page/Shared)
 *    - Components: should use tComponent, tShared (or names ending with Component/Shared)
 *
 * 2. Translation key existence:
 *    - All used translation keys must exist in the corresponding translation files
 *
 * 3. @: references:
 *    - Statistics are reported (not considered errors)
 *
 * Usage:
 *   npx tsx scripts/validate/validate-i18n-usage.ts
 *   npx tsx scripts/validate/validate-i18n-usage.ts --locale de
 *   npx tsx scripts/validate/validate-i18n-usage.ts --format json --output report.json
 */

import path from 'node:path'
import { parseArgs } from 'node:util'
import { findSourceFiles, parseFile } from './lib/ast-parser.js'
import { LOCALES, ROOT_DIR } from './lib/config.js'
import { validateKeysAll } from './lib/key-validator.js'
import { validateNamespacesAll } from './lib/namespace-validator.js'
import { printReport as printConsoleReport } from './lib/reporters/console-reporter.js'
import { printJSON, writeJSON } from './lib/reporters/json-reporter.js'
import { getAtReferencesStats, loadTranslations } from './lib/translation-loader.js'
import type {
  OutputFormat,
  SyntaxErrorWarning,
  ValidationOptions,
  ValidationReport,
  Warning,
} from './lib/types.js'
import { WarningType } from './lib/types.js'

/**
 * Parse command line arguments
 */
function parseOptions(): ValidationOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      locale: {
        type: 'string',
        short: 'l',
      },
      format: {
        type: 'string',
        short: 'f',
        default: 'console',
      },
      output: {
        type: 'string',
        short: 'o',
      },
    },
  })

  // Validate locale if provided
  if (values.locale && !LOCALES.includes(values.locale)) {
    console.error(`Error: Invalid locale "${values.locale}"`)
    console.error(`Valid locales: ${LOCALES.join(', ')}`)
    process.exit(1)
  }

  // Validate format
  const format = values.format?.toLowerCase()
  if (format !== 'console' && format !== 'json') {
    console.error(`Error: Invalid format "${format}"`)
    console.error('Valid formats: console, json')
    process.exit(1)
  }

  return {
    locale: values.locale,
    format: (format ?? 'console') as OutputFormat,
    output: values.output,
  }
}

/**
 * Main validation function
 */
function main(): void {
  const options = parseOptions()

  console.log(`Scanning project files in ${ROOT_DIR}...`)
  console.log()

  // Determine which locales to validate
  const localesToValidate = options.locale ? ([options.locale] as string[]) : (LOCALES as string[])

  // Find all source files
  const srcDir = path.join(ROOT_DIR, 'src')
  const sourceFiles = findSourceFiles(srcDir)

  // Parse all files
  const parsedFiles = sourceFiles.map(parseFile)

  // Count file types
  const pagesCount = parsedFiles.filter(f => f.fileType === 'page').length
  const componentsCount = parsedFiles.filter(f => f.fileType === 'component').length

  // Load translations
  const translationsDir = path.join(ROOT_DIR, 'translations')
  const translationIndex = loadTranslations(translationsDir, localesToValidate)

  // Count total translation keys
  let totalKeys = 0
  for (const files of translationIndex.byNamespace.values()) {
    for (const file of files) {
      totalKeys += file.keys.size
    }
  }

  // Validate namespaces
  const namespaceViolations = validateNamespacesAll(parsedFiles)

  // Validate translation keys
  const { violations: missingKeyViolations, warnings: keyWarnings } = validateKeysAll(
    parsedFiles,
    translationIndex
  )

  // Collect all warnings (syntax errors from parsed files + key validation warnings)
  const syntaxErrorWarnings: SyntaxErrorWarning[] = parsedFiles
    .filter(f => f.error)
    .map(f => ({
      type: WarningType.SYNTAX_ERROR,
      file: f.path,
      error: f.error!,
    }))

  const allWarnings: Warning[] = [...syntaxErrorWarnings, ...keyWarnings]

  // Get @: references stats
  const atRefsStats = getAtReferencesStats(translationIndex)

  // Build report
  const report: ValidationReport = {
    summary: {
      filesScanned: parsedFiles.length,
      pages: pagesCount,
      components: componentsCount,
      translationKeys: totalKeys,
      violations: {
        total: namespaceViolations.length + missingKeyViolations.length,
        namespaceViolations: namespaceViolations.length,
        missingKeys: missingKeyViolations.length,
      },
      atReferences: atRefsStats,
      warnings: {
        total: allWarnings.length,
      },
      passed: namespaceViolations.length === 0 && missingKeyViolations.length === 0,
    },
    violations: [...namespaceViolations, ...missingKeyViolations],
    warnings: allWarnings,
  }

  // Output report
  if (options.format === 'json') {
    if (options.output) {
      writeJSON(report, options.output)
      console.log(`Report written to ${options.output}`)
    } else {
      printJSON(report)
    }
  } else {
    printConsoleReport(report, ROOT_DIR)
  }

  // Exit with appropriate code
  process.exit(report.summary.passed ? 0 : 1)
}

// Run main function
main()
