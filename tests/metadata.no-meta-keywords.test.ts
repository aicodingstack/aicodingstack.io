import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  createPageMetadata,
  createRootLayoutMetadata,
  type PageMetadataOptions,
  type RootLayoutMetadataOptions,
} from '@/lib/metadata/templates'

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return collectSourceFiles(path)
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
  })
}

function hasExportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node)
    ? ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ===
        true
    : false
}

function propertyNameIsKeywords(name: ts.PropertyName | undefined): boolean {
  if (!name) return false
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text === 'keywords'
  }
  return false
}

function objectDefinesKeywords(node: ts.ObjectLiteralExpression): boolean {
  return node.properties.some(property => {
    if (ts.isShorthandPropertyAssignment(property)) return property.name.text === 'keywords'
    return propertyNameIsKeywords(property.name)
  })
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  if (
    ts.isAwaitExpression(expression) ||
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isTypeAssertionExpression(expression)
  ) {
    return unwrapExpression(expression.expression)
  }
  return expression
}

function findKeywordDefinitionsInMetadataExpression(
  expression: ts.Expression,
  initializers: ReadonlyMap<string, ts.Expression>,
  seenIdentifiers = new Set<string>()
): ts.ObjectLiteralExpression[] {
  const unwrapped = unwrapExpression(expression)

  if (ts.isObjectLiteralExpression(unwrapped)) {
    return objectDefinesKeywords(unwrapped) ? [unwrapped] : []
  }

  if (ts.isIdentifier(unwrapped)) {
    if (seenIdentifiers.has(unwrapped.text)) return []
    const initializer = initializers.get(unwrapped.text)
    if (!initializer) return []

    seenIdentifiers.add(unwrapped.text)
    return findKeywordDefinitionsInMetadataExpression(initializer, initializers, seenIdentifiers)
  }

  if (ts.isConditionalExpression(unwrapped)) {
    return [
      ...findKeywordDefinitionsInMetadataExpression(
        unwrapped.whenTrue,
        initializers,
        new Set(seenIdentifiers)
      ),
      ...findKeywordDefinitionsInMetadataExpression(
        unwrapped.whenFalse,
        initializers,
        new Set(seenIdentifiers)
      ),
    ]
  }

  if (ts.isCallExpression(unwrapped)) {
    return unwrapped.arguments.flatMap(argument => {
      const value = unwrapExpression(argument)
      return ts.isObjectLiteralExpression(value) && objectDefinesKeywords(value) ? [value] : []
    })
  }

  return []
}

function findMetaKeywordLines(sourceText: string, fileName: string): number[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const offenders: ts.ObjectLiteralExpression[] = []

  for (const statement of sourceFile.statements) {
    if (
      ts.isVariableStatement(statement) &&
      hasExportModifier(statement) &&
      statement.declarationList.declarations.some(
        declaration => ts.isIdentifier(declaration.name) && declaration.name.text === 'metadata'
      )
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === 'metadata' &&
          declaration.initializer
        ) {
          offenders.push(
            ...findKeywordDefinitionsInMetadataExpression(declaration.initializer, new Map())
          )
        }
      }
    }

    if (
      ts.isFunctionDeclaration(statement) &&
      hasExportModifier(statement) &&
      statement.name?.text === 'generateMetadata' &&
      statement.body
    ) {
      const initializers = new Map<string, ts.Expression>()

      const collectInitializers = (node: ts.Node): void => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
          initializers.set(node.name.text, node.initializer)
        }
        ts.forEachChild(node, collectInitializers)
      }
      collectInitializers(statement.body)

      const inspectReturns = (node: ts.Node): void => {
        if (ts.isReturnStatement(node) && node.expression) {
          offenders.push(
            ...findKeywordDefinitionsInMetadataExpression(node.expression, initializers)
          )
        }
        ts.forEachChild(node, inspectReturns)
      }
      inspectReturns(statement.body)
    }
  }

  return offenders.map(node => sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1)
}

describe('metadata keyword guardrail', () => {
  it('does not define ignored keywords in Next.js route metadata', () => {
    const routeFiles = collectSourceFiles(join(process.cwd(), 'src/app'))
    const offenders = routeFiles.flatMap(file =>
      findMetaKeywordLines(readFileSync(file, 'utf8'), file).map(
        line => `${file.replace(`${process.cwd()}/`, '')}:${line}`
      )
    )

    expect(offenders).toEqual([])
  })

  it('allows keywords in unrelated structured data', () => {
    const source = `
      export default function Page() {
        const articleSchema = { '@type': 'Article', keywords: ['AI coding'] }
        return <JsonLd data={articleSchema} />
      }
    `

    expect(findMetaKeywordLines(source, 'page.tsx')).toEqual([])
  })

  it('detects keywords on static and generated route metadata', () => {
    const source = `export const metadata = { title: 'Example', keywords: ['ignored'] }

      export function generateMetadata() {
        const result = { title: 'Example', keywords: 'ignored' }
        return result
      }
    `

    expect(findMetaKeywordLines(source, 'page.tsx')).toEqual([1, 4])
  })

  it('central metadata templates ignore unsupported keyword options', () => {
    const pageOptions: PageMetadataOptions & { keywords: string } = {
      locale: 'en',
      pageType: 'static',
      title: 'Example',
      description: 'Example description',
      canonical: '/example',
      keywords: 'ignored',
    }
    const rootOptions: RootLayoutMetadataOptions & { keywords: string } = {
      locale: 'en',
      title: 'Example',
      description: 'Example description',
      canonical: '/',
      languageAlternates: { en: '/' },
      openGraph: {},
      twitter: {},
      keywords: 'ignored',
    }

    expect(createPageMetadata(pageOptions).keywords).toBeUndefined()
    expect(createRootLayoutMetadata(rootOptions).keywords).toBeUndefined()
  })
})
