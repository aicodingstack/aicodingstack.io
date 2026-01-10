#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manifestsDir = join(__dirname, '../../manifests/models')
const apiDataFile = join(__dirname, '../../tmp/models-dev-api.json')
const mappingFile = join(__dirname, '../../manifests/mapping.json')

// Helper to compare values and return match status
function compare(manifestValue, apiValue, _manifestKey, _apiKey) {
  if (manifestValue === null && apiValue === undefined) return { match: true, skip: true }
  if (manifestValue === null && apiValue === null) return { match: true, skip: false }
  if (manifestValue === null && apiValue !== undefined)
    return { match: false, manifest: null, api: apiValue }
  if (manifestValue !== null && apiValue === undefined)
    return { match: false, manifest: manifestValue, api: null }
  if (manifestValue === apiValue) return { match: true, skip: false }
  return { match: false, manifest: manifestValue, api: apiValue }
}

// Convert API model data to manifest-compatible format for comparison
function normalizeApiModel(apiModel) {
  return {
    name: apiModel.name,
    releaseDate: apiModel.release_date || null,
    contextWindow: apiModel.limit?.context || null,
    maxOutput: apiModel.limit?.output || null,
    inputModalities: apiModel.modalities?.input || [],
    tokenPricing: {
      input: apiModel.cost?.input || null,
      output: apiModel.cost?.output || null,
      cache: apiModel.cost?.cache_read || null,
    },
    capabilities: [
      ...(apiModel.tool_call ? ['function-calling', 'tool-choice', 'structured-outputs'] : []),
      ...(apiModel.reasoning ? ['reasoning'] : []),
    ].sort(),
  }
}

