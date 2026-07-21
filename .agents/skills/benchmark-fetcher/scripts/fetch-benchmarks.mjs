#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { BENCHMARKS, MODELS_DIR } from './lib/config.mjs'

const HELP = `Usage:
  node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs <evidence.json> [--apply] [--replace]

Default behavior is preview-only. --replace is valid only with --apply.`

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP)
  process.exit(0)
}

const apply = args.includes('--apply')
const replace = args.includes('--replace')
const inputPath = args.find(arg => !arg.startsWith('--'))

if (!inputPath || (replace && !apply)) {
  console.error(HELP)
  process.exit(1)
}

const isoDate = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/

function isValidDate(value) {
  if (!isoDate.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  const today = new Date().toISOString().slice(0, 10)
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value && value <= today
  )
}

function requireText(record, field, index, errors) {
  if (typeof record[field] !== 'string' || record[field].trim() === '') {
    errors.push(`records[${index}].${field} must be a non-empty string`)
  }
}

function validateRecord(record, index, seen, errors) {
  for (const field of [
    'modelId',
    'modelLabel',
    'benchmark',
    'benchmarkVersion',
    'evaluation',
    'sourceUrl',
    'sourceTitle',
    'observedAt',
    'verifiedBy',
  ]) {
    requireText(record, field, index, errors)
  }

  const definition = BENCHMARKS[record.benchmark]
  if (!definition) {
    errors.push(`records[${index}].benchmark must be one of: ${Object.keys(BENCHMARKS).join(', ')}`)
  }
  if (typeof record.score !== 'number' || !Number.isFinite(record.score)) {
    errors.push(`records[${index}].score must be a finite number`)
  } else if (
    definition &&
    (record.score < definition.min || (definition.max !== null && record.score > definition.max))
  ) {
    const range =
      definition.max === null
        ? `at least ${definition.min}`
        : `between ${definition.min} and ${definition.max}`
    errors.push(`records[${index}].score must be ${range} for ${record.benchmark}`)
  }
  if (typeof record.sourceUrl === 'string' && !record.sourceUrl.startsWith('https://')) {
    errors.push(`records[${index}].sourceUrl must use HTTPS`)
  }
  if (typeof record.observedAt === 'string' && !isValidDate(record.observedAt)) {
    errors.push(`records[${index}].observedAt must use YYYY-MM-DD`)
  }

  const identity = `${record.modelId}:${record.benchmark}`
  if (seen.has(identity)) {
    errors.push(`records[${index}] duplicates ${identity}`)
  }
  seen.add(identity)
}

function buildSource(record) {
  return {
    url: record.sourceUrl,
    title: `${record.sourceTitle} — ${record.benchmarkVersion}; ${record.evaluation}; label: ${record.modelLabel}; observed ${record.observedAt}`,
    fields: [`benchmarks.${record.benchmark}`],
  }
}

function mergeSource(sources, incoming) {
  const result = Array.isArray(sources) ? structuredClone(sources) : []
  const existing = result.find(
    source => source.url === incoming.url && source.title === incoming.title
  )
  if (!existing) {
    result.push(incoming)
    return result
  }

  existing.fields = [...new Set([...(existing.fields || []), ...incoming.fields])]
  return result
}

async function writeAtomic(filePath, manifest) {
  const temporaryPath = `${filePath}.benchmark-fetcher.tmp`
  await fs.writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  await fs.rename(temporaryPath, filePath)
}

async function main() {
  const raw = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'))
  const records = raw.records
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('Input must contain a non-empty records array')
  }

  const errors = []
  const seen = new Set()
  for (const [index, record] of records.entries()) {
    validateRecord(record, index, seen, errors)
  }
  if (errors.length > 0) {
    throw new Error(`Invalid evidence:\n- ${errors.join('\n- ')}`)
  }

  const staged = new Map()
  const changes = []
  const conflicts = []

  for (const record of records) {
    const manifestPath = path.join(MODELS_DIR, `${record.modelId}.json`)
    let manifest = staged.get(record.modelId)
    if (!manifest) {
      try {
        manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
      } catch (error) {
        if (error.code === 'ENOENT') throw new Error(`Unknown modelId: ${record.modelId}`)
        throw error
      }
      if (manifest.id !== record.modelId) {
        throw new Error(`Manifest ID mismatch in ${manifestPath}`)
      }
      if (!manifest.benchmarks || typeof manifest.benchmarks !== 'object') {
        throw new Error(`Manifest has no benchmarks object: ${manifestPath}`)
      }
      staged.set(record.modelId, manifest)
    }

    const previous = manifest.benchmarks?.[record.benchmark]
    if (previous === record.score) {
      manifest.sources = mergeSource(manifest.sources, buildSource(record))
      if (!manifest.lastVerifiedAt || record.observedAt >= manifest.lastVerifiedAt) {
        manifest.lastVerifiedAt = record.observedAt
        manifest.verifiedBy = record.verifiedBy
      }
      if (!manifest.confidence) manifest.confidence = 'medium'
      changes.push({ ...record, previous, action: 'verify' })
      continue
    }
    if (previous !== null && previous !== undefined && !replace) {
      conflicts.push({ ...record, previous })
      continue
    }

    manifest.benchmarks[record.benchmark] = record.score
    manifest.sources = mergeSource(manifest.sources, buildSource(record))
    if (!manifest.lastVerifiedAt || record.observedAt >= manifest.lastVerifiedAt) {
      manifest.lastVerifiedAt = record.observedAt
      manifest.verifiedBy = record.verifiedBy
    }
    if (!manifest.confidence) manifest.confidence = 'medium'
    changes.push({
      ...record,
      previous,
      action: previous === null || previous === undefined ? 'add' : 'replace',
    })
  }

  console.log(apply ? 'Benchmark import plan (apply requested)' : 'Benchmark import preview')
  for (const change of changes) {
    console.log(
      `- ${change.modelId}.${change.benchmark}: ${String(change.previous)} -> ${change.score} (${change.action})`
    )
  }
  for (const conflict of conflicts) {
    console.error(
      `- CONFLICT ${conflict.modelId}.${conflict.benchmark}: ${conflict.previous} -> ${conflict.score}; review comparability and use --apply --replace only if justified`
    )
  }

  if (conflicts.length > 0) {
    throw new Error(`${conflicts.length} overwrite conflict(s) require explicit review`)
  }
  if (!apply) {
    console.log('Preview only; no files changed.')
    return
  }

  const changedModelIds = new Set(changes.map(change => change.modelId))
  for (const modelId of changedModelIds) {
    await writeAtomic(path.join(MODELS_DIR, `${modelId}.json`), staged.get(modelId))
  }
  console.log(`Applied changes to ${changedModelIds.size} manifest(s). Review the Git diff.`)
}

main().catch(error => {
  console.error(`Benchmark import failed: ${error.message}`)
  process.exit(1)
})
