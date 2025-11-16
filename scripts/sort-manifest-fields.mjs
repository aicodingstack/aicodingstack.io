#!/usr/bin/env node

/**
 * Sort fields in manifest JSON files according to their schema definitions
 * This script reads each manifest file and its corresponding schema,
 * then reorders the fields in the manifest to match the schema's property order.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFESTS_DIR = path.join(ROOT_DIR, 'manifests');
const SCHEMAS_DIR = path.join(MANIFESTS_DIR, 'schemas');

// Cache for loaded schemas to avoid redundant reads
const schemaCache = new Map();

/**
 * Load and parse a JSON file
 */
async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Resolve a $ref path to an absolute file path or return the path for internal references
 * Returns null for internal references (handled separately), or the resolved file path
 */
function resolveRefPath(refPath, baseSchemaPath) {
  if (refPath.startsWith('#/')) {
    // Internal reference within the same schema (e.g., #/$defs/collectionSection)
    // Return null to indicate it should be resolved from the same schema
    return null;
  }
  
  const schemaDir = path.dirname(baseSchemaPath);
  return path.resolve(schemaDir, refPath);
}

/**
 * Resolve an internal reference (e.g., #/$defs/collectionSection) from a schema
 */
function resolveInternalRef(refPath, schema) {
  if (!refPath.startsWith('#/')) {
    return null;
  }
  
  // Remove the #/ prefix
  const pathParts = refPath.slice(2).split('/');
  let current = schema;
  
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Extract property order from a schema definition
 * Returns an array of property names in the order they appear in the schema
 */
async function extractPropertyOrder(schema, schemaPath) {
  const propertyOrder = [];
  
  // Handle $ref at the root level
  if (schema.$ref) {
    const refPath = resolveRefPath(schema.$ref, schemaPath);
    if (refPath) {
      // External reference - load from file
      const refSchema = await loadSchema(refPath);
      const refOrder = await extractPropertyOrder(refSchema, refPath);
      propertyOrder.push(...refOrder);
    } else {
      // Internal reference - resolve from current schema
      const currentSchema = await loadSchema(schemaPath);
      const refSchema = resolveInternalRef(schema.$ref, currentSchema);
      if (refSchema) {
        const refOrder = await extractPropertyOrder(refSchema, schemaPath);
        propertyOrder.push(...refOrder);
      }
    }
  }
  
  // Handle allOf - merge properties from all schemas
  if (schema.allOf) {
    const currentSchema = await loadSchema(schemaPath);
    for (const subSchema of schema.allOf) {
      // Handle $ref in allOf
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath);
        if (refPath) {
          // External reference
          const refSchema = await loadSchema(refPath);
          const refOrder = await extractPropertyOrder(refSchema, refPath);
          propertyOrder.push(...refOrder);
        } else {
          // Internal reference
          const refSchema = resolveInternalRef(subSchema.$ref, currentSchema);
          if (refSchema) {
            const refOrder = await extractPropertyOrder(refSchema, schemaPath);
            propertyOrder.push(...refOrder);
          }
        }
      } else {
        // Direct schema definition
        const subOrder = await extractPropertyOrder(subSchema, schemaPath);
        propertyOrder.push(...subOrder);
      }
    }
  }
  
  // Handle properties directly defined in this schema
  if (schema.properties) {
    for (const propName of Object.keys(schema.properties)) {
      if (!propertyOrder.includes(propName)) {
        propertyOrder.push(propName);
      }
    }
  }
  
  return propertyOrder;
}

/**
 * Load a schema file with caching
 */
async function loadSchema(schemaPath) {
  if (schemaCache.has(schemaPath)) {
    return schemaCache.get(schemaPath);
  }
  
  const schema = await loadJSON(schemaPath);
  schemaCache.set(schemaPath, schema);
  return schema;
}


/**
 * Find all nested property orders from a schema
 */
