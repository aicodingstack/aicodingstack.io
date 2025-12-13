#!/usr/bin/env node

/**
 * Temporary script to add releaseDate field to all model manifest files
 * Attempts to extract release date from description, otherwise sets to null
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const MODELS_DIR = path.join(ROOT_DIR, 'manifests', 'models')

/**
 * Extract release date from description text
 * Looks for patterns like "Released in August 2025", "Released in April 2025", etc.
 * Returns ISO 8601 date string (YYYY-MM-DD) or null if not found
 */
function extractReleaseDate(description) {
  if (!description) return null

  // Pattern: "Released in [Month] [Year]"
  const releasedPattern = /Released in\s+(\w+)\s+(\d{4})/i
  const match = description.match(releasedPattern)

  if (match) {
    const monthName = match[1]
    const year = match[2]

    // Map month names to numbers
    const monthMap = {
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
    }

    const month = monthMap[monthName.toLowerCase()]
    if (month) {
      // Use first day of the month as default
      return `${year}-${month}-01`
    }
  }

  return null
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

    // Skip if releaseDate already exists
    if (manifest.releaseDate !== undefined) {
      console.log(`  ⏭️  ${fileName} - releaseDate already exists: ${manifest.releaseDate}`)
      return { skipped: true }
    }

    // Try to extract release date from description
    let releaseDate = extractReleaseDate(manifest.description)

    // If not found in main description, check translations
    if (!releaseDate && manifest.translations) {
      for (const locale of Object.values(manifest.translations)) {
        if (locale.description) {
          releaseDate = extractReleaseDate(locale.description)
          if (releaseDate) break
        }
      }
    }

    // Set to null if still not found
    if (!releaseDate) {
      releaseDate = null
    }

    // Insert releaseDate after platformUrls
    const orderedManifest = {}
    let inserted = false

    for (const [key, value] of Object.entries(manifest)) {
      orderedManifest[key] = value
      if (key === 'platformUrls' && !inserted) {
        orderedManifest.releaseDate = releaseDate
        inserted = true
      }
    }

    // If platformUrls doesn't exist, add releaseDate before benchmarks
    if (!inserted) {
      const newManifest = {}
      for (const [key, value] of Object.entries(manifest)) {
        if (key === 'benchmarks' && !inserted) {
          newManifest.releaseDate = releaseDate
          inserted = true
        }
        newManifest[key] = value
      }
      // If benchmarks also doesn't exist, just append at the end
      if (!inserted) {
        Object.assign(orderedManifest, manifest)
        orderedManifest.releaseDate = releaseDate
      } else {
        Object.assign(orderedManifest, newManifest)
      }
    }

    // Write back to file
    const jsonContent = `${JSON.stringify(orderedManifest, null, 2)}\n`
    await fs.writeFile(filePath, jsonContent, 'utf-8')

    const dateStr = releaseDate || 'null'
    console.log(`  ✅ ${fileName} - Added releaseDate: ${dateStr}`)
    return { skipped: false, releaseDate }
  } catch (error) {
    console.error(`  ❌ ${fileName} - Error: ${error.message}`)
    return { skipped: false, error: error.message }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Adding releaseDate field to all model manifests...\n')

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
      extracted: 0,
      nullDates: 0,
    }

    for (const fileName of jsonFiles) {
      const filePath = path.join(MODELS_DIR, fileName)
      const result = await processModelFile(filePath, fileName)

      if (result.skipped) {
        stats.skipped++
      } else if (result.error) {
        stats.errors++
      } else {
        stats.processed++
        if (result.releaseDate) {
          stats.extracted++
        } else {
          stats.nullDates++
        }
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 Summary')
    console.log('='.repeat(60))
    console.log(`Total files: ${stats.total}`)
    console.log(`Processed: ${stats.processed}`)
    console.log(`Skipped (already has releaseDate): ${stats.skipped}`)
    console.log(`Extracted from description: ${stats.extracted}`)
    console.log(`Set to null (not found): ${stats.nullDates}`)
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
