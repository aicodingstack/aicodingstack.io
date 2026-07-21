#!/usr/bin/env node

/**
 * Sort fields in manifest JSON files according to their schema definitions
 * This script reads each manifest file and its corresponding schema,
 * then reorders the fields in the manifest to match the schema's property order.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const MANIFESTS_DIR = path.join(ROOT_DIR, 'manifests')
const SCHEMAS_DIR = path.join(MANIFESTS_DIR, '$schemas')

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

interface Schema {
  $ref?: string
  allOf?: Schema[]
  properties?: Record<string, Schema>
  items?: Schema
  type?: string
  patternProperties?: Record<string, Schema>
  $defs?: Record<string, Schema>
}

interface ManifestCategory {
  dir: string
  schema: string
}

interface CategoryStats {
  total: number
  processed: number
  errors: number
  validationErrors: number
}

interface Stats {
  totalFiles: number
  processedFiles: number
  errorFiles: number
  totalErrors: number
  categories: Record<string, CategoryStats>
}

interface ValidationError {
  field: string
  location: string
  path: (string | number)[]
}

// Cache for loaded schemas to avoid redundant reads
const schemaCache = new Map<string, Schema>()

/**
 * Load and parse a JSON file
 */
async function loadJSON(filePath: string): Promise<JsonValue> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '')
    // Trim whitespace
    const trimmedContent = cleanContent.trim()

    if (!trimmedContent) {
      throw new Error('File is empty')
    }

    return JSON.parse(trimmedContent)
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Get file stats for debugging
      const stats = await fs.stat(filePath).catch(() => null)
      const size = stats ? stats.size : 'unknown'
      throw new Error(
        `JSON parse error: ${error.message} (file size: ${size} bytes, path: ${filePath})`
      )
    }
    throw error
  }
}

/**
 * Resolve a $ref path to an absolute file path or return the path for internal references
 * Returns null for internal references (handled separately), or the resolved file path
 */
function resolveRefPath(refPath: string, baseSchemaPath: string): string | null {
  if (refPath.startsWith('#/')) {
    // Internal reference within the same schema (e.g., #/$defs/collectionSection)
    // Return null to indicate it should be resolved from the same schema
    return null
  }

  const schemaDir = path.dirname(baseSchemaPath)
  return path.resolve(schemaDir, refPath)
}

/**
 * Resolve an internal reference (e.g., #/$defs/collectionSection) from a schema
 */
function resolveInternalRef(refPath: string, schema: Schema): Schema | null {
  if (!refPath.startsWith('#/')) {
    return null
  }

  // Remove the #/ prefix
  const pathParts = refPath.slice(2).split('/')
  let current: JsonValue = schema as JsonValue

  for (const part of pathParts) {
    if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
      const next = (current as Record<string, JsonValue>)[part]
      if (next === undefined) return null
      current = next
    } else {
      return null
    }
  }

  return current as Schema
}

/**
 * Extract property order from a schema definition
 * Returns an array of property names in the order they appear in the schema
 */
async function extractPropertyOrder(schema: Schema, schemaPath: string): Promise<string[]> {
  const propertyOrder: string[] = []

  // Handle $ref at the root level
  if (schema.$ref) {
    const refPath = resolveRefPath(schema.$ref, schemaPath)
    if (refPath) {
      // External reference - load from file
      const refSchema = await loadSchema(refPath)
      const refOrder = await extractPropertyOrder(refSchema, refPath)
      propertyOrder.push(...refOrder)
    } else {
      // Internal reference - resolve from current schema
      const currentSchema = await loadSchema(schemaPath)
      const refSchema = resolveInternalRef(schema.$ref, currentSchema)
      if (refSchema) {
        const refOrder = await extractPropertyOrder(refSchema, schemaPath)
        propertyOrder.push(...refOrder)
      }
    }
  }

  // Handle allOf - merge properties from all schemas
  if (schema.allOf) {
    const currentSchema = await loadSchema(schemaPath)
    for (const subSchema of schema.allOf) {
      // Handle $ref in allOf
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath)
        if (refPath) {
          // External reference
          const refSchema = await loadSchema(refPath)
          const refOrder = await extractPropertyOrder(refSchema, refPath)
          propertyOrder.push(...refOrder)
        } else {
          // Internal reference
          const refSchema = resolveInternalRef(subSchema.$ref, currentSchema)
          if (refSchema) {
            const refOrder = await extractPropertyOrder(refSchema, schemaPath)
            propertyOrder.push(...refOrder)
          }
        }
      } else {
        // Direct schema definition
        const subOrder = await extractPropertyOrder(subSchema, schemaPath)
        propertyOrder.push(...subOrder)
      }
    }
  }

  // Handle properties directly defined in this schema
  if (schema.properties) {
    for (const propName of Object.keys(schema.properties)) {
      if (!propertyOrder.includes(propName)) {
        propertyOrder.push(propName)
      }
    }
  }

  return propertyOrder
}

