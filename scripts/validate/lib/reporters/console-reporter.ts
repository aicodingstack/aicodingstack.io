/**
 * Console reporter - outputs validation results to console
 */

import path from 'node:path'
import type { ValidationReport } from '../types.js'

/**
 * Format a file path for display
 */
function formatFilePath(filePath: string, rootDir: string): string {
  const relativePath = path.relative(rootDir, filePath)
  return relativePath
}

/**
 * Print a header box
 */
function printHeader(title: string): void {
  const width = 64
  const padding = Math.floor((width - title.length - 2) / 2)
  const leftPad = ' '.repeat(padding)
  const rightPad = ' '.repeat(width - title.length - 2 - padding)

  console.log()
  console.log(`╔${'═'.repeat(width)}╗`)
  console.log(`║${leftPad}${title}${rightPad}║`)
  console.log(`╚${'═'.repeat(width)}╝`)
  console.log()
}

/**
 * Print a section header
 */
function printSectionHeader(title: string): void {
  console.log()
  console.log(title)
  console.log('━'.repeat(title.length))
}

/**
 * Print summary section
 */
function printSummary(report: ValidationReport, _rootDir: string): void {
  printSectionHeader('SUMMARY')

  const { summary } = report

  console.log(`Files scanned:          ${summary.filesScanned}`)
  console.log(`Pages:                  ${summary.pages}`)
  console.log(`Components:             ${summary.components}`)
  console.log(`Translation keys:       ${summary.translationKeys}`)
  console.log()
}

/**
 * Print violations section
 */
function printViolations(report: ValidationReport, rootDir: string): void {
  printSectionHeader('VIOLATIONS')

  const { violations } = report

  if (violations.length === 0) {
    console.log('No violations found.')
    return
  }

  // Group by type
  const namespaceViolations = violations.filter(v => v.type === 'namespace')
  const missingKeyViolations = violations.filter(v => v.type === 'missing_key')

  console.log(`1. NAMESPACE VIOLATIONS: ${namespaceViolations.length}`)

  if (namespaceViolations.length > 0) {
    for (const violation of namespaceViolations) {
      if (violation.type === 'namespace') {
        const file = formatFilePath(violation.file, rootDir)
        console.log()
        console.log(`   ${file}:${violation.line}`)
        console.log(`   Variable: ${violation.variableName}`)
        console.log(`   Namespace: ${violation.namespace}`)
        console.log(`   File Type: ${violation.fileType}`)
        console.log(
          `   Expected: ${
            violation.fileType === 'page'
              ? 'tPage, tShared (or names ending with Page/Shared)'
              : 'tComponent, tShared (or names ending with Component/Shared)'
          }`
        )
      }
    }
  }

  console.log()
  console.log(`2. MISSING TRANSLATION KEYS: ${missingKeyViolations.length}`)

  if (missingKeyViolations.length > 0) {
    for (const violation of missingKeyViolations) {
      if (violation.type === 'missing_key') {
        const file = formatFilePath(violation.file, rootDir)
        console.log()
        console.log(`   ${file}:${violation.line}`)
        console.log(`   Variable: ${violation.variableName}`)
        console.log(`   Namespace: ${violation.namespace}`)
        console.log(`   Key: ${violation.key}`)
      }
    }
  }
}

/**
 * Print warnings section
 */
function printWarnings(report: ValidationReport, rootDir: string): void {
  const { warnings } = report

  if (warnings.length === 0) {
    return
  }

  printSectionHeader('WARNINGS')

  // Group by type
  const dynamicKeyWarnings = warnings.filter(w => w.type === 'dynamic_key')
  const syntaxErrorWarnings = warnings.filter(w => w.type === 'syntax_error')
  const missingFileWarnings = warnings.filter(w => w.type === 'missing_translation_file')

  console.log(`1. DYNAMIC KEYS (cannot be validated): ${dynamicKeyWarnings.length}`)

  if (dynamicKeyWarnings.length > 0 && dynamicKeyWarnings.length <= 10) {
    for (const warning of dynamicKeyWarnings) {
      if (warning.type === 'dynamic_key') {
        const file = formatFilePath(warning.file, rootDir)
        console.log(`   ${file}:${warning.line} - ${warning.variableName}('${warning.namespace}')`)
      }
    }
  } else if (dynamicKeyWarnings.length > 10) {
    console.log(`   (showing first 10 of ${dynamicKeyWarnings.length})`)
    for (const warning of dynamicKeyWarnings.slice(0, 10)) {
      if (warning.type === 'dynamic_key') {
        const file = formatFilePath(warning.file, rootDir)
        console.log(`   ${file}:${warning.line} - ${warning.variableName}('${warning.namespace}')`)
      }
    }
  }

  console.log()
  console.log(`2. SYNTAX ERRORS: ${syntaxErrorWarnings.length}`)

  if (syntaxErrorWarnings.length > 0) {
    for (const warning of syntaxErrorWarnings) {
      if (warning.type === 'syntax_error') {
        const file = formatFilePath(warning.file, rootDir)
        console.log(`   ${file}`)
        console.log(`   Error: ${warning.error}`)
      }
    }
  }

  console.log()
  console.log(`3. MISSING TRANSLATION FILES: ${missingFileWarnings.length}`)

  if (missingFileWarnings.length > 0) {
    for (const warning of missingFileWarnings) {
      if (warning.type === 'missing_translation_file') {
        console.log(`   Namespace: ${warning.namespace} (locale: ${warning.locale})`)
      }
    }
  }
}

/**
 * Print @: references statistics
 */
function printAtReferences(report: ValidationReport): void {
  printSectionHeader('@: REFERENCES STATISTICS')

  const { summary } = report

  console.log(`Total @: references:        ${summary.atReferences.total}`)
  console.log(`Files with @: references:   ${summary.atReferences.filesWithReferences}`)
}

/**
 * Print final result
 */
function printResult(report: ValidationReport): void {
  console.log()
  console.log('─'.repeat(64))
  console.log()

  if (report.summary.passed) {
    console.log('%s  VALIDATION PASSED %s', '\x1b[42m', '\x1b[0m')
    console.log()
    console.log('All i18n usage is compliant with the project guidelines.')
  } else {
    console.log('%s  VALIDATION FAILED %s', '\x1b[41m', '\x1b[0m')
    console.log()
    console.log(
      `Found ${report.summary.violations.total} violation(s). Please fix the issues above.`
    )
  }

  console.log()
}

/**
 * Print the complete validation report to console
 */
export function printReport(report: ValidationReport, rootDir: string): void {
  printHeader('I18N VALIDATION REPORT')
  printSummary(report, rootDir)
  printViolations(report, rootDir)
  printWarnings(report, rootDir)
  printAtReferences(report)
  printResult(report)
}
