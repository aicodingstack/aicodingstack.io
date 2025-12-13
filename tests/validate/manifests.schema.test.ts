import fs from 'node:fs'
import path from 'node:path'
import type { ErrorObject } from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, it } from 'vitest'

/**
 * Create an Ajv instance aligned with the repository's manifest validation behavior.
 */
function createAjv() {
  const ajv = new Ajv2020({
    allErrors: true,
    verbose: true,
    strict: true,
    strictTypes: true,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  return ajv
}

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Format Ajv errors into stable, human-readable lines.
 */
function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors || errors.length === 0) {
    return []
  }

  return errors.map(err => {
    const instancePath = err.instancePath || '(root)'
    if (err.keyword === 'required') {
      return `${instancePath}: missing required field ${(err.params as { missingProperty: string }).missingProperty}`
    }
    if (err.keyword === 'additionalProperties') {
      return `${instancePath}: additional property not allowed ${(err.params as { additionalProperty: string }).additionalProperty}`
    }
    if (err.keyword === 'enum') {
      const allowed = (err.params as { allowedValues: unknown[] }).allowedValues
      return `${instancePath}: ${err.message} (allowed: ${allowed.join(', ')})`
    }
    if (err.keyword === 'format') {
      const format = (err.params as { format: string }).format
      return `${instancePath}: ${err.message} (expected format: ${format})`
    }
    return `${instancePath}: ${err.message ?? 'validation error'}`
  })
}

/**
 * Add base ref schemas into Ajv to support $ref resolution used by top-level schemas.
 */
function loadBaseSchemas(ajv: ReturnType<typeof createAjv>, schemasDir: string) {
  const refDir = path.join(schemasDir, 'ref')
  const toAdd = [
    'translations.schema.json',
    'community-urls.schema.json',
    'platform-urls.schema.json',
    'entity.schema.json',
    'vendor-entity.schema.json',
    'product.schema.json',
    'app.schema.json',
  ]

  for (const name of toAdd) {
    const schemaPath = path.join(refDir, name)
    if (!fs.existsSync(schemaPath)) {
      continue
    }
    const schema = readJsonFile(schemaPath)
    ajv.addSchema(schema, name)
  }
}

/**
 * Resolve relative $ref entries of the form "./ref/foo.schema.json" to Ajv schema IDs (basenames).
 */
function resolveRelativeRefs(obj: unknown, baseDir: string, ajv: ReturnType<typeof createAjv>) {
  if (obj === null || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    for (const item of obj) resolveRelativeRefs(item, baseDir, ajv)
    return
  }

  const record = obj as Record<string, unknown>
  const ref = record.$ref
  if (typeof ref === 'string' && ref.startsWith('./')) {
    const refPath = path.resolve(baseDir, ref)
    if (fs.existsSync(refPath)) {
      const refSchema = readJsonFile(refPath)
      const refId = path.basename(refPath)
      if (!ajv.getSchema(refId)) {
        ajv.addSchema(refSchema, refId)
      }
      record.$ref = refId
    }
  }

  for (const value of Object.values(record)) {
    resolveRelativeRefs(value, baseDir, ajv)
  }
}

/**
 * Load a top-level schema and prepare it for validation by resolving relative $ref.
 */
function loadSchema(schemaPath: string, ajv: ReturnType<typeof createAjv>): unknown {
  const schema = readJsonFile(schemaPath)
  resolveRelativeRefs(schema, path.dirname(schemaPath), ajv)
  return schema
}

/**
 * Validate all manifests on disk against their schemas.
 * Mirrors behavior of scripts/validate/validate-manifests.mjs.
 */
function validateAllManifests(rootDir: string): string[] {
  const failures: string[] = []
  const manifestsDir = path.join(rootDir, 'manifests')
  const schemasDir = path.join(manifestsDir, '$schemas')

  const ajv = createAjv()
  loadBaseSchemas(ajv, schemasDir)

  const manifestSchemaMap: Record<string, string> = {
    clis: 'cli.schema.json',
    ides: 'ide.schema.json',
    extensions: 'extension.schema.json',
    providers: 'provider.schema.json',
    models: 'model.schema.json',
    vendors: 'vendor.schema.json',
  }

  const singleFileSchemas: Record<string, string> = {
    'collections.json': 'collections.schema.json',
  }

  for (const [dirName, schemaFile] of Object.entries(manifestSchemaMap)) {
    const dirPath = path.join(manifestsDir, dirName)
    const schemaPath = path.join(schemasDir, schemaFile)
    if (!fs.existsSync(dirPath) || !fs.existsSync(schemaPath)) {
      continue
    }

    const fullSchema = loadSchema(schemaPath, ajv) as {
      type?: unknown
      items?: unknown
      $defs?: unknown
    }
    const schemaToUse =
      fullSchema.type === 'array' && fullSchema.items
        ? ({
            ...(fullSchema.items as object),
            ...(fullSchema.$defs ? { $defs: fullSchema.$defs } : {}),
          } as object)
        : (fullSchema as object)

    const validate = ajv.compile(schemaToUse)
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const expectedId = path.basename(file, '.json')
      let data: unknown
      try {
        data = readJsonFile(filePath)
      } catch (error) {
        failures.push(`[${dirName}/${file}] JSON parse error: ${(error as Error).message}`)
        continue
      }

      const ok = validate(data)
      if (!ok) {
        const lines = formatAjvErrors(validate.errors)
        failures.push(`[${dirName}/${file}] schema errors:\n${lines.map(l => `- ${l}`).join('\n')}`)
        continue
      }

      if (typeof data === 'object' && data !== null && 'id' in (data as Record<string, unknown>)) {
        const actualId = (data as Record<string, unknown>).id
        if (actualId !== expectedId) {
          failures.push(
            `[${dirName}/${file}] filename/id mismatch: expected "${expectedId}" but got "${String(actualId)}"`
          )
        }
      } else {
        failures.push(`[${dirName}/${file}] missing 'id' field for filename check`)
      }
    }
  }

  for (const [manifestFile, schemaFile] of Object.entries(singleFileSchemas)) {
    const manifestPath = path.join(manifestsDir, manifestFile)
    const schemaPath = path.join(schemasDir, schemaFile)
    if (!fs.existsSync(manifestPath) || !fs.existsSync(schemaPath)) {
      continue
    }

    let data: unknown
    try {
      data = readJsonFile(manifestPath)
    } catch (error) {
      failures.push(`[${manifestFile}] JSON parse error: ${(error as Error).message}`)
      continue
    }

    const schema = loadSchema(schemaPath, ajv)
    const validate = ajv.compile(schema as object)
    const ok = validate(data)
    if (!ok) {
      const lines = formatAjvErrors(validate.errors)
      failures.push(`[${manifestFile}] schema errors:\n${lines.map(l => `- ${l}`).join('\n')}`)
    }
  }

  return failures
}

describe('validate: manifests schema', () => {
  it('all manifest JSON files match their schemas', () => {
    const failures = validateAllManifests(process.cwd())
    if (failures.length > 0) {
      throw new Error(`Manifest schema validation failed:\n\n${failures.join('\n\n')}`)
    }
  })
})