/**
 * Load a schema file with caching
 */
async function loadSchema(schemaPath: string): Promise<Schema> {
  if (schemaCache.has(schemaPath)) {
    return schemaCache.get(schemaPath) as Schema
  }

  const schema = (await loadJSON(schemaPath)) as Schema
  schemaCache.set(schemaPath, schema)
  return schema
}

/**
 * Find all nested property orders from a schema
 */
async function findAllNestedOrders(
  schema: Schema,
  schemaPath: string,
  parentPath: string[] = []
): Promise<Map<string, string[]>> {
  const nestedOrders = new Map<string, string[]>()

  // Handle allOf
  if (schema.allOf) {
    const currentSchema = await loadSchema(schemaPath)
    for (const subSchema of schema.allOf) {
      // Handle $ref in allOf
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath)
        let refSchema: Schema | null = null
        let refSchemaPath = schemaPath

        if (refPath) {
          // External reference
          refSchema = await loadSchema(refPath)
          refSchemaPath = refPath
        } else {
          // Internal reference
          refSchema = resolveInternalRef(subSchema.$ref, currentSchema)
        }

        if (refSchema) {
          const subOrders = await findAllNestedOrders(refSchema, refSchemaPath, parentPath)
          for (const [key, value] of subOrders) {
            nestedOrders.set(key, value)
          }
        }
      } else {
        // Direct schema definition
        const subOrders = await findAllNestedOrders(subSchema, schemaPath, parentPath)
        for (const [key, value] of subOrders) {
          nestedOrders.set(key, value)
        }
      }
    }
  }

  // Handle properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const currentPath = [...parentPath, propName]
      const pathKey = currentPath.join('.')

      // Handle $ref
      if (propSchema.$ref) {
        const refPath = resolveRefPath(propSchema.$ref, schemaPath)
        const currentSchema = await loadSchema(schemaPath)
        let refSchema: Schema | null = null
        let refSchemaPath = schemaPath

        if (refPath) {
          // External reference
          refSchema = await loadSchema(refPath)
          refSchemaPath = refPath
        } else {
          // Internal reference
          refSchema = resolveInternalRef(propSchema.$ref, currentSchema)
        }

        if (refSchema) {
          const order = await extractPropertyOrder(refSchema, refSchemaPath)
          if (order.length > 0) {
            nestedOrders.set(pathKey, order)
          }

          // Recursively find nested orders in the referenced schema
          const refNestedOrders = await findAllNestedOrders(refSchema, refSchemaPath, [])
          for (const [nestedPath, nestedOrder] of refNestedOrders) {
            nestedOrders.set(`${pathKey}.${nestedPath}`, nestedOrder)
          }
        }
      }

      // Handle direct object properties
      if (propSchema.properties) {
        const order = Object.keys(propSchema.properties)
        nestedOrders.set(pathKey, order)

        // Recursively handle nested objects
        const deepOrders = await findAllNestedOrders(propSchema, schemaPath, [
          ...parentPath,
          propName,
        ])
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value)
        }
      }

      // Handle array items
      if (propSchema.items) {
        const itemsPath = `${pathKey}.items`
        if (propSchema.items.$ref) {
          const refPath = resolveRefPath(propSchema.items.$ref, schemaPath)
          const currentSchema = await loadSchema(schemaPath)
          let refSchema: Schema | null = null
          let refSchemaPath = schemaPath

          if (refPath) {
            // External reference
            refSchema = await loadSchema(refPath)
            refSchemaPath = refPath
          } else {
            // Internal reference
            refSchema = resolveInternalRef(propSchema.items.$ref, currentSchema)
          }

          if (refSchema) {
            const order = await extractPropertyOrder(refSchema, refSchemaPath)
            if (order.length > 0) {
              nestedOrders.set(itemsPath, order)
            }

            const refNestedOrders = await findAllNestedOrders(refSchema, refSchemaPath, [])
            for (const [nestedPath, nestedOrder] of refNestedOrders) {
              nestedOrders.set(`${itemsPath}.${nestedPath}`, nestedOrder)
            }
          }
        } else if (propSchema.items.properties) {
          const order = Object.keys(propSchema.items.properties)
          nestedOrders.set(itemsPath, order)
        }
      }
    }
  }

  // Handle $defs (internal definitions)
  if (schema.$defs) {
    for (const [defName, defSchema] of Object.entries(schema.$defs)) {
      if (defSchema.properties) {
        const order = Object.keys(defSchema.properties)
        nestedOrders.set(`$defs.${defName}`, order)

        // Recursively handle nested objects in definitions
        const deepOrders = await findAllNestedOrders(defSchema, schemaPath, ['$defs', defName])
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value)
        }
      }
    }
  }

  return nestedOrders
}

