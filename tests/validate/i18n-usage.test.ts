/**
 * I18N Usage Validation Tests
 *
 * Tests for:
 * 1. Translation namespace rules (tPage/tShared for pages, tComponent/tShared for components)
 * 2. Translation key existence (all used keys must exist in translation files)
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@typescript-eslint/parser'
import type { TSESTree } from '@typescript-eslint/types'
import { beforeAll, describe, it } from 'vitest'

// ============================================================================
// Type Definitions
// ============================================================================

enum FileType {
  PAGE = 'page',
  COMPONENT = 'component',
  UNKNOWN = 'unknown',
}

interface SourceLocation {
  file: string
  line: number
  column: number
}

interface TranslationCall {
  key: string
  keyType: 'static' | 'dynamic' | 'partial'
  location: SourceLocation
}

interface TranslationUsage {
  variableName: string
  namespace: string
  calls: TranslationCall[]
  location: SourceLocation
}

interface ParsedFile {
  path: string
  fileType: FileType
  usages: TranslationUsage[]
  error?: string
}

interface TranslationFile {
  locale: string
  namespace: string
  path: string
  keys: Set<string>
}

interface TranslationIndex {
  byNamespace: Map<string, TranslationFile[]>
  byKey: Map<string, Set<string>>
}

interface NamespaceViolation {
  file: string
  line: number
  column: number
  fileType: FileType
  variableName: string
  namespace: string
}

interface MissingKeyViolation {
  file: string
  line: number
  column: number
  variableName: string
  namespace: string
  key: string
}

// ============================================================================
// Constants
// ============================================================================

const ROOT_DIR = process.cwd()
const SRC_DIR = path.join(ROOT_DIR, 'src')
const TRANSLATIONS_DIR = path.join(ROOT_DIR, 'translations')

// ============================================================================
// File Type Detection
// ============================================================================

function getFileType(filePath: string): FileType {
  const normalizedPath = path.normalize(filePath)

  if (normalizedPath.includes('src/app/[locale]')) {
    return FileType.PAGE
  }

  if (normalizedPath.includes('src/components')) {
    return FileType.COMPONENT
  }

  return FileType.UNKNOWN
}

// ============================================================================
// Translation Index Loading
// ============================================================================

function flattenObject(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>()

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const childKeys = flattenObject(value as Record<string, unknown>, fullKey)
      for (const k of childKeys) {
        keys.add(k)
      }
    } else {
      keys.add(fullKey)
    }
  }

  return keys
}

function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content) as Record<string, unknown>
  } catch {
    return null
  }
}

function loadTranslations(): TranslationIndex {
  const index: TranslationIndex = {
    byNamespace: new Map(),
    byKey: new Map(),
  }

  // Load English translations as reference
  const enDir = path.join(TRANSLATIONS_DIR, 'en')

  if (!fs.existsSync(enDir)) {
    return index
  }

  const loadDir = (dir: string, baseNamespace = ''): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const newNamespace = baseNamespace ? `${baseNamespace}.${entry.name}` : entry.name
        loadDir(fullPath, newNamespace)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const data = readJsonFile(fullPath)
        if (!data) continue

        // Namespace is derived from file path
        // For pages: convert kebab-case file names to camelCase to match index.ts exports
        let namespaceWithoutExt = entry.name.replace('.json', '')
        if (baseNamespace === 'pages') {
          namespaceWithoutExt = namespaceWithoutExt.replace(/-([a-z])/g, (_match, letter) =>
            letter.toUpperCase()
          )
        }

        const namespace = baseNamespace
          ? `${baseNamespace}.${namespaceWithoutExt}`
          : namespaceWithoutExt

        const keys = flattenObject(data)

        const file: TranslationFile = {
          locale: 'en',
          namespace,
          path: fullPath,
          keys,
        }

        if (!index.byNamespace.has(namespace)) {
          index.byNamespace.set(namespace, [])
        }
        index.byNamespace.get(namespace)!.push(file)

        // Index by key for faster lookup
        for (const key of keys) {
          if (!index.byKey.has(key)) {
            index.byKey.set(key, new Set())
          }
          index.byKey.get(key)!.add(namespace)
        }
      }
    }
  }

  loadDir(enDir)

  return index
}

// ============================================================================
// AST Parsing
// ============================================================================

function extractStringLiteral(node: TSESTree.Node): string | null {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }
  return null
}

function getKeyType(node: TSESTree.CallExpressionArgument): TranslationCall['keyType'] {
  if (
    (node.type === 'TemplateLiteral' && node.expressions.length > 0) ||
    node.type === 'BinaryExpression' ||
    node.type === 'Identifier' ||
    node.type === 'MemberExpression'
  ) {
    return 'dynamic'
  }
  if (extractStringLiteral(node) !== null) {
    return 'static'
  }
  return 'partial'
}

function extractTranslationKey(node: TSESTree.CallExpressionArgument): {
  key: string
  keyType: TranslationCall['keyType']
} {
  const keyType = getKeyType(node)

  if (keyType === 'static') {
    return { key: extractStringLiteral(node)!, keyType }
  }

  if (keyType === 'dynamic') {
    return { key: '<dynamic>', keyType }
  }

  return { key: '<unknown>', keyType }
}

function visit(ast: TSESTree.Program, visitor: (node: TSESTree.Node) => void): void {
  const stack: TSESTree.Node[] = [ast]

  while (stack.length > 0) {
    const node = stack.pop()!
    visitor(node)

    for (const key of Object.keys(node)) {
      const child = node[key as keyof TSESTree.Node]
      if (typeof child === 'object' && child !== null) {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (typeof item === 'object' && item !== null && 'type' in item) {
              stack.push(item as TSESTree.Node)
            }
          }
        } else if ('type' in child) {
          stack.push(child as TSESTree.Node)
        }
      }
    }
  }
}

function findTranslationsDeclarations(
  ast: TSESTree.Program
): Map<string, { namespace: string; location: SourceLocation }> {
  const translationsMap = new Map<string, { namespace: string; location: SourceLocation }>()

  visit(ast, node => {
    if (node.type === 'VariableDeclarator') {
      const declarator = node as TSESTree.VariableDeclarator

      if (declarator.id.type === 'Identifier' && declarator.init?.type === 'CallExpression') {
        const call = declarator.init

        if (
          call.callee.type === 'Identifier' &&
          call.callee.name === 'useTranslations' &&
          call.arguments.length > 0
        ) {
          const namespace = extractStringLiteral(call.arguments[0]!)

          if (namespace) {
            translationsMap.set(declarator.id.name, {
              namespace,
              location: {
                file: '',
                line: declarator.loc?.start.line ?? 0,
                column: declarator.loc?.start.column ?? 0,
              },
            })
          }
        }
      }
    }
  })

  return translationsMap
}

function findTranslationCalls(
  ast: TSESTree.Program,
  translationsVars: Set<string>
): Array<{
  varName: string
  key: string
  keyType: TranslationCall['keyType']
  location: SourceLocation
}> {
  const calls: Array<{
    varName: string
    key: string
    keyType: TranslationCall['keyType']
    location: SourceLocation
  }> = []

  visit(ast, node => {
    if (
      node.type === 'CallExpression' &&
      (node as TSESTree.CallExpression).callee.type === 'Identifier'
    ) {
      const call = node as TSESTree.CallExpression

      if (
        call.callee.type === 'Identifier' &&
        translationsVars.has(call.callee.name) &&
        call.arguments.length > 0
      ) {
        const { key, keyType } = extractTranslationKey(call.arguments[0]!)

        calls.push({
          varName: call.callee.name,
          key,
          keyType,
          location: {
            file: '',
            line: call.loc?.start.line ?? 0,
            column: call.loc?.start.column ?? 0,
          },
        })
      }
    }
  })

  return calls
}

function parseFile(filePath: string): ParsedFile {
  const fileType = getFileType(filePath)

  try {
    const content = fs.readFileSync(filePath, 'utf8')

    const ast = parse(content, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      filePath,
    })

    const translationsDeclarations = findTranslationsDeclarations(ast)
    const translationsVars = new Set(translationsDeclarations.keys())
    const calls = findTranslationCalls(ast, translationsVars)

    const usages: TranslationUsage[] = []

    for (const [varName, { namespace, location }] of translationsDeclarations) {
      const varCalls = calls.filter(c => c.varName === varName)

      usages.push({
        variableName: varName,
        namespace,
        calls: varCalls.map(c => ({
          key: c.key,
          keyType: c.keyType,
          location: {
            file: filePath,
            line: c.location.line,
            column: c.location.column,
          },
        })),
        location: {
          file: filePath,
          line: location.line,
          column: location.column,
        },
      })
    }

    return { path: filePath, fileType, usages }
  } catch (error) {
    return {
      path: filePath,
      fileType,
      usages: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function findSourceFiles(dir: string): string[] {
  const files: string[] = []

  const traverse = (currentPath: string): void => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)

      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.next' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.git'
        ) {
          continue
        }
        traverse(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (ext === '.tsx' || ext === '.ts') {
          files.push(fullPath)
        }
      }
    }
  }

  traverse(dir)
  return files
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate namespace naming conventions
 */
