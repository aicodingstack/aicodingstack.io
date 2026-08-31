import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ErrorObject, ValidateFunction } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export interface ManifestDataDocument {
  filePath: string
  relativePath: string
  schemaPath: string | null
  category: string | null
  data: unknown
}

export interface ManifestDataHarnessReport {
  documentsChecked: number
  schemasChecked: number
  documentsByRoot: Record<string, number>
  failures: string[]
}

function listJsonFiles(directory: string, skipSchemaDirectories = false): string[] {
  if (!fs.existsSync(directory)) return []

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      if (skipSchemaDirectories && entry.isDirectory() && entry.name === '$schemas') return []
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return listJsonFiles(entryPath, skipSchemaDirectories)
      return entry.isFile() && entry.name.endsWith('.json') ? [entryPath] : []
    })
    .sort()
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

function getLocalSchemaReference(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const schema = (data as Record<string, unknown>).$schema
  return typeof schema === 'string' && schema.startsWith('.') ? schema : null
}

function resolveConventionSchema(
  rootDir: string,
  filePath: string
): {
  category: string | null
  schemaPath: string | null
} {
  const relativePath = path.relative(rootDir, filePath)
  const segments = relativePath.split(path.sep)
  const basename = path.basename(filePath, '.json')

  if (segments[0] === 'manifests' && segments.length === 3) {
    const category = segments[1] ?? ''
    const singular = category.endsWith('s') ? category.slice(0, -1) : category
    return {
      category,
      schemaPath: path.join(rootDir, 'manifests', '$schemas', `${singular}.schema.json`),
    }
  }

  const schemaRoots =
    segments[0] === 'manifests'
      ? [path.join(rootDir, 'manifests', '$schemas')]
      : [path.join(rootDir, 'data', '$schemas'), path.join(rootDir, 'manifests', '$schemas')]
  const schemaPath = schemaRoots
    .map(schemaRoot => path.join(schemaRoot, `${basename}.schema.json`))
    .find(candidate => fs.existsSync(candidate))

  return { category: null, schemaPath: schemaPath ?? null }
}

export function discoverManifestData(rootDir: string): ManifestDataDocument[] {
  const files = [
    ...listJsonFiles(path.join(rootDir, 'manifests'), true),
    ...listJsonFiles(path.join(rootDir, 'data'), true),
  ].sort()

  return files.map(filePath => {
    let data: unknown = null
    try {
      data = readJson(filePath)
    } catch {
      // Parsing failures are reported by the validation pass.
    }

    const conventional = resolveConventionSchema(rootDir, filePath)
    const localSchemaReference = getLocalSchemaReference(data)
    const declaredSchemaPath = localSchemaReference
      ? path.resolve(path.dirname(filePath), localSchemaReference)
      : null

    return {
      filePath,
      relativePath: path.relative(rootDir, filePath).replaceAll(path.sep, '/'),
      schemaPath: conventional.schemaPath ?? declaredSchemaPath,
      category: conventional.category,
      data,
    }
  })
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) return 'unknown schema error'
  return errors
    .map(error => {
      const location = error.instancePath || '(root)'
      return `${location}: ${error.message ?? error.keyword}`
    })
    .join('; ')
}

