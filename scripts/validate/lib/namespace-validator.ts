/**
 * Namespace validator - checks correct usage of translation namespaces
 */

import type { NamespaceViolation, ParsedFile, Violation } from './types.js'
import { FileType, ViolationType } from './types.js'

/**
 * Check if a variable name matches the pattern for page translations
 * Allowed: tPage, tShared, and anything ending with Page
 */
function isPageTranslationVar(varName: string): boolean {
  return varName === 'tPage' || varName === 'tShared' || varName.endsWith('Page')
}

/**
 * Check if a variable name matches the pattern for component translations
 * Allowed: tComponent, tShared, and anything ending with Component
 */
function isComponentTranslationVar(varName: string): boolean {
  return varName === 'tComponent' || varName === 'tShared' || varName.endsWith('Component')
}

/**
 * Check if a namespace is allowed for a file type
 */
function isAllowedNamespace(fileType: FileType, namespace: string): boolean {
  const ns = namespace.toLowerCase()

  if (fileType === FileType.PAGE) {
    // Pages can use 'pages.*', 'shared'
    return ns.startsWith('pages.') || ns === 'shared'
  }

  if (fileType === FileType.COMPONENT) {
    // Components can use 'components.*', 'shared'
    return ns.startsWith('components.') || ns === 'shared'
  }

  return true
}

/**
 * Validate namespace usage in a parsed file
 */
export function validateNamespaces(parsedFile: ParsedFile): Violation[] {
  const violations: Violation[] = []

  // Skip files with errors
  if (parsedFile.error) {
    return violations
  }

  // Skip unknown file types
  if (parsedFile.fileType === FileType.UNKNOWN) {
    return violations
  }

  for (const usage of parsedFile.usages) {
    const { variableName, namespace, location } = usage

    // Check if variable name follows the correct pattern for the file type
    const isVarNameAllowed =
      parsedFile.fileType === FileType.PAGE
        ? isPageTranslationVar(variableName)
        : isComponentTranslationVar(variableName)

    if (!isVarNameAllowed) {
      violations.push({
        type: ViolationType.NAMESPACE,
        file: parsedFile.path,
        line: location.line,
        column: location.column,
        fileType: parsedFile.fileType,
        variableName,
        namespace,
      })
      continue
    }

    // Also check if namespace is appropriate for the file type
    if (!isAllowedNamespace(parsedFile.fileType, namespace)) {
      violations.push({
        type: ViolationType.NAMESPACE,
        file: parsedFile.path,
        line: location.line,
        column: location.column,
        fileType: parsedFile.fileType,
        variableName,
        namespace,
      })
    }
  }

  return violations
}

/**
 * Validate namespace usage across multiple parsed files
 */
export function validateNamespacesAll(parsedFiles: ParsedFile[]): NamespaceViolation[] {
  const allViolations: NamespaceViolation[] = []

  for (const parsedFile of parsedFiles) {
    const violations = validateNamespaces(parsedFile)
    for (const violation of violations) {
      if (violation.type === 'namespace') {
        allViolations.push(violation as NamespaceViolation)
      }
    }
  }

  return allViolations
}

/**
 * Get summary of namespace violations
 */
export function getNamespaceViolationSummary(violations: NamespaceViolation[]): {
  byFileType: Record<FileType, number>
  byVariable: Record<string, number>
} {
  const byFileType: Record<FileType, number> = {
    [FileType.PAGE]: 0,
    [FileType.COMPONENT]: 0,
    [FileType.UNKNOWN]: 0,
  }
  const byVariable: Record<string, number> = {}

  for (const violation of violations) {
    byFileType[violation.fileType]++
    byVariable[violation.variableName] = (byVariable[violation.variableName] || 0) + 1
  }

  return { byFileType, byVariable }
}