async function main() {
  // Read API reference data and mapping
  const apiData = JSON.parse(await readFile(apiDataFile, 'utf-8'))
  const { vendors: vendorMapping, models: modelMapping } = JSON.parse(
    await readFile(mappingFile, 'utf-8')
  )

  // Read all model manifests
  const files = await readdir(manifestsDir)
  const manifestFiles = files.filter(f => f.endsWith('.json'))

  const results = []

  for (const file of manifestFiles) {
    const manifest = JSON.parse(await readFile(join(manifestsDir, file), 'utf-8'))

    const modelId = manifest.id
    const vendor = manifest.vendor
    // Use mapping.json if available, otherwise lowercase the vendor name
    const vendorKey = vendorMapping[vendor] ?? vendor.toLowerCase()
    // Use mapping.json for model IDs if available
    const apiModelId = modelMapping[modelId] ?? modelId

    // Check if vendor exists in API data
    const vendorData = apiData[vendorKey]
    const vendorExists = !!vendorData

    // Check if model exists under that vendor
    const apiModel = vendorData?.models?.[apiModelId]
    const modelExists = !!apiModel

    const comparisons = []
    if (modelExists) {
      const normalizedApi = normalizeApiModel(apiModel)

      // Compare releaseDate
      comparisons.push({
        field: 'releaseDate',
        manifestKey: 'releaseDate',
        apiKey: 'release_date',
        ...compare(manifest.releaseDate, normalizedApi.releaseDate),
      })

      // Compare contextWindow
      comparisons.push({
        field: 'contextWindow',
        manifestKey: 'contextWindow',
        apiKey: 'limit.context',
        ...compare(manifest.contextWindow, normalizedApi.contextWindow),
      })

      // Compare maxOutput
      comparisons.push({
        field: 'maxOutput',
        manifestKey: 'maxOutput',
        apiKey: 'limit.output',
        ...compare(manifest.maxOutput, normalizedApi.maxOutput),
      })

      // Compare inputModalities
      const modalitiesMatch =
        JSON.stringify(manifest.inputModalities.sort()) ===
        JSON.stringify(normalizedApi.inputModalities.sort())
      comparisons.push({
        field: 'inputModalities',
        manifestKey: 'inputModalities',
        apiKey: 'modalities.input',
        match: !!modalitiesMatch,
        skip: false,
        ...(!modalitiesMatch
          ? { manifest: manifest.inputModalities, api: normalizedApi.inputModalities }
          : {}),
      })

      // Compare tokenPricing
      const inputPriceMatch = compare(
        manifest.tokenPricing.input,
        normalizedApi.tokenPricing.input,
        'input',
        'input'
      )
      comparisons.push({
        field: 'tokenPricing.input',
        manifestKey: 'tokenPricing.input',
        apiKey: 'cost.input',
        ...inputPriceMatch,
      })

      const outputPriceMatch = compare(
        manifest.tokenPricing.output,
        normalizedApi.tokenPricing.output,
        'output',
        'output'
      )
      comparisons.push({
        field: 'tokenPricing.output',
        manifestKey: 'tokenPricing.output',
        apiKey: 'cost.output',
        ...outputPriceMatch,
      })

      const cachePriceMatch = compare(
        manifest.tokenPricing.cache,
        normalizedApi.tokenPricing.cache,
        'cache',
        'cache_read'
      )
      comparisons.push({
        field: 'tokenPricing.cache',
        manifestKey: 'tokenPricing.cache',
        apiKey: 'cost.cache_read',
        ...cachePriceMatch,
      })

      // Compare capabilities
      const capabilitiesMatch =
        JSON.stringify(manifest.capabilities.sort()) ===
        JSON.stringify(normalizedApi.capabilities.sort())
      comparisons.push({
        field: 'capabilities',
        manifestKey: 'capabilities',
        apiKey: 'tool_call/reasoning',
        match: !!capabilitiesMatch,
        skip: false,
        ...(!capabilitiesMatch
          ? { manifest: manifest.capabilities, api: normalizedApi.capabilities }
          : {}),
      })
    }

    results.push({
      modelId,
      apiModelId,
      vendor,
      vendorKey,
      vendorExists,
      modelExists,
      comparisons,
    })
  }

  // Group by match status and field mismatches
  const matched = results.filter(r => r.modelExists)
  const unmatched = results.filter(r => !r.modelExists)
  const withMismatches = matched.filter(r => r.comparisons.some(c => !c.match && !c.skip))

  // Output matched models with all fields matching
  console.log('Matched Models (no field mismatches):')
  console.log('=======================================\n')
  const perfectlyMatched = matched.filter(r => !r.comparisons.some(c => !c.match && !c.skip))
  for (const r of perfectlyMatched) {
    const modelDisplay = r.apiModelId !== r.modelId ? `${r.modelId} → ${r.apiModelId}` : r.modelId
    console.log(`  ${modelDisplay} | ${r.vendor} (${r.vendorKey})`)
  }

  // Output matched models with field mismatches
  console.log(`\nMatched Models (with field mismatches):`)
  console.log('========================================\n')
  for (const r of withMismatches) {
    const modelDisplay = r.apiModelId !== r.modelId ? `${r.modelId} → ${r.apiModelId}` : r.modelId
    console.log(`  ${modelDisplay} | ${r.vendor} (${r.vendorKey})`)
    for (const comp of r.comparisons.filter(c => !c.match && !c.skip)) {
      const mValue = JSON.stringify(comp.manifest)
      const aValue = JSON.stringify(comp.api)
      console.log(`    ✗ ${comp.field} (manifest: ${mValue}, api: ${aValue})`)
    }
  }

  // Output matched models with skipped fields (null in manifest)
  console.log(`\nMatched Models (with skipped fields - null in manifest):`)
  console.log('========================================================\n')
  const withSkipped = matched.filter(r => r.comparisons.some(c => c.skip))
  for (const r of withSkipped) {
    const modelDisplay = r.apiModelId !== r.modelId ? `${r.modelId} → ${r.apiModelId}` : r.modelId
    console.log(`  ${modelDisplay} | ${r.vendor} (${r.vendorKey})`)
    for (const comp of r.comparisons.filter(c => c.skip)) {
      console.log(`    → ${comp.field}: null (api: ${JSON.stringify(comp.api ?? 'undefined')})`)
    }
  }

  // Output unmatched models
  console.log(`\nUnmatched Models:`)
  console.log('=================\n')
  for (const r of unmatched) {
    const vendorStatus = r.vendorExists ? '✓' : '✗'
    const modelDisplay = r.apiModelId !== r.modelId ? `${r.modelId} → ${r.apiModelId}` : r.modelId
    console.log(`  ${modelDisplay} | ${r.vendor} (${r.vendorKey}) | Vendor: ${vendorStatus}`)
  }

  // Summary
  const total = results.length
  console.log(`\nSummary:`)
  console.log(`  Total models: ${total}`)
  console.log(`  Perfectly matched: ${perfectlyMatched.length}`)
  console.log(`  Matched with mismatches: ${withMismatches.length}`)
  console.log(
    `  Matched with skipped fields: ${withSkipped.filter(r => !r.comparisons.some(c => !c.match && !c.skip)).length}`
  )
  console.log(`  Not found in API: ${unmatched.length}`)
}

main().catch(console.error)
