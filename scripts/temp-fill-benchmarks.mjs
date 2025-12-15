#!/usr/bin/env node

/**
 * Temporary script to fill missing benchmarks fields in model manifest files
 * Adds all required benchmarks fields with null value if they are missing
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const MODELS_DIR = path.join(ROOT_DIR, 'manifests', 'models')

// All required benchmarks fields according to schema
const REQUIRED_BENCHMARKS_FIELDS = [
  'sweBench',
  'terminalBench',
  'mmmu',
  'mmmuPro',
  'webDevArena',
  'sciCode',
  'liveCodeBench',
]

/**
 * Load and parse a JSON file
 */
async function loadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
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
      throw new Error(`JSON parse error: ${error.message} (file: ${filePath})`)
    }
    throw error
  }
}

/**
 * Fill missing benchmarks fields in a model manifest
 */
function fillBenchmarks(model) {
  if (!model.benchmarks) {
    // If benchmarks object doesn't exist, create it with all fields as null
    model.benchmarks = {}
    for (const field of REQUIRED_BENCHMARKS_FIELDS) {
      model.benchmarks[field] = null
    }
    return true
  }

  let modified = false
  // Check each required field and add if missing
  for (const field of REQUIRED_BENCHMARKS_FIELDS) {
    if (!(field in model.benchmarks)) {
      model.benchmarks[field] = null
      modified = true
    }
  }

  return modified
}

/**
 * Process a single model file
 */
async function processModelFile(filePath) {
  try {
    const model = await loadJSON(filePath)
    const modified = fillBenchmarks(model)

    if (modified) {
      // Write back to file with proper formatting
      const jsonContent = `${JSON.stringify(model, null, 2)}\n`
      await fs.writeFile(filePath, jsonContent, 'utf-8')
      return { success: true, modified: true, file: path.basename(filePath) }
    }

    return { success: true, modified: false, file: path.basename(filePath) }
  } catch (error) {
    return {
      success: false,
      modified: false,
      file: path.basename(filePath),
      error: error.message,
    }
  }
}

/**
 * Get all JSON files in the models directory
 */
async function getModelFiles() {
  try {
    const entries = await fs.readdir(MODELS_DIR, { withFileTypes: true })
    const jsonFiles = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(path.join(MODELS_DIR, entry.name))
      }
    }

    return jsonFiles.sort()
  } catch (error) {
    console.error(`Error reading models directory: ${error.message}`)
    return []
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Filling missing benchmarks fields in model manifests...\n')

  const modelFiles = await getModelFiles()

  if (modelFiles.length === 0) {
    console.log('⚠️  No model files found')
    return
  }

  console.log(`Found ${modelFiles.length} model file(s)\n`)

  const results = {
    total: modelFiles.length,
    modified: 0,
    unchanged: 0,
    errors: 0,
  }

  for (const filePath of modelFiles) {
    const result = await processModelFile(filePath)

    if (!result.success) {
      console.log(`❌ ${result.file}: ${result.error}`)
      results.errors++
    } else if (result.modified) {
      console.log(`✅ ${result.file}: Added missing benchmarks fields`)
      results.modified++
    } else {
      console.log(`✓  ${result.file}: No changes needed`)
      results.unchanged++
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Summary')
  console.log('='.repeat(60))
  console.log(`Total files: ${results.total}`)
  console.log(`Modified: ${results.modified}`)
  console.log(`Unchanged: ${results.unchanged}`)
  if (results.errors > 0) {
    console.log(`Errors: ${results.errors}`)
  }
  console.log('='.repeat(60))

  if (results.errors === 0) {
    console.log('\n✨ All files processed successfully!')
  } else {
    console.log('\n⚠️  Processing completed with some errors.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
