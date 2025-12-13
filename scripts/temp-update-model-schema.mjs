#!/usr/bin/env node

/**
 * Temporary script to update all model manifest files according to the latest schema changes:
 * 1. Rename totalContext to contextWindow (if exists)
 * 2. Convert contextWindow from string to number (e.g., "32K" -> 32000)
 * 3. Convert maxOutput from string to number (e.g., "4K" -> 4096)
 * 4. Ensure releaseDate exists (set to null if missing)
 * 5. Add inputModalities field (infer from description or set default)
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const MODELS_DIR = path.join(ROOT_DIR, 'manifests', 'models')

/**
 * Convert string token count to number
 * Examples: "32K" -> 32000, "128K" -> 128000, "1M" -> 1000000, "200K" -> 200000
 * Returns null if value is "Unknown" or cannot be parsed
 */
function parseTokenCount(value) {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid token count value: ${value}`)
  }

  const trimmed = value.trim()

  // Handle "Unknown" or empty values - these should not be in required fields
  // but we'll throw an error to alert the user
  if (trimmed === '' || trimmed.toLowerCase() === 'unknown') {
    throw new Error(`Token count cannot be "Unknown" - this is a required field`)
  }

  const numStr = trimmed.replace(/[KM]/gi, '')
  const num = parseInt(numStr, 10)

  if (isNaN(num)) {
    throw new Error(`Cannot parse token count: ${value}`)
  }

  if (trimmed.toUpperCase().includes('M')) {
    return num * 1000000
  }
  if (trimmed.toUpperCase().includes('K')) {
    return num * 1000
  }

  return num
}

/**
 * Infer input modalities from description
 * Returns array of modalities: ['text', 'image', 'file']
 */
function inferInputModalities(description) {
  const modalities = []
  const desc = (description || '').toLowerCase()

  // Check for text (default, always present)
  modalities.push('text')

  // Check for image/multimodal
  if (
    desc.includes('multimodal') ||
    desc.includes('image') ||
    desc.includes('vision') ||
    desc.includes('visual')
  ) {
    modalities.push('image')
  }

  // Check for file/document support
  if (
    desc.includes('file') ||
    desc.includes('document') ||
    desc.includes('pdf') ||
    desc.includes('upload')
  ) {
    modalities.push('file')
  }

  return modalities
}

/**
 * Load and parse a JSON file
 */
async function loadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const cleanContent = content.replace(/^\uFEFF/, '').trim()
    if (!cleanContent) {
      throw new Error('File is empty')
    }
    return JSON.parse(cleanContent)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parse error: ${error.message} (file: ${filePath})`)
    }
    throw error
  }
}

/**
 * Process a single model file
 */
