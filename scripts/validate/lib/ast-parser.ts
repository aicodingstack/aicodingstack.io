/**
 * AST Parser for extracting translation usage from TSX/TS files
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@typescript-eslint/parser'
import type { TSESTree } from '@typescript-eslint/types'
import type { ParsedFile, SourceLocation, TranslationCall, TranslationUsage } from './types.js'
import { FileType } from './types.js'

/**
 * Determine file type based on path
 */
export function getFileType(filePath: string): FileType {
  const normalizedPath = path.normalize(filePath)

  // Pages: src/app/[locale]/**/page*.tsx
  if (normalizedPath.includes('src/app/[locale]')) {
    return FileType.PAGE
  }

  // Components: src/components/**/*.tsx
  if (normalizedPath.includes('src/components')) {
    return FileType.COMPONENT
  }

  return FileType.UNKNOWN
}

/**
 * Extract string literal value from a node
 */
function extractStringLiteral(node: TSESTree.Node): string | null {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') {
      return node.value
    }
  }
  return null
}

/**
 * Check if a node is a template literal with expressions
 */
function isTemplateLiteralWithExpressions(node: TSESTree.Node): boolean {
  return node.type === 'TemplateLiteral' && node.expressions.length > 0
}

/**
 * Check if a node is a binary expression (string concatenation)
 */
function isBinaryExpression(node: TSESTree.Node): boolean {
  if (node.type === 'BinaryExpression') {
    return true
  }
  return false
}

/**
 * Determine the key type based on the AST node
 */
function getKeyType(node: TSESTree.CallExpressionArgument): TranslationCall['keyType'] {
  if (isTemplateLiteralWithExpressions(node)) {
    return 'dynamic'
  }
  if (isBinaryExpression(node)) {
    return 'dynamic'
  }
  if (node.type === 'Identifier' || node.type === 'MemberExpression') {
    return 'dynamic'
  }
  if (extractStringLiteral(node) !== null) {
    return 'static'
  }
  return 'partial'
}

/**
 * Extract translation key from a call expression argument
 */
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

/**
 * Visit all nodes in the AST
 */
function visit(ast: TSESTree.Program, visitor: (node: TSESTree.Node) => void): void {
  const stack: TSESTree.Node[] = [ast]

  while (stack.length > 0) {
    const node = stack.pop()!
    visitor(node)

    // Push children onto stack
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

/**
 * Find all useTranslations declarations in the AST
 */
function findTranslationsDeclarations(
  ast: TSESTree.Program
): Map<string, { namespace: string; location: SourceLocation }> {
  const translationsMap = new Map<string, { namespace: string; location: SourceLocation }>()

  visit(ast, node => {
    // Look for: const tX = useTranslations('namespace')
    if (node.type === 'VariableDeclarator') {
      const declarator = node as TSESTree.VariableDeclarator

      if (declarator.id.type === 'Identifier' && declarator.init) {
        const varName = declarator.id.name

        // Check if it's a call expression
        if (declarator.init.type === 'CallExpression') {
          const call = declarator.init

          // Check if callee is useTranslations
          if (call.callee.type === 'Identifier' && call.callee.name === 'useTranslations') {
            // Extract namespace argument
            if (call.arguments.length > 0) {
              const namespaceArg = call.arguments[0]
              if (namespaceArg) {
                const namespace = extractStringLiteral(namespaceArg)

                if (namespace) {
                  translationsMap.set(varName, {
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
        }
      }
    }
  })

  return translationsMap
}

/**
 * Find all translation function calls in the AST
 */
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
    // Look for: tX('key') or tX('key', options)
    if (node.type === 'CallExpression') {
      const call = node as TSESTree.CallExpression

      // Check if callee is a translation variable
      if (call.callee.type === 'Identifier' && translationsVars.has(call.callee.name)) {
        const varName = call.callee.name

        // Extract key argument
        if (call.arguments.length > 0) {
          const keyArg = call.arguments[0]
          if (keyArg) {
            const { key, keyType } = extractTranslationKey(keyArg)

            calls.push({
              varName,
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
      }
    }
  })

  return calls
}

/**
 * Parse a single file and extract translation usage
 */
export function parseFile(filePath: string): ParsedFile {
  const fileType = getFileType(filePath)

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    const ast = parse(content, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      ecmaFeatures: {
        jsx: true,
      },
      filePath,
    })

    // Find all useTranslations declarations
    const translationsDeclarations = findTranslationsDeclarations(ast)
    const translationsVars = new Set(translationsDeclarations.keys())

    // Find all translation calls
    const calls = findTranslationCalls(ast, translationsVars)

    // Group calls by variable name
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

    return {
      path: filePath,
      fileType,
      usages,
    }
  } catch (error) {
    return {
      path: filePath,
      fileType,
      usages: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Find all TSX/TS files in a directory recursively
 */
export function findSourceFiles(dir: string, extensions: string[] = ['.tsx', '.ts']): string[] {
  const files: string[] = []

  const traverse = (currentPath: string): void => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
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
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  traverse(dir)

  return files
}

/**
 * Filter files by type (pages or components)
 */
export function filterFilesByType(files: string[], fileType: FileType): string[] {
  return files.filter(file => getFileType(file) === fileType)
}
