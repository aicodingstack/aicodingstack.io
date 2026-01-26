/**
 * JSON reporter - outputs validation results as JSON
 */

import fs from 'node:fs'
import type { ValidationReport } from '../types.js'

/**
 * Convert validation report to JSON-compatible object
 */
export function reportToJSON(report: ValidationReport): object {
  return {
    summary: {
      filesScanned: report.summary.filesScanned,
      pages: report.summary.pages,
      components: report.summary.components,
      translationKeys: report.summary.translationKeys,
      violations: {
        total: report.summary.violations.total,
        namespaceViolations: report.summary.violations.namespaceViolations,
        missingKeys: report.summary.violations.missingKeys,
      },
      atReferences: {
        total: report.summary.atReferences.total,
        filesWithReferences: report.summary.atReferences.filesWithReferences,
      },
      warnings: {
        total: report.summary.warnings.total,
      },
      passed: report.summary.passed,
    },
    violations: report.violations.map(v => {
      if (v.type === 'namespace') {
        return {
          type: 'namespace',
          file: v.file,
          line: v.line,
          column: v.column,
          fileType: v.fileType,
          variableName: v.variableName,
          namespace: v.namespace,
        }
      }
      // missing_key
      return {
        type: 'missing_key',
        file: v.file,
        line: v.line,
        column: v.column,
        variableName: v.variableName,
        namespace: v.namespace,
        key: v.key,
      }
    }),
    warnings: report.warnings.map(w => {
      if (w.type === 'dynamic_key') {
        return {
          type: 'dynamic_key',
          file: w.file,
          line: w.line,
          column: w.column,
          variableName: w.variableName,
          namespace: w.namespace,
          description: w.description,
        }
      }
      if (w.type === 'syntax_error') {
        return {
          type: 'syntax_error',
          file: w.file,
          error: w.error,
        }
      }
      // missing_translation_file
      return {
        type: 'missing_translation_file',
        file: w.file,
        namespace: w.namespace,
        locale: w.locale,
      }
    }),
  }
}

/**
 * Print validation report as JSON to console
 */
export function printJSON(report: ValidationReport): void {
  const json = reportToJSON(report)
  console.log(JSON.stringify(json, null, 2))
}

/**
 * Write validation report to a JSON file
 */
export function writeJSON(report: ValidationReport, outputPath: string): void {
  const json = reportToJSON(report)
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2))
}