async function findAllNestedOrders(schema, schemaPath, parentPath = []) {
  const nestedOrders = new Map();
  
  // Handle allOf
  if (schema.allOf) {
    const currentSchema = await loadSchema(schemaPath);
    for (const subSchema of schema.allOf) {
      // Handle $ref in allOf
      if (subSchema.$ref) {
        const refPath = resolveRefPath(subSchema.$ref, schemaPath);
        let refSchema = null;
        let refSchemaPath = schemaPath;
        
        if (refPath) {
          // External reference
          refSchema = await loadSchema(refPath);
          refSchemaPath = refPath;
        } else {
          // Internal reference
          refSchema = resolveInternalRef(subSchema.$ref, currentSchema);
        }
        
        if (refSchema) {
          const subOrders = await findAllNestedOrders(refSchema, refSchemaPath, parentPath);
          for (const [key, value] of subOrders) {
            nestedOrders.set(key, value);
          }
        }
      } else {
        // Direct schema definition
        const subOrders = await findAllNestedOrders(subSchema, schemaPath, parentPath);
        for (const [key, value] of subOrders) {
          nestedOrders.set(key, value);
        }
      }
    }
  }
  
  // Handle properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const currentPath = [...parentPath, propName].join('.');
      
      // Handle $ref
      if (propSchema.$ref) {
        const refPath = resolveRefPath(propSchema.$ref, schemaPath);
        const currentSchema = await loadSchema(schemaPath);
        let refSchema = null;
        let refSchemaPath = schemaPath;
        
        if (refPath) {
          // External reference
          refSchema = await loadSchema(refPath);
          refSchemaPath = refPath;
        } else {
          // Internal reference
          refSchema = resolveInternalRef(propSchema.$ref, currentSchema);
        }
        
        if (refSchema) {
          const order = await extractPropertyOrder(refSchema, refSchemaPath);
          if (order.length > 0) {
            nestedOrders.set(currentPath, order);
          }
          
          // Recursively find nested orders in the referenced schema
          const refNestedOrders = await findAllNestedOrders(refSchema, refSchemaPath, []);
          for (const [nestedPath, nestedOrder] of refNestedOrders) {
            nestedOrders.set(`${currentPath}.${nestedPath}`, nestedOrder);
          }
        }
      }
      
      // Handle direct object properties
      if (propSchema.properties) {
        const order = Object.keys(propSchema.properties);
        nestedOrders.set(currentPath, order);
        
        // Recursively handle nested objects
        const deepOrders = await findAllNestedOrders(propSchema, schemaPath, [...parentPath, propName]);
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value);
        }
      }
      
      // Handle array items
      if (propSchema.items) {
        const itemsPath = `${currentPath}.items`;
        if (propSchema.items.$ref) {
          const refPath = resolveRefPath(propSchema.items.$ref, schemaPath);
          const currentSchema = await loadSchema(schemaPath);
          let refSchema = null;
          let refSchemaPath = schemaPath;
          
          if (refPath) {
            // External reference
            refSchema = await loadSchema(refPath);
            refSchemaPath = refPath;
          } else {
            // Internal reference
            refSchema = resolveInternalRef(propSchema.items.$ref, currentSchema);
          }
          
          if (refSchema) {
            const order = await extractPropertyOrder(refSchema, refSchemaPath);
            if (order.length > 0) {
              nestedOrders.set(itemsPath, order);
            }
            
            const refNestedOrders = await findAllNestedOrders(refSchema, refSchemaPath, []);
            for (const [nestedPath, nestedOrder] of refNestedOrders) {
              nestedOrders.set(`${itemsPath}.${nestedPath}`, nestedOrder);
            }
          }
        } else if (propSchema.items.properties) {
          const order = Object.keys(propSchema.items.properties);
          nestedOrders.set(itemsPath, order);
        }
      }
    }
  }
  
  // Handle $defs (internal definitions)
  if (schema.$defs) {
    for (const [defName, defSchema] of Object.entries(schema.$defs)) {
      if (defSchema.properties) {
        const order = Object.keys(defSchema.properties);
        nestedOrders.set(`$defs.${defName}`, order);
        
        // Recursively handle nested objects in definitions
        const deepOrders = await findAllNestedOrders(defSchema, schemaPath, ['$defs', defName]);
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value);
        }
      }
    }
  }
  
  return nestedOrders;
}

/**
 * Sort object keys according to a specified order
 */