/**
 * Sort object keys according to a specified order
 * $schema field is always placed first
 */
function sortObjectKeys(obj: JsonValue, keyOrder: string[]): JsonValue {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }

  const sorted: Record<string, JsonValue> = {}
  const objKeys = Object.keys(obj)

  // Always place $schema first if it exists
  if ('$schema' in obj) {
    const value = (obj as Record<string, JsonValue>).$schema
    if (value !== undefined) {
      sorted.$schema = value
    }
  }

  // Then, add keys in the specified order (excluding $schema)
  for (const key of keyOrder) {
    if (key in obj && key !== '$schema') {
      const value = (obj as Record<string, JsonValue>)[key]
      if (value !== undefined) {
        sorted[key] = value
      }
    }
  }

  // Then, add any remaining keys that weren't in the order (excluding $schema)
  for (const key of objKeys) {
    if (!(key in sorted) && key !== '$schema') {
      const value = (obj as Record<string, JsonValue>)[key]
      if (value !== undefined) {
        sorted[key] = value
      }
    }
  }

  return sorted
}

/**
 * Collect all valid property names from a schema (including nested)
 * Also collects patternProperties information for dynamic keys
 */
async function collectAllValidProperties(
  schema: Schema,
  schemaPath: string,
  parentPath: string[] = [],
  validProps = new Set<string>(),
  patternProps = new Map<
    string,
    { pattern: string; schema: Schema; schemaPath: string; properties: Set<string> }
  >()
): Promise<{
  validProps: Set<string>
  patternProps: Map<
    string,
    { pattern: string; schema: Schema; schemaPath: string; properties: Set<string> }
  >
}> {
  const currentSchema = await loadSchema(schemaPath)

  // Handle $ref at root level
  if (schema.$ref) {
    const refPath = resolveRefPath(schema.$ref, schemaPath)
    if (refPath) {
      const refSchema = await loadSchema(refPath)
      await collectAllValidProperties(refSchema, refPath, parentPath, validProps, patternProps)
    } else {
      const refSchema = resolveInternalRef(schema.$ref, currentSchema)
      if (refSchema) {
        await collectAllValidProperties(refSchema, schemaPath, parentPath, validProps, patternProps)
      }
    }
  }

  // Handle allOf
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath)
        if (refPath) {
          const refSchema = await loadSchema(refPath)
          await collectAllValidProperties(refSchema, refPath, parentPath, validProps, patternProps)
        } else {
          const refSchema = resolveInternalRef(subSchema.$ref, currentSchema)
          if (refSchema) {
            await collectAllValidProperties(
              refSchema,
              schemaPath,
              parentPath,
              validProps,
              patternProps
            )
          }
        }
      } else {
        await collectAllValidProperties(subSchema, schemaPath, parentPath, validProps, patternProps)
      }
    }
  }

  // Handle patternProperties (for dynamic keys like i18n locales)
  if (schema.patternProperties) {
    const currentPath = parentPath.length === 0 ? '' : parentPath.join('.')
    for (const [pattern, patternSchema] of Object.entries(schema.patternProperties)) {
      // Extract properties from pattern schema for validation
      const patternPropsSet = await extractPropertiesFromSchema(patternSchema, schemaPath)

      // Store pattern information for this path
      patternProps.set(currentPath || 'root', {
        pattern,
        schema: patternSchema,
        schemaPath,
        properties: patternPropsSet,
      })

      // Recursively collect properties from the pattern schema
      if (patternSchema.$ref) {
        const refPath = resolveRefPath(patternSchema.$ref, schemaPath)
        if (refPath) {
          const refSchema = await loadSchema(refPath)
          await collectAllValidProperties(refSchema, refPath, parentPath, validProps, patternProps)
        } else {
          const refSchema = resolveInternalRef(patternSchema.$ref, currentSchema)
          if (refSchema) {
            await collectAllValidProperties(
              refSchema,
              schemaPath,
              parentPath,
              validProps,
              patternProps
            )
          }
        }
      } else if (patternSchema.properties || patternSchema.patternProperties) {
        await collectAllValidProperties(
          patternSchema,
          schemaPath,
          parentPath,
          validProps,
          patternProps
        )
      }
    }
  }

  // Handle properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const currentPath = [...parentPath, propName]
      const pathKey = currentPath.join('.')

      // Add this property to valid set
      // Always add both the simple name (for root level) and full path (for nested)
      validProps.add(propName)
      if (parentPath.length > 0) {
        validProps.add(pathKey)
      }

      // Recursively collect nested properties
      if (propSchema.$ref) {
        const refPath = resolveRefPath(propSchema.$ref, schemaPath)
        let refSchema: Schema | null = null
        let refSchemaPath = schemaPath

        if (refPath) {
          refSchema = await loadSchema(refPath)
          refSchemaPath = refPath
        } else {
          refSchema = resolveInternalRef(propSchema.$ref, currentSchema)
        }

        if (refSchema) {
          // If the referenced schema is an array, we need to process its items
          if (refSchema.type === 'array' && refSchema.items) {
            // Process array items schema
            if (refSchema.items.$ref) {
              const itemsRefPath = resolveRefPath(refSchema.items.$ref, refSchemaPath)
              if (itemsRefPath) {
                const itemsRefSchema = await loadSchema(itemsRefPath)
                await collectAllValidProperties(
                  itemsRefSchema,
                  itemsRefPath,
                  currentPath,
                  validProps,
                  patternProps
                )
              } else {
                const itemsRefSchema = resolveInternalRef(
                  refSchema.items.$ref,
                  await loadSchema(refSchemaPath)
                )
                if (itemsRefSchema) {
                  await collectAllValidProperties(
                    itemsRefSchema,
                    refSchemaPath,
                    currentPath,
                    validProps,
                    patternProps
                  )
                }
              }
            } else if (refSchema.items.properties || refSchema.items.patternProperties) {
              await collectAllValidProperties(
                refSchema.items,
                refSchemaPath,
                currentPath,
                validProps,
                patternProps
              )
            }
          } else {
            // Not an array, process normally
            await collectAllValidProperties(
              refSchema,
              refSchemaPath,
              currentPath,
              validProps,
              patternProps
            )
          }
        }
      } else if (propSchema.properties || propSchema.patternProperties) {
        await collectAllValidProperties(
          propSchema,
          schemaPath,
          currentPath,
          validProps,
          patternProps
        )
      } else if (propSchema.items) {
        if (propSchema.items.$ref) {
          const refPath = resolveRefPath(propSchema.items.$ref, schemaPath)
          if (refPath) {
            const refSchema = await loadSchema(refPath)
            await collectAllValidProperties(
              refSchema,
              refPath,
              currentPath,
              validProps,
              patternProps
            )
          } else {
            const refSchema = resolveInternalRef(propSchema.items.$ref, currentSchema)
            if (refSchema) {
              await collectAllValidProperties(
                refSchema,
                schemaPath,
                currentPath,
                validProps,
                patternProps
              )
            }
          }
        } else if (propSchema.items.properties || propSchema.items.patternProperties) {
          await collectAllValidProperties(
            propSchema.items,
            schemaPath,
            currentPath,
            validProps,
            patternProps
          )
        }
      }
    }
  }

  return { validProps, patternProps }
}