function validateNamespaces(parsedFiles: ParsedFile[]): NamespaceViolation[] {
  const violations: NamespaceViolation[] = []

  const isPageTranslationVar = (varName: string): boolean => {
    return varName === 'tPage' || varName === 'tShared' || varName.endsWith('Page')
  }

  const isComponentTranslationVar = (varName: string): boolean => {
    return varName === 'tComponent' || varName === 'tShared' || varName.endsWith('Component')
  }

  const isAllowedNamespace = (fileType: FileType, namespace: string): boolean => {
    const ns = namespace.toLowerCase()

    if (fileType === FileType.PAGE) {
      return ns.startsWith('pages.') || ns === 'shared'
    }

    if (fileType === FileType.COMPONENT) {
      return ns.startsWith('components.') || ns === 'shared'
    }

    return true
  }

  for (const parsedFile of parsedFiles) {
    if (parsedFile.error || parsedFile.fileType === FileType.UNKNOWN) {
      continue
    }

    for (const usage of parsedFile.usages) {
      const { variableName, namespace, location } = usage

      const isVarNameAllowed =
        parsedFile.fileType === FileType.PAGE
          ? isPageTranslationVar(variableName)
          : isComponentTranslationVar(variableName)

      if (!isVarNameAllowed) {
        violations.push({
          file: parsedFile.path,
          line: location.line,
          column: location.column,
          fileType: parsedFile.fileType,
          variableName,
          namespace,
        })
        continue
      }

      if (!isAllowedNamespace(parsedFile.fileType, namespace)) {
        violations.push({
          file: parsedFile.path,
          line: location.line,
          column: location.column,
          fileType: parsedFile.fileType,
          variableName,
          namespace,
        })
      }
    }
  }

  return violations
}