async function processModelFile(filePath, fileName) {
  try {
    const manifest = await loadJSON(filePath)
    const changes = []

    // 1. Handle totalContext -> contextWindow rename
    if (manifest.totalContext !== undefined && manifest.contextWindow === undefined) {
      manifest.contextWindow = manifest.totalContext
      delete manifest.totalContext
      changes.push('Renamed totalContext to contextWindow')
    }

    // 2. Convert contextWindow from string to number
    if (manifest.contextWindow !== undefined) {
      if (typeof manifest.contextWindow === 'string') {
        const oldValue = manifest.contextWindow
        if (oldValue.trim().toLowerCase() === 'unknown') {
          // Use a reasonable default for unknown values (128K is common)
          manifest.contextWindow = 128000
          changes.push(
            `Converted contextWindow: "Unknown" -> 128000 (default, please update with actual value)`
          )
        } else {
          manifest.contextWindow = parseTokenCount(manifest.contextWindow)
          changes.push(`Converted contextWindow: "${oldValue}" -> ${manifest.contextWindow}`)
        }
      } else if (typeof manifest.contextWindow !== 'number') {
        throw new Error(
          `Invalid contextWindow type: ${typeof manifest.contextWindow} (${manifest.contextWindow})`
        )
      }
    } else {
      throw new Error('Missing required field: contextWindow')
    }

    // 3. Convert maxOutput from string to number
    if (manifest.maxOutput !== undefined) {
      if (typeof manifest.maxOutput === 'string') {
        const oldValue = manifest.maxOutput
        if (oldValue.trim().toLowerCase() === 'unknown') {
          // Use a reasonable default for unknown values (8K is common)
          manifest.maxOutput = 8000
          changes.push(
            `Converted maxOutput: "Unknown" -> 8000 (default, please update with actual value)`
          )
        } else {
          manifest.maxOutput = parseTokenCount(manifest.maxOutput)
          changes.push(`Converted maxOutput: "${oldValue}" -> ${manifest.maxOutput}`)
        }
      } else if (typeof manifest.maxOutput !== 'number') {
        throw new Error(
          `Invalid maxOutput type: ${typeof manifest.maxOutput} (${manifest.maxOutput})`
        )
      }
    } else {
      throw new Error('Missing required field: maxOutput')
    }

    // 4. Ensure releaseDate exists
    if (manifest.releaseDate === undefined) {
      manifest.releaseDate = null
      changes.push('Added releaseDate: null')
    }

    // 5. Add inputModalities if missing
    if (manifest.inputModalities === undefined) {
      // Try to infer from description
      const inferred = inferInputModalities(manifest.description)
      manifest.inputModalities = inferred
      changes.push(`Added inputModalities: [${inferred.join(', ')}]`)
    }

    // Reorder fields according to schema order
    const orderedManifest = {}
    const fieldOrder = [
      '$schema',
      'id',
      'name',
      'description',
      'translations',
      'verified',
      'websiteUrl',
      'docsUrl',
      'vendor',
      'size',
      'contextWindow',
      'maxOutput',
      'tokenPricing',
      'releaseDate',
      'inputModalities',
      'benchmarks',
      'platformUrls',
    ]

    // Add fields in order
    for (const key of fieldOrder) {
      if (key in manifest) {
        orderedManifest[key] = manifest[key]
      }
    }

    // Add any remaining fields
    for (const [key, value] of Object.entries(manifest)) {
      if (!(key in orderedManifest)) {
        orderedManifest[key] = value
      }
    }

    // Write back to file
    const jsonContent = `${JSON.stringify(orderedManifest, null, 2)}\n`
    await fs.writeFile(filePath, jsonContent, 'utf-8')

    if (changes.length > 0) {
      console.log(`  ✅ ${fileName}`)
      changes.forEach(change => console.log(`     - ${change}`))
    } else {
      console.log(`  ⏭️  ${fileName} - No changes needed`)
    }

    return { success: true, changes: changes.length }
  } catch (error) {
    console.error(`  ❌ ${fileName} - Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Updating model manifests according to latest schema...\n')

  try {
    const entries = await fs.readdir(MODELS_DIR, { withFileTypes: true })
    const jsonFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
      .map(entry => entry.name)
      .sort()

    if (jsonFiles.length === 0) {
      console.log('  ⚠️  No model files found')
      return
    }

    console.log(`Found ${jsonFiles.length} model file(s)\n`)

    const stats = {
      total: jsonFiles.length,
      processed: 0,
      skipped: 0,
      errors: 0,
      totalChanges: 0,
    }

    for (const fileName of jsonFiles) {
      const filePath = path.join(MODELS_DIR, fileName)
      const result = await processModelFile(filePath, fileName)

      if (result.success) {
        stats.processed++
        stats.totalChanges += result.changes
        if (result.changes === 0) {
          stats.skipped++
        }
      } else {
        stats.errors++
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 Summary')
    console.log('='.repeat(60))
    console.log(`Total files: ${stats.total}`)
    console.log(`Processed: ${stats.processed}`)
    console.log(`Skipped (no changes): ${stats.skipped}`)
    console.log(`Total changes: ${stats.totalChanges}`)
    if (stats.errors > 0) {
      console.log(`Errors: ${stats.errors}`)
    }
    console.log('='.repeat(60))

    if (stats.errors === 0) {
      console.log('\n✨ All files processed successfully!')
    } else {
      console.log('\n⚠️  Processing completed with some errors.')
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