/**
 * Check if a key matches a pattern (for patternProperties)
 */
function matchesPattern(key: string, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern)
    return regex.test(key)
  } catch {
    return false
  }
}

/**
 * Extract property names from a schema (for patternProperties validation)
 */
async function extractPropertiesFromSchema(
  schema: Schema,
  schemaPath: string
): Promise<Set<string>> {
  const props = new Set<string>()
  const currentSchema = await loadSchema(schemaPath)

  // Handle $ref
  if (schema.$ref) {
    const refPath = resolveRefPath(schema.$ref, schemaPath)
    if (refPath) {
      const refSchema = await loadSchema(refPath)
      const refProps = await extractPropertiesFromSchema(refSchema, refPath)
      for (const prop of refProps) {
        props.add(prop)
      }
    } else {
      const refSchema = resolveInternalRef(schema.$ref, currentSchema)
      if (refSchema) {
        const refProps = await extractPropertiesFromSchema(refSchema, schemaPath)
        for (const prop of refProps) {
          props.add(prop)
        }
      }
    }
  }

  // Handle allOf
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath)
        if (refPath) {
          const refSchema = await loadSchema(refPath)
          const refProps = await extractPropertiesFromSchema(refSchema, refPath)
          for (const prop of refProps) {
            props.add(prop)
          }
        } else {
          const refSchema = resolveInternalRef(subSchema.$ref, currentSchema)
          if (refSchema) {
            const refProps = await extractPropertiesFromSchema(refSchema, schemaPath)
            for (const prop of refProps) {
              props.add(prop)
            }
          }
        }
      } else {
        const subProps = await extractPropertiesFromSchema(subSchema, schemaPath)
        for (const prop of subProps) {
          props.add(prop)
        }
      }
    }
  }

  // Handle properties
  if (schema.properties) {
    for (const propName of Object.keys(schema.properties)) {
      props.add(propName)
    }
  }

  return props
}

