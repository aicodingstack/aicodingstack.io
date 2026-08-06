import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Extract required fields from a JSON schema, including inherited `allOf` refs.
 */
function getRequiredFields(schema: unknown, schemaPath: string, schemasDir: string): Set<string> {
  const required = new Set<string>()
  if (schema === null || typeof schema !== 'object') return required
  const record = schema as Record<string, unknown>

  if (Array.isArray(record.required)) {
    for (const field of record.required) {
      if (typeof field === 'string') required.add(field)
    }
  }

  const allOf = record.allOf
  if (Array.isArray(allOf)) {
    for (const subSchema of allOf) {
      if (
        subSchema &&
        typeof subSchema === 'object' &&
        '$ref' in (subSchema as Record<string, unknown>)
      ) {
        const ref = (subSchema as Record<string, unknown>).$ref
        if (typeof ref === 'string') {
          const schemaDir = schemaPath ? path.dirname(schemaPath) : schemasDir
          const refPath = path.resolve(schemaDir, ref)
          if (fs.existsSync(refPath)) {
            const refSchema = readJsonFile(refPath)
            for (const field of getRequiredFields(refSchema, refPath, schemasDir)) {
              required.add(field)
            }
          }
        }
      } else {
        for (const field of getRequiredFields(subSchema, schemaPath, schemasDir)) {
          required.add(field)
        }
      }
    }
  }

  return required
}

/**
 * Parse a TypeScript interface and return its fields with optional flags.
 */
function parseTypeScriptInterface(
  content: string,
  interfaceName: string
): Record<string, { optional: boolean; type: string }> | null {
  const interfaceRegex = new RegExp(
    `export\\s+interface\\s+${interfaceName}\\s*(?:extends\\s+([^{]+?))?\\s*\\{`,
    's'
  )
  const match = content.match(interfaceRegex)
  if (!match) return null

  const extendsClause = match[1]?.trim()
  const startIndex = (match.index ?? 0) + match[0].length

  let braceCount = 1
  let endIndex = startIndex
  while (braceCount > 0 && endIndex < content.length) {
    if (content[endIndex] === '{') braceCount++
    if (content[endIndex] === '}') braceCount--
    endIndex++
  }

  const interfaceBody = content.substring(startIndex, endIndex - 1)
  const fields: Record<string, { optional: boolean; type: string }> = {}

  const lines = interfaceBody.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    const fieldMatch = trimmed.match(/^(\w+)(\?)?\s*:\s*(.+)$/)
    if (fieldMatch) {
      const name = fieldMatch[1] as string
      const optional = fieldMatch[2] === '?'
      const type = fieldMatch[3]?.trim() ?? 'unknown'
      fields[name] = { optional, type }
    }
  }

  if (extendsClause) {
    const parentInterfaces = extendsClause.split(',').map(i => i.trim())
    for (const parentName of parentInterfaces) {
      const parentFields = parseTypeScriptInterface(content, parentName)
      if (!parentFields) continue
      for (const [key, value] of Object.entries(parentFields)) {
        if (!(key in fields)) fields[key] = value
      }
    }
  }

  return fields
}

/**
 * Validate alignment between TypeScript interfaces and JSON schemas.
 */
function validateTypesAlignment(rootDir: string): string[] {
  const failures: string[] = []
  const schemasDir = path.join(rootDir, 'manifests', '$schemas')
  const typesFile = path.join(rootDir, 'src', 'types', 'manifests.ts')
  const typesContent = fs.readFileSync(typesFile, 'utf8')

  const checks = [
    {
      schema: path.join(schemasDir, 'ref', 'entity.schema.json'),
      iface: 'ManifestEntity',
      name: 'Base Entity',
    },
    {
      schema: path.join(schemasDir, 'ref', 'vendor-entity.schema.json'),
      iface: 'ManifestVendorEntity',
      name: 'Vendor Entity',
    },
    {
      schema: path.join(schemasDir, 'ref', 'product.schema.json'),
      iface: 'ManifestBaseProduct',
      name: 'Base Product',
    },
    {
      schema: path.join(schemasDir, 'ide.schema.json'),
      iface: 'ManifestIDE',
      name: 'IDE',
    },
    {
      schema: path.join(schemasDir, 'cli.schema.json'),
      iface: 'ManifestCLI',
      name: 'CLI',
    },
    {
      schema: path.join(schemasDir, 'desktop.schema.json'),
      iface: 'ManifestDesktop',
      name: 'Desktop',
    },
  ] as const

  for (const check of checks) {
    const schema = readJsonFile(check.schema)
    const tsFields = parseTypeScriptInterface(typesContent, check.iface)
    if (!tsFields) {
      failures.push(`[${check.name}] interface ${check.iface} not found in src/types/manifests.ts`)
      continue
    }

    const requiredFields = getRequiredFields(schema, check.schema, schemasDir)
    const issues: string[] = []

    for (const field of requiredFields) {
      if (!(field in tsFields)) {
        issues.push(`required field '${field}' from schema is missing in TypeScript interface`)
      } else if (tsFields[field]?.optional) {
        issues.push(`field '${field}' is required in schema but optional in TypeScript interface`)
      }
    }

    // Preserve the special-case check present in the original script.
    if (!('translations' in tsFields) && 'i18n' in tsFields) {
      issues.push("schema uses 'translations' but TypeScript uses 'i18n'")
    }

    if (issues.length > 0) {
      failures.push(
        `[${check.name}] ${check.iface} issues:\n${issues.map(i => `- ${i}`).join('\n')}`
      )
    }
  }

  return failures
}

describe('validate: types alignment', () => {
  it('TypeScript manifest interfaces align with JSON schemas', () => {
    const failures = validateTypesAlignment(process.cwd())
    if (failures.length > 0) {
      throw new Error(`Type alignment validation failed:\n\n${failures.join('\n\n')}`)
    }
  })

  it('keeps supported IDE identifiers aligned between the extension schema and TypeScript', () => {
    const rootDir = process.cwd()
    const schema = readJsonFile(
      path.join(rootDir, 'manifests', '$schemas', 'extension.schema.json')
    ) as {
      $defs: { ideSupport: { properties: { ideId: { enum: string[] } } } }
    }
    const typesContent = fs.readFileSync(path.join(rootDir, 'src', 'types', 'manifests.ts'), 'utf8')
    const ideIdType = typesContent.match(/export interface ManifestIDESupport \{\s+ideId: ([^\n]+)/)

    if (!ideIdType?.[1]) {
      throw new Error('ManifestIDESupport.ideId union not found in src/types/manifests.ts')
    }

    const typeIds = [...ideIdType[1].matchAll(/'([^']+)'/g)].map(match => match[1]).sort()
    const schemaIds = [...schema.$defs.ideSupport.properties.ideId.enum].sort()

    if (JSON.stringify(typeIds) !== JSON.stringify(schemaIds)) {
      throw new Error(
        `Supported IDE identifiers differ: schema=${schemaIds.join(', ')} types=${typeIds.join(', ')}`
      )
    }
  })
})
