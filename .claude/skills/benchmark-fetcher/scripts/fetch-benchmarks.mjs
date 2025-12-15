#!/usr/bin/env node

/**
 * Benchmark Fetcher - Main Entry Point
 *
 * Usage:
 *   node fetch-benchmarks.mjs
 *   node fetch-benchmarks.mjs --benchmarks swebench,terminalBench
 *   node fetch-benchmarks.mjs --models claude-sonnet-4-5,gpt-4o
 *   node fetch-benchmarks.mjs --dry-run
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { extractors } from './lib/benchmark-extractors.mjs'
import { BENCHMARKS, DEBUG_CONFIG, MANIFEST_PATHS, RETRY_CONFIG } from './lib/config.mjs'
import { updateManifests } from './lib/manifest-updater.mjs'
import { getUnmappedModels } from './lib/model-name-mapper.mjs'
import { generateReport } from './lib/report-generator.mjs'

// Parse command-line arguments
const args = parseArgs(process.argv.slice(2))

// Validate arguments
validateArgs(args)

// Main execution
const startTime = Date.now()

main()
  .then(() => {
    console.log('\n✅ Benchmark fetch completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Benchmark fetch failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  })

/**
 * Main workflow
 */
async function main() {
  console.log('🤖 Benchmark Fetcher')
  console.log('='.repeat(80))

  // 1. Load configuration
  console.log('\n📋 Loading configuration...')
  const mappings = await loadMappings()
  const manifests = await loadAllManifests()

  console.log(`  ✓ Loaded ${Object.keys(manifests).length} model manifests`)
  console.log(`  ✓ Loaded mapping configuration (version ${mappings.version})`)

  if (args.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No manifests will be modified')
  }

  // Filter benchmarks if specified
  const benchmarksToFetch = args.benchmarks
    ? BENCHMARKS.filter(b => args.benchmarks.includes(b.id))
    : BENCHMARKS

  console.log(`\n📊 Will fetch ${benchmarksToFetch.length} benchmarks`)

  // 2. Initialize MCP tools (placeholder - actual MCP tools will be injected)
  const mcpTools = await initializeMCPTools()

  // 3. Process each benchmark sequentially
  console.log(`\n${'='.repeat(80)}`)
  const benchmarkResults = {}

  for (const benchmark of benchmarksToFetch) {
    console.log(`\n📊 Fetching ${benchmark.name} (${benchmark.id})`)
    console.log('-'.repeat(80))

    try {
      const result = await extractWithRetry(extractors[benchmark.id], mcpTools, mappings, benchmark)
      benchmarkResults[benchmark.id] = {
        success: true,
        ...result,
      }

      const dataCount = result.data instanceof Map ? result.data.size : 0
      console.log(`  ✅ Success! Extracted ${dataCount} model scores`)
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`)
      benchmarkResults[benchmark.id] = {
        success: false,
        error: error.message,
        data: new Map(),
        unmappedModels: [],
      }
    }
  }

  // 4. Update manifests (unless dry-run)
  let manifestUpdates = []

  if (!args.dryRun) {
    console.log(`\n${'='.repeat(80)}`)
    console.log('💾 Updating Manifests')
    console.log('='.repeat(80))

    // Filter manifests if specific models were requested
    let manifestsToUpdate = manifests
    if (args.models) {
      manifestsToUpdate = {}
      for (const modelId of args.models) {
        if (manifests[modelId]) {
          manifestsToUpdate[modelId] = manifests[modelId]
        }
      }
    }

    manifestUpdates = await updateManifests(
      manifestsToUpdate,
      benchmarkResults,
      MANIFEST_PATHS.modelsDir
    )

    console.log(`\n  ✅ Updated ${manifestUpdates.filter(u => u.success).length} manifests`)
  }

  // 5. Generate completion report
  const unmappedModels = getUnmappedModels(benchmarkResults, mappings)
  const executionTime = Date.now() - startTime

  generateReport(benchmarkResults, manifestUpdates, unmappedModels, executionTime, args.dryRun)

  // 6. Cleanup (if needed)
  await cleanupMCPTools(mcpTools)
}

/**
 * Extract benchmark data with retry logic
 */
async function extractWithRetry(extractor, mcpTools, mappings, benchmark) {
  let lastError = null

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const result = await extractor(mcpTools, mappings)
      return result
    } catch (error) {
      lastError = error
      console.error(`  ⚠️  Attempt ${attempt}/${RETRY_CONFIG.maxAttempts} failed: ${error.message}`)

      if (attempt < RETRY_CONFIG.maxAttempts) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          RETRY_CONFIG.initialDelay * RETRY_CONFIG.backoffFactor ** (attempt - 1),
          RETRY_CONFIG.maxDelay
        )
        console.log(`  ⏳ Retrying in ${delay / 1000}s...`)
        await sleep(delay)
      } else {
        // Final attempt failed - take debug screenshot if enabled
        if (DEBUG_CONFIG.saveScreenshots && mcpTools.take_screenshot) {
          const screenshotPath = path.join(DEBUG_CONFIG.screenshotDir, `${benchmark.id}-error.png`)
          try {
            await fs.mkdir(DEBUG_CONFIG.screenshotDir, { recursive: true })
            await mcpTools.take_screenshot({ filePath: screenshotPath })
            console.log(`  📸 Debug screenshot saved: ${screenshotPath}`)
          } catch (_screenshotError) {
            // Ignore screenshot errors
          }
        }
      }
    }
  }

  throw lastError
}

/**
 * Load model name mappings from configuration file
 */
async function loadMappings() {
  const content = await fs.readFile(MANIFEST_PATHS.mappings, 'utf8')
  return JSON.parse(content)
}

/**
 * Load all model manifests from manifests/models/
 */
async function loadAllManifests() {
  const manifestFiles = await fs.readdir(MANIFEST_PATHS.modelsDir)
  const manifests = {}

  for (const file of manifestFiles) {
    if (!file.endsWith('.json')) {
      continue
    }

    const manifestPath = path.join(MANIFEST_PATHS.modelsDir, file)
    const content = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(content)

    if (manifest.id) {
      manifests[manifest.id] = manifest
    }
  }

  return manifests
}

/**
 * Initialize MCP Chrome DevTools tools
 * NOTE: This is a placeholder. In actual execution, MCP tools will be available
 * through the Claude Code environment automatically.
 */
async function initializeMCPTools() {
  // In the Claude Code environment, MCP tools are available globally
  // This function is a placeholder for any initialization logic needed

  // Check if MCP tools are available
  if (typeof mcp__chrome_devtools__navigate_page === 'undefined') {
    console.warn('⚠️  Warning: MCP Chrome DevTools tools not detected')
    console.warn('   This script requires Chrome DevTools MCP to be enabled')
    console.warn('   Extractors will fail if MCP tools are not available')
  }

  return {
    navigate_page: mcp__chrome_devtools__navigate_page,
    wait_for: mcp__chrome_devtools__wait_for,
    take_snapshot: mcp__chrome_devtools__take_snapshot,
    take_screenshot: mcp__chrome_devtools__take_screenshot,
  }
}

/**
 * Cleanup MCP tools
 */
async function cleanupMCPTools(_mcpTools) {
  // No cleanup needed currently
  // MCP tools are managed by Claude Code environment
}

/**
 * Parse command-line arguments
 */
function parseArgs(argv) {
  const args = {
    benchmarks: null, // Array of benchmark IDs or null for all
    models: null, // Array of model IDs or null for all
    dryRun: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--benchmarks' && i + 1 < argv.length) {
      args.benchmarks = argv[i + 1].split(',').map(s => s.trim())
      i++
    } else if (arg === '--models' && i + 1 < argv.length) {
      args.models = argv[i + 1].split(',').map(s => s.trim())
      i++
    } else if (arg === '--dry-run') {
      args.dryRun = true
    }
  }

  return args
}

/**
 * Validate command-line arguments
 */
function validateArgs(args) {
  if (args.benchmarks) {
    const validBenchmarkIds = BENCHMARKS.map(b => b.id)
    for (const benchmarkId of args.benchmarks) {
      if (!validBenchmarkIds.includes(benchmarkId)) {
        console.error(`❌ Invalid benchmark ID: ${benchmarkId}`)
        console.error(`   Valid IDs: ${validBenchmarkIds.join(', ')}`)
        process.exit(1)
      }
    }
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