/**
 * Validate manifest fields against schema
 */
function validateManifestFields(
  manifest: JsonValue,
  validProps: Set<string>,
  path: (string | number)[] = [],
  errors: ValidationError[] = [],
  patternProps = new Map<
    string,
    { pattern: string; schema: Schema; schemaPath: string; properties: Set<string> }
  >()
): ValidationError[] {
  if (Array.isArray(manifest)) {
    manifest.forEach(item => {
      // For arrays, we don't validate the index itself, just the items
      validateManifestFields(item, validProps, path, errors, patternProps)
    })
    return errors
  }

  if (manifest && typeof manifest === 'object') {
    const currentPath = path.length === 0 ? '' : path.join('.')
    const pathKey = path.length === 0 ? 'root' : currentPath

    // Check if this object uses patternProperties
    let patternInfo = patternProps.get(pathKey)

    // If not found, check parent paths (for nested patternProperties like i18n.zh-Hans)
    if (!patternInfo && path.length > 0) {
      // Check parent path
      const parentPath = path.slice(0, -1)
      const parentPathKey = parentPath.length === 0 ? 'root' : parentPath.join('.')
      patternInfo = patternProps.get(parentPathKey)

      // If parent uses patternProperties, check if current key matches
      if (patternInfo && path.length > 0) {
        const currentKey = String(path[path.length - 1])
        if (!matchesPattern(currentKey, patternInfo.pattern)) {
          patternInfo = undefined
        }
      }
    }

    for (const [key, value] of Object.entries(manifest)) {
      // $schema is always allowed
      if (key === '$schema') {
        continue
      }

      // Check if this field is valid
      let isValid = false

      // First, check if this object uses patternProperties and the key matches the pattern
      if (patternInfo) {
        if (matchesPattern(key, patternInfo.pattern)) {
          isValid = true
          // The value will be validated recursively below
        } else if (patternInfo.properties) {
          // If we're inside a patternProperties object (like i18n.zh-Hans),
          // check if the key is in the pattern schema's properties
          isValid = patternInfo.properties.has(key)
        }
      }

      // If not matched by pattern, check regular properties
      if (!isValid) {
        if (path.length === 0) {
          // Root level field
          isValid = validProps.has(key)
        } else {
          // Nested field - check full path
          const fullPath = `${currentPath}.${key}`
          isValid = validProps.has(fullPath)

          // Also check if the parent path exists (meaning this is a valid nested object)
          // This handles cases where nested properties are collected with their full paths
          if (!isValid) {
            // Check if any property starts with this path (meaning it's a valid nested structure)
            for (const prop of validProps) {
              if (prop.startsWith(`${fullPath}.`) || prop === fullPath) {
                isValid = true
                break
              }
            }
          }
        }
      }

      if (!isValid) {
        const location = path.length === 0 ? `root.${key}` : `${currentPath}.${key}`
        errors.push({
          field: key,
          location,
          path: path.length === 0 ? [key] : [...path, key],
        })
      }

      // Recursively validate nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nextPath = path.length === 0 ? [key] : [...path, key]
        validateManifestFields(value, validProps, nextPath, errors, patternProps)
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') {
            const nextPath = path.length === 0 ? [key] : [...path, key]
            validateManifestFields(item, validProps, nextPath, errors, patternProps)
          }
        })
      }
    }
  }

  return errors
}