function createSchemaRegistry(schemaPaths: string[]): {
  ajv: Ajv2020
  schemaKey: (schemaPath: string) => string
} {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictTypes: true,
    allowUnionTypes: true,
  })
  addFormats(ajv)

  const registered = new Set<string>()
  const schemaKey = (schemaPath: string) => pathToFileURL(schemaPath).href

  const registerSchema = (schemaPath: string): void => {
    const resolvedPath = path.resolve(schemaPath)
    if (registered.has(resolvedPath)) return
    registered.add(resolvedPath)

    const schema = structuredClone(readJson(resolvedPath)) as Record<string, unknown>
    schema.$id = schemaKey(resolvedPath)

    const rewriteReferences = (value: unknown): void => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) {
        for (const item of value) rewriteReferences(item)
        return
      }

      const record = value as Record<string, unknown>
      if (typeof record.$ref === 'string' && record.$ref.startsWith('.')) {
        const [referencePath, fragment] = record.$ref.split('#', 2)
        const referencedSchemaPath = path.resolve(path.dirname(resolvedPath), referencePath ?? '')
        registerSchema(referencedSchemaPath)
        record.$ref = `${schemaKey(referencedSchemaPath)}${fragment ? `#${fragment}` : ''}`
      }

      for (const child of Object.values(record)) rewriteReferences(child)
    }

    rewriteReferences(schema)
    ajv.addSchema(schema)
  }

  for (const schemaPath of schemaPaths) registerSchema(schemaPath)
  return { ajv, schemaKey }
}

export function runManifestDataHarness(rootDir: string): ManifestDataHarnessReport {
  const failures: string[] = []
  const documents = discoverManifestData(rootDir)
  const allSchemaPaths = [
    ...listJsonFiles(path.join(rootDir, 'manifests', '$schemas')),
    ...listJsonFiles(path.join(rootDir, 'data', '$schemas')),
  ]
  const documentsByRoot = { manifests: 0, data: 0 }

  for (const document of documents) {
    const root = document.relativePath.split('/')[0]
    if (root === 'manifests' || root === 'data') documentsByRoot[root]++

    try {
      document.data = readJson(document.filePath)
    } catch (error) {
      failures.push(`${document.relativePath}: invalid JSON: ${(error as Error).message}`)
      continue
    }

    if (!document.schemaPath) {
      failures.push(`${document.relativePath}: no schema discovered`)
      continue
    }
    if (!fs.existsSync(document.schemaPath)) {
      failures.push(
        `${document.relativePath}: schema does not exist: ${path.relative(rootDir, document.schemaPath)}`
      )
      continue
    }

    const declaredReference = getLocalSchemaReference(document.data)
    if (declaredReference) {
      const declaredPath = path.resolve(path.dirname(document.filePath), declaredReference)
      if (declaredPath !== path.resolve(document.schemaPath)) {
        failures.push(
          `${document.relativePath}: declared schema does not match discovered schema ${path.relative(rootDir, document.schemaPath)}`
        )
      }
    }
  }

  let registry: ReturnType<typeof createSchemaRegistry> | null = null
  try {
    registry = createSchemaRegistry(allSchemaPaths)
    for (const schemaPath of allSchemaPaths) {
      registry.ajv.getSchema(registry.schemaKey(schemaPath))
    }
  } catch (error) {
    failures.push(`schema registry: ${(error as Error).message}`)
  }

  if (registry) {
    for (const document of documents) {
      if (!document.schemaPath || !fs.existsSync(document.schemaPath)) continue
      let validate: ValidateFunction | undefined
      try {
        validate = registry.ajv.getSchema(registry.schemaKey(document.schemaPath))
      } catch (error) {
        failures.push(
          `${document.relativePath}: schema compilation failed: ${(error as Error).message}`
        )
        continue
      }
      if (!validate) {
        failures.push(`${document.relativePath}: schema was not registered`)
        continue
      }
      if (!validate(document.data)) {
        failures.push(`${document.relativePath}: ${formatAjvErrors(validate.errors)}`)
      }

      if (document.category) {
        const expectedId = path.basename(document.filePath, '.json')
        const actualId =
          document.data && typeof document.data === 'object' && !Array.isArray(document.data)
            ? (document.data as Record<string, unknown>).id
            : undefined
        if (actualId !== expectedId) {
          failures.push(
            `${document.relativePath}: filename/id mismatch (expected ${expectedId}, received ${String(actualId)})`
          )
        }
      }
    }
  }

  return {
    documentsChecked: documents.length,
    schemasChecked: allSchemaPaths.length,
    documentsByRoot,
    failures: failures.sort(),
  }
}
