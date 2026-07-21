/**
 * Report generator for benchmark fetch completion
 * Generates formatted console output showing results, updates, and next steps
 */

import { BENCHMARK_SOURCES, BENCHMARKS } from './config.mjs'

/**
 * Generate and print completion report
 *
 * @param {Object} benchmarkResults - Results from all benchmark extractions
 * @param {Array} manifestUpdates - Array of manifest update results
 * @param {Array} unmappedModels - Array of unmapped models by benchmark
 * @param {number} executionTime - Total execution time in milliseconds
 * @param {boolean} isDryRun - Whether this was a dry run
 */
export function generateReport(
  benchmarkResults,
  manifestUpdates,
  unmappedModels,
  executionTime,
  isDryRun = false
) {
  console.log(`\n${'='.repeat(80)}`)
  console.log('📊 Benchmark Fetch Report')
  console.log('='.repeat(80))

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE - No manifests were modified\n')
  }

  // Summary section
  printSummary(benchmarkResults, manifestUpdates)

  // Benchmark results
  printBenchmarkResults(benchmarkResults)

  // Manifest updates
  if (!isDryRun && manifestUpdates.length > 0) {
    printManifestUpdates(manifestUpdates)
  }

  // Unmapped models
  if (unmappedModels.length > 0) {
    printUnmappedModels(unmappedModels)
  }

  // Statistics
  printStatistics(benchmarkResults, manifestUpdates, executionTime)

  // Next steps
  printNextSteps(isDryRun, unmappedModels, benchmarkResults)

  console.log(`${'='.repeat(80)}\n`)
}

/**
 * Print summary section
 */
function printSummary(benchmarkResults, manifestUpdates) {
  const totalBenchmarks = Object.keys(benchmarkResults).length
  const successful = Object.values(benchmarkResults).filter(r => r.success).length
  const failed = totalBenchmarks - successful
  const manifestsUpdated = manifestUpdates.filter(u => u.success).length

  console.log('\n📈 Summary')
  console.log('-'.repeat(80))
  console.log(`  Benchmarks fetched:  ${successful}/${totalBenchmarks}`)
  console.log(`  Manifests updated:   ${manifestsUpdated}`)
  console.log(`  Failed extractions:  ${failed}`)
}

/**
 * Print benchmark results
 */
function printBenchmarkResults(benchmarkResults) {
  console.log('\n📊 Benchmark Results')
  console.log('-'.repeat(80))

  const successful = []
  const failed = []

  for (const [benchmarkId, result] of Object.entries(benchmarkResults)) {
    const benchmark = BENCHMARKS.find(b => b.id === benchmarkId)
    const name = benchmark ? benchmark.name : benchmarkId

    if (result.success) {
      const dataCount = result.data instanceof Map ? result.data.size : 0
      successful.push({ name, source: BENCHMARK_SOURCES[benchmarkId], dataCount })
    } else {
      failed.push({
        name,
        source: BENCHMARK_SOURCES[benchmarkId],
        error: result.error,
      })
    }
  }

  if (successful.length > 0) {
    console.log('\n✅ Successfully Fetched:')
    for (const { name, source, dataCount } of successful) {
      console.log(`   ✓ ${name} (${source}) - ${dataCount} models`)
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed to Fetch:')
    for (const { name, source, error } of failed) {
      console.log(`   ✗ ${name} (${source})`)
      console.log(`     Reason: ${error}`)
    }
  }
}

/**
 * Print manifest updates
 */
function printManifestUpdates(manifestUpdates) {
  console.log('\n📝 Manifest Updates')
  console.log('-'.repeat(80))

  const successful = manifestUpdates.filter(u => u.success)
  const failed = manifestUpdates.filter(u => !u.success)

  if (successful.length > 0) {
    console.log(`\n✅ Updated: ${successful.length} manifests\n`)

    for (const update of successful) {
      if (update.changes.length > 0) {
        console.log(`   • ${update.manifestId}: ${update.changes.length} benchmarks updated`)

        for (const change of update.changes) {
          const oldDisplay = formatValue(change.oldValue)
          const newDisplay = formatValue(change.newValue)
          console.log(`     - ${change.field}: ${oldDisplay} → ${newDisplay}`)
        }
        console.log('')
      }
    }
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed Updates: ${failed.length} manifests\n`)

    for (const update of failed) {
      console.log(`   • ${update.manifestId}`)
      console.log(`     Error: ${update.error}`)
    }
  }
}

/**
 * Print unmapped models
 */
function printUnmappedModels(unmappedModels) {
  console.log('\n⚠️  Unmapped Models')
  console.log('-'.repeat(80))
  console.log('\nThe following models were found on leaderboards but could not be')
  console.log('mapped to manifest IDs. Add them to model-name-mappings.json:\n')

  for (const { benchmarkName, models } of unmappedModels) {
    if (models.length > 0) {
      console.log(`${benchmarkName}:`)
      for (const modelName of models) {
        console.log(`  • "${modelName}"`)
      }
      console.log('')
    }
  }

  console.log('Suggestion: Update references/model-name-mappings.json with these entries')
}

/**
 * Print statistics
 */
function printStatistics(benchmarkResults, manifestUpdates, executionTime) {
  console.log('\n📈 Statistics')
  console.log('-'.repeat(80))

  // Count total benchmark values fetched
  let totalValues = 0
  for (const result of Object.values(benchmarkResults)) {
    if (result.success && result.data instanceof Map) {
      totalValues += result.data.size
    }
  }

  // Count total changes
  let totalChanges = 0
  for (const update of manifestUpdates) {
    if (update.success) {
      totalChanges += update.changes.length
    }
  }

  const executionSeconds = (executionTime / 1000).toFixed(1)
  const avgTimePerBenchmark = (executionTime / 1000 / Object.keys(benchmarkResults).length).toFixed(
    1
  )

  console.log(`  Total benchmark values fetched:  ${totalValues}`)
  console.log(`  Total benchmark updates:         ${totalChanges}`)
  console.log(`  Manifests updated:               ${manifestUpdates.length}`)
  console.log(`  Execution time:                  ${executionSeconds}s`)
  console.log(`  Average time per benchmark:      ${avgTimePerBenchmark}s`)
}

/**
 * Print next steps
 */
function printNextSteps(isDryRun, unmappedModels, benchmarkResults) {
  console.log('\n✅ Next Steps')
  console.log('-'.repeat(80))

  const steps = []

  if (isDryRun) {
    steps.push('Run without --dry-run to apply updates to manifests')
  } else {
    steps.push('Review updated manifests in manifests/models/')
  }

  if (unmappedModels.length > 0) {
    steps.push('Add unmapped models to references/model-name-mappings.json')
  }

  const failedBenchmarks = Object.entries(benchmarkResults)
    .filter(([_, result]) => !result.success)
    .map(([id, _]) => id)

  if (failedBenchmarks.length > 0) {
    steps.push(`Retry failed benchmarks: --benchmarks ${failedBenchmarks.join(',')}`)
  }

  if (!isDryRun) {
    steps.push('Run validation: npm run test:validate')
    steps.push('Commit changes when satisfied')
  }

  for (let i = 0; i < steps.length; i++) {
    console.log(`  ${i + 1}. ${steps[i]}`)
  }
}

/**
 * Format value for display
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return 'null'
  }
  return String(value)
}