/**
 * Recursively sort all nested objects in a data structure
 */
function sortNestedObjects(
  data: JsonValue,
  nestedOrders: Map<string, string[]>,
  path: string[] = []
): JsonValue {
  if (Array.isArray(data)) {
    return data.map(item => sortNestedObjects(item, nestedOrders, path))
  }

  if (data && typeof data === 'object') {
    // Get the order for the current path
    const currentPath = path.join('.')
    const order = nestedOrders.get(currentPath)

    // Sort current level
    const sorted = order ? sortObjectKeys(data, order) : (data as Record<string, JsonValue>)

    // Recursively sort nested objects
    if (sorted && typeof sorted === 'object' && !Array.isArray(sorted)) {
      for (const [key, value] of Object.entries(sorted)) {
        ;(sorted as Record<string, JsonValue>)[key] = sortNestedObjects(value, nestedOrders, [
          ...path,
          key,
        ])
      }
    }

    return sorted
  }

  return data
}

/**
 * Process a single manifest file
 * Returns validation errors count
 */
async function processManifest(
  manifestPath: string,
  schemaPath: string,
  relativePath: string
): Promise<{ errorCount: number; hasError: boolean }> {
  // Check if schema exists
  try {
    await fs.access(schemaPath)
  } catch {
    console.log(`  ⚠️  Schema not found: ${schemaPath}`)
    return { errorCount: 0, hasError: true }
  }

  // Check if manifest file exists
  try {
    await fs.access(manifestPath)
  } catch {
    console.log(`  ⚠️  Manifest file not found: ${manifestPath}`)
    return { errorCount: 0, hasError: true }
  }

  // Load manifest and schema
  const manifest = await loadJSON(manifestPath)
  const schema = await loadSchema(schemaPath)

  // Extract property order from schema
  // If schema defines an array, we need to get the item schema
  let itemSchema = schema
  if (schema.type === 'array' && schema.items) {
    itemSchema = schema.items
  }

  const propertyOrder = await extractPropertyOrder(itemSchema, schemaPath)

  // Collect all valid properties for validation
  const { validProps, patternProps } = await collectAllValidProperties(itemSchema, schemaPath, [])
  // Always allow $schema
  validProps.add('$schema')

  // Validate manifest fields
  const validationErrors: ValidationError[] = []
  if (Array.isArray(manifest)) {
    manifest.forEach((item, index) => {
      const errors = validateManifestFields(item, validProps, [index], [], patternProps)
      validationErrors.push(...errors)
    })
  } else {
    const errors = validateManifestFields(manifest, validProps, [], [], patternProps)
    validationErrors.push(...errors)
  }

  // Report validation errors only if there are any
  if (validationErrors.length > 0) {
    console.log(`\n  ❌ ${relativePath} - Found ${validationErrors.length} invalid field(s):`)
    for (const error of validationErrors) {
      console.log(`     - ${error.location}: field "${error.field}" does not exist in schema`)
    }
  }

  // Find all nested property orders
  const nestedOrders = await findAllNestedOrders(itemSchema, schemaPath, [])

  // Sort the manifest data
  // If schema is array type but manifest is object, treat it as a single item
  let sortedManifest: JsonValue
  if (Array.isArray(manifest)) {
    sortedManifest = manifest.map(item => {
      const sorted = sortObjectKeys(item, propertyOrder)
      return sortNestedObjects(sorted, nestedOrders, [])
    })
  } else {
    sortedManifest = sortObjectKeys(manifest, propertyOrder)
    sortedManifest = sortNestedObjects(sortedManifest, nestedOrders, [])
  }

  // Write back to file
  const jsonContent = `${JSON.stringify(sortedManifest, null, 2)}\n`
  await fs.writeFile(manifestPath, jsonContent, 'utf-8')

  return { errorCount: validationErrors.length, hasError: false }
}

