#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manifestsDir = join(__dirname, '../../manifests/models')
const apiDataFile = join(__dirname, '../../tmp/models-dev-api.json')
const mappingFile = join(__dirname, '../../manifests/mapping.json')

interface ComparisonResult {
  match: boolean
  skip: boolean
  manifest?: unknown
  api?: unknown
}

interface FieldComparison {
  field: string
  manifestKey: string
  apiKey: string
  match: boolean
  skip: boolean
  manifest?: unknown
  api?: unknown
}

interface NormalizedApiModel {
  name: string
  releaseDate: string | null
  contextWindow: number | null
  maxOutput: number | null
  inputModalities: string[]
  tokenPricing: {
    input: number | null
    output: number | null
    cache: number | null
  }
  capabilities: string[]
}

interface ModelResult {
  modelId: string
  apiModelId: string
  vendor: string
  vendorKey: string
  vendorExists: boolean
  modelExists: boolean
  comparisons: FieldComparison[]
}

interface ApiData {
  [vendorKey: string]: {
    models?: {
      [modelId: string]: {
        name: string
        release_date?: string | null
        limit?: {
          context?: number | null
          output?: number | null
        }
        modalities?: {
          input?: string[]
        }
        cost?: {
          input?: number | null
          output?: number | null
          cache_read?: number | null
        }
        tool_call?: boolean
        reasoning?: boolean
      }
    }
  }
}

interface MappingData {
  vendors: Record<string, string>
  models: Record<string, string>
}

function getPrimaryManifestRates(manifest: {
  tokenPricing?: {
    status?: string
    primaryOffer?: string | null
    offers?: Array<{
      id: string
      tiers: Array<{
        rates: {
          input: number | null
          output: number | null
          cacheRead: number | null
        }
      }>
    }>
  }
}): { input: number | null; output: number | null; cacheRead: number | null } {
  const pricing = manifest.tokenPricing
  if (pricing?.status !== 'available') return { input: null, output: null, cacheRead: null }
  const offer =
    pricing.offers?.find(candidate => candidate.id === pricing.primaryOffer) ?? pricing.offers?.[0]
  const rates = offer?.tiers[0]?.rates
  return {
    input: rates?.input ?? null,
    output: rates?.output ?? null,
    cacheRead: rates?.cacheRead ?? null,
  }
}

// Helper to compare values and return match status
function compare(
  manifestValue: unknown,
  apiValue: unknown,
  _manifestKey: string,
  _apiKey: string
): ComparisonResult {
  if (manifestValue === null && apiValue === undefined) return { match: true, skip: true }
  if (manifestValue === null && apiValue === null) return { match: true, skip: false }
  if (manifestValue === null && apiValue !== undefined)
    return { match: false, skip: false, manifest: null, api: apiValue }
  if (manifestValue !== null && apiValue === undefined)
    return { match: false, skip: false, manifest: manifestValue, api: null }
  if (manifestValue === apiValue) return { match: true, skip: false }
  return { match: false, skip: false, manifest: manifestValue, api: apiValue }
}

// Convert API model data to manifest-compatible format for comparison
function normalizeApiModel(apiModel: Record<string, unknown> | undefined): NormalizedApiModel {
  if (!apiModel) {
    return {
      name: '',
      releaseDate: null,
      contextWindow: null,
      maxOutput: null,
      inputModalities: [],
      tokenPricing: {
        input: null,
        output: null,
        cache: null,
      },
      capabilities: [],
    }
  }

  const model = apiModel as {
    name: string
    release_date?: string | null
    limit?: { context?: number | null; output?: number | null } | null
    modalities?: { input?: string[] } | null
    cost?: { input?: number | null; output?: number | null; cache_read?: number | null } | null
    tool_call?: boolean
    reasoning?: boolean
  }

  return {
    name: model.name,
    releaseDate: model.release_date || null,
    contextWindow: model.limit?.context || null,
    maxOutput: model.limit?.output || null,
    inputModalities: model.modalities?.input || [],
    tokenPricing: {
      input: model.cost?.input || null,
      output: model.cost?.output || null,
      cache: model.cost?.cache_read || null,
    },
    capabilities: [
      ...(model.tool_call ? ['function-calling', 'tool-choice', 'structured-outputs'] : []),
      ...(model.reasoning ? ['reasoning'] : []),
    ].sort(),
  }
}

async function main(): Promise<void> {
  // Read API reference data and mapping
  const apiData = JSON.parse(await readFile(apiDataFile, 'utf-8')) as ApiData
  const { vendors: vendorMapping, models: modelMapping } = JSON.parse(
    await readFile(mappingFile, 'utf-8')
  ) as MappingData

  // Read all model manifests
  const files = await readdir(manifestsDir)
  const manifestFiles = files.filter(f => f.endsWith('.json'))

  const results: ModelResult[] = []

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

    const comparisons: FieldComparison[] = []
    if (modelExists && apiModel) {
      const normalizedApi = normalizeApiModel(apiModel)

      // Compare releaseDate
      comparisons.push({
        field: 'releaseDate',
        manifestKey: 'releaseDate',
        apiKey: 'release_date',
        ...compare(manifest.releaseDate, normalizedApi.releaseDate, 'releaseDate', 'release_date'),
      })

      // Compare contextWindow
      comparisons.push({
        field: 'contextWindow',
        manifestKey: 'contextWindow',
        apiKey: 'limit.context',
        ...compare(
          manifest.contextWindow,
          normalizedApi.contextWindow,
          'contextWindow',
          'limit.context'
        ),
      })

      // Compare maxOutput
      comparisons.push({
        field: 'maxOutput',
        manifestKey: 'maxOutput',
        apiKey: 'limit.output',
        ...compare(manifest.maxOutput, normalizedApi.maxOutput, 'maxOutput', 'limit.output'),
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
      const manifestRates = getPrimaryManifestRates(manifest)
      const inputPriceMatch = compare(
        manifestRates.input,
        normalizedApi.tokenPricing.input,
        'input',
        'input'
      )
      comparisons.push({
        field: 'tokenPricing.input',
        manifestKey: 'tokenPricing.offers[].tiers[].rates.input',
        apiKey: 'cost.input',
        ...inputPriceMatch,
      })

      const outputPriceMatch = compare(
        manifestRates.output,
        normalizedApi.tokenPricing.output,
        'output',
        'output'
      )
      comparisons.push({
        field: 'tokenPricing.output',
        manifestKey: 'tokenPricing.offers[].tiers[].rates.output',
        apiKey: 'cost.output',
        ...outputPriceMatch,
      })

      const cachePriceMatch = compare(
        manifestRates.cacheRead,
        normalizedApi.tokenPricing.cache,
        'cache',
        'cache_read'
      )
      comparisons.push({
        field: 'tokenPricing.cacheRead',
        manifestKey: 'tokenPricing.offers[].tiers[].rates.cacheRead',
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