function sortObjectKeys(obj, keyOrder) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const sorted = {};
  const objKeys = Object.keys(obj);
  
  // First, add keys in the specified order
  for (const key of keyOrder) {
    if (key in obj) {
      sorted[key] = obj[key];
    }
  }
  
  // Then, add any remaining keys that weren't in the order
  for (const key of objKeys) {
    if (!(key in sorted)) {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

/**
 * Recursively sort all nested objects in a data structure
 */
function sortNestedObjects(data, nestedOrders, path = []) {
  if (Array.isArray(data)) {
    return data.map((item) => sortNestedObjects(item, nestedOrders, path));
  }
  
  if (data && typeof data === 'object') {
    // Get the order for the current path
    const currentPath = path.join('.');
    const order = nestedOrders.get(currentPath);
    
    // Sort current level
    const sorted = order ? sortObjectKeys(data, order) : { ...data };
    
    // Recursively sort nested objects
    for (const [key, value] of Object.entries(sorted)) {
      sorted[key] = sortNestedObjects(value, nestedOrders, [...path, key]);
    }
    
    return sorted;
  }
  
  return data;
}

/**
 * Process a single manifest file
 */
async function processManifest(manifestPath, schemaPath, relativePath) {
  console.log(`\nProcessing ${relativePath}...`);
  
  // Check if schema exists
  try {
    await fs.access(schemaPath);
  } catch {
    console.log(`  ⚠️  Schema not found: ${schemaPath}`);
    return;
  }
  
  // Check if manifest file exists
  try {
    await fs.access(manifestPath);
  } catch {
    console.log(`  ⚠️  Manifest file not found: ${manifestPath}`);
    return;
  }
  
  // Load manifest and schema
  const manifest = await loadJSON(manifestPath);
  const schema = await loadSchema(schemaPath);
  
  // Extract property order from schema
  // If schema defines an array, we need to get the item schema
  let itemSchema = schema;
  if (schema.type === 'array' && schema.items) {
    itemSchema = schema.items;
  }
  
  const propertyOrder = await extractPropertyOrder(itemSchema, schemaPath);
  if (propertyOrder.length > 0) {
    console.log(`  📋 Top-level field order: ${propertyOrder.join(', ')}`);
  }
  
  // Find all nested property orders
  const nestedOrders = await findAllNestedOrders(itemSchema, schemaPath, []);
  if (nestedOrders.size > 0) {
    console.log(`  📦 Found ${nestedOrders.size} nested object schemas`);
  }
  
  // Sort the manifest data
  // If schema is array type but manifest is object, treat it as a single item
  let sortedManifest;
  if (Array.isArray(manifest)) {
    sortedManifest = manifest.map(item => {
      const sorted = sortObjectKeys(item, propertyOrder);
      return sortNestedObjects(sorted, nestedOrders, []);
    });
  } else {
    sortedManifest = sortObjectKeys(manifest, propertyOrder);
    sortedManifest = sortNestedObjects(sortedManifest, nestedOrders, []);
  }
  
  // Write back to file
  const jsonContent = JSON.stringify(sortedManifest, null, 2) + '\n';
  await fs.writeFile(manifestPath, jsonContent, 'utf-8');
  
  console.log(`  ✅ Sorted and saved`);
}

/**
 * Get all JSON files in a directory
 */
async function getJsonFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const jsonFiles = [];
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(entry.name);
      }
    }
    
    return jsonFiles.sort();
  } catch {
    // Directory doesn't exist or can't be read
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Sorting manifest fields according to schemas...\n');
  
  // Mapping of subdirectories to their schema files
  const manifestCategories = [
    { dir: 'vendors', schema: 'vendors.schema.json' },
    { dir: 'providers', schema: 'providers.schema.json' },
    { dir: 'models', schema: 'models.schema.json' },
    { dir: 'ides', schema: 'ides.schema.json' },
    { dir: 'extensions', schema: 'extensions.schema.json' },
    { dir: 'clis', schema: 'clis.schema.json' }
  ];
  
  // Process files in subdirectories
  for (const category of manifestCategories) {
    const categoryDir = path.join(MANIFESTS_DIR, category.dir);
    const jsonFiles = await getJsonFiles(categoryDir);
    const schemaPath = path.join(SCHEMAS_DIR, category.schema);
    
    if (jsonFiles.length === 0) {
      console.log(`\n⚠️  No JSON files found in ${category.dir}/`);
      continue;
    }
    
    console.log(`\n📁 Processing ${category.dir}/ (${jsonFiles.length} files)...`);
    
    for (const jsonFile of jsonFiles) {
      const manifestPath = path.join(categoryDir, jsonFile);
      const relativePath = `${category.dir}/${jsonFile}`;
      
      try {
        await processManifest(manifestPath, schemaPath, relativePath);
      } catch (error) {
        console.error(`  ❌ Error processing ${relativePath}:`, error.message);
      }
    }
  }
  
  // Process collections.json in root directory
  const collectionsPath = path.join(MANIFESTS_DIR, 'collections.json');
  const collectionsSchemaPath = path.join(SCHEMAS_DIR, 'collections.schema.json');
  
  try {
    await processManifest(collectionsPath, collectionsSchemaPath, 'collections.json');
  } catch (error) {
    console.error(`  ❌ Error processing collections.json:`, error.message);
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);