/**
 * Get all JSON files in a directory
 */
async function getJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const jsonFiles: string[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(entry.name)
      }
    }

    return jsonFiles.sort()
  } catch {
    // Directory doesn't exist or can't be read
    return []
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔄 Sorting manifest fields according to schemas...\n')

  // Statistics
  const stats: Stats = {
    totalFiles: 0,
    processedFiles: 0,
    errorFiles: 0,
    totalErrors: 0,
    categories: {},
  }

  // Mapping of subdirectories to their schema files
  const manifestCategories: ManifestCategory[] = [
    { dir: 'vendors', schema: 'vendor.schema.json' },
    { dir: 'providers', schema: 'provider.schema.json' },
    { dir: 'models', schema: 'model.schema.json' },
    { dir: 'ides', schema: 'ide.schema.json' },
    { dir: 'desktops', schema: 'desktop.schema.json' },
    { dir: 'extensions', schema: 'extension.schema.json' },
    { dir: 'clis', schema: 'cli.schema.json' },
  ]

  // Process files in subdirectories
  for (const category of manifestCategories) {
    const categoryDir = path.join(MANIFESTS_DIR, category.dir)
    const jsonFiles = await getJsonFiles(categoryDir)
    const schemaPath = path.join(SCHEMAS_DIR, category.schema)

    if (jsonFiles.length === 0) {
      continue
    }

    stats.categories[category.dir] = {
      total: jsonFiles.length,
      processed: 0,
      errors: 0,
      validationErrors: 0,
    }
    stats.totalFiles += jsonFiles.length

    for (const jsonFile of jsonFiles) {
      const manifestPath = path.join(categoryDir, jsonFile)
      const relativePath = `${category.dir}/${jsonFile}`

      try {
        const result = await processManifest(manifestPath, schemaPath, relativePath)
        if (result.hasError) {
          stats.errorFiles++
          stats.categories[category.dir]!.errors++
        } else {
          stats.processedFiles++
          stats.categories[category.dir]!.processed++
          if (result.errorCount > 0) {
            stats.totalErrors += result.errorCount
            stats.categories[category.dir]!.validationErrors += result.errorCount
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${relativePath}:`, (error as Error).message)
        stats.errorFiles++
        stats.categories[category.dir]!.errors++
      }
    }
  }

  // Process collections.json in root directory
  const collectionsPath = path.join(MANIFESTS_DIR, 'collections.json')
  const collectionsSchemaPath = path.join(SCHEMAS_DIR, 'collections.schema.json')

  try {
    const result = await processManifest(collectionsPath, collectionsSchemaPath, 'collections.json')
    stats.totalFiles++
    if (result.hasError) {
      stats.errorFiles++
    } else {
      stats.processedFiles++
      if (result.errorCount > 0) {
        stats.totalErrors += result.errorCount
      }
    }
  } catch (error) {
    console.error(`  ❌ Error processing collections.json:`, (error as Error).message)
    stats.totalFiles++
    stats.errorFiles++
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Summary')
  console.log('='.repeat(60))
  console.log(`Total files: ${stats.totalFiles}`)
  console.log(`Processed successfully: ${stats.processedFiles}`)
  if (stats.errorFiles > 0) {
    console.log(`Files with errors: ${stats.errorFiles}`)
  }
  if (stats.totalErrors > 0) {
    console.log(`Total validation errors: ${stats.totalErrors}`)
  }

  // Print category breakdown
  const categoriesWithErrors = Object.entries(stats.categories).filter(
    ([_, cat]) => cat.errors > 0 || cat.validationErrors > 0
  )
  if (categoriesWithErrors.length > 0) {
    console.log('\nCategory breakdown:')
    for (const [category, catStats] of categoriesWithErrors) {
      const parts: string[] = [`${category}: ${catStats.processed}/${catStats.total} processed`]
      if (catStats.errors > 0) {
        parts.push(`${catStats.errors} file error(s)`)
      }
      if (catStats.validationErrors > 0) {
        parts.push(`${catStats.validationErrors} validation error(s)`)
      }
      console.log(`  ${parts.join(', ')}`)
    }
  }

  if (stats.errorFiles === 0 && stats.totalErrors === 0) {
    console.log('\n✨ All files processed successfully with no errors!')
  } else {
    console.log('\n⚠️  Processing completed with some errors.')
  }
}

main().catch(console.error)