/**
 * Validate translation key existence
 */
function validateTranslationKeys(
  parsedFiles: ParsedFile[],
  translationIndex: TranslationIndex
): MissingKeyViolation[] {
  const violations: MissingKeyViolation[] = []

  const keyExists = (key: string, namespace: string): boolean => {
    // Check if the key exists in the translation index
    // First try exact match in the namespace
    const namespaceFiles = translationIndex.byNamespace.get(namespace)
    if (namespaceFiles) {
      for (const file of namespaceFiles) {
        if (file.keys.has(key)) {
          return true
        }
      }
    }

    // Also check in the byKey index
    const keyNamespaces = translationIndex.byKey.get(key)
    if (keyNamespaces) {
      for (const ns of keyNamespaces) {
        // Check if this is a sub-namespace match
        if (ns === namespace || ns.startsWith(`${namespace}.`)) {
          return true
        }
      }
    }

    return false
  }

  for (const parsedFile of parsedFiles) {
    if (parsedFile.error) {
      continue
    }

    for (const usage of parsedFile.usages) {
      const { variableName, namespace, calls } = usage

      for (const call of calls) {
        const { key, keyType, location } = call

        if (keyType !== 'static') {
          continue
        }

        if (!keyExists(key, namespace)) {
          violations.push({
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
  }

  return violations
}

// ============================================================================
// Test Suite
// ============================================================================

describe('validate: i18n usage', () => {
  let translationIndex: TranslationIndex
  let parsedFiles: ParsedFile[]

  beforeAll(() => {
    // Load translation index
    translationIndex = loadTranslations()

    // Parse all source files
    const sourceFiles = findSourceFiles(SRC_DIR)
    parsedFiles = sourceFiles.map(parseFile)
  })

  it('translation variables follow naming conventions (tPage/tShared for pages, tComponent/tShared for components)', () => {
    const violations = validateNamespaces(parsedFiles)

    if (violations.length > 0) {
      const formattedViolations = violations.map(v => {
        const relativePath = path.relative(ROOT_DIR, v.file)
        const expectedPattern =
          v.fileType === FileType.PAGE
            ? 'tPage, tShared, or ending with Page'
            : 'tComponent, tShared, or ending with Component'
        return `  ${relativePath}:${v.line}:${v.column} - Variable "${v.variableName}" should follow ${expectedPattern} pattern (namespace: "${v.namespace}")`
      })

      throw new Error(
        `Translation namespace naming convention violations found:\n${formattedViolations.join('\n')}`
      )
    }
  })

  it('all used translation keys exist in translation files', () => {
    const violations = validateTranslationKeys(parsedFiles, translationIndex)

    if (violations.length > 0) {
      const formattedViolations = violations.map(v => {
        const relativePath = path.relative(ROOT_DIR, v.file)
        return `  ${relativePath}:${v.line}:${v.column} - Key "${v.key}" not found in namespace "${v.namespace}" (variable: ${v.variableName})`
      })

      throw new Error(`Missing translation keys found:\n${formattedViolations.join('\n')}`)
    }
  })
})
