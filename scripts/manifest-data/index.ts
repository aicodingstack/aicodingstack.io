#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  type MaintenanceEvent,
  type MaintenanceMode,
  ManifestDataMaintenanceError,
  runManifestDataMaintenance,
  SOURCE_NAMES,
  type SourceName,
} from './lib/maintenance'

function usage(): string {
  return [
    'Usage: pnpm manifest-data:<validate|check|update> [--only=source,...] [--json]',
    `Sources: ${SOURCE_NAMES.join(', ')}`,
    '',
    'validate  Run deterministic local schema, semantic, i18n, and health checks.',
    'check     Run local validation, then read-only checks against configured sources.',
    'update    Update source-backed fields, regenerate derived data, then validate.',
  ].join('\n')
}

function parseArguments(arguments_: string[]): {
  mode: MaintenanceMode
  sources?: SourceName[]
  json: boolean
} {
  const [modeArgument, ...rawFlags] = arguments_
  const flags = rawFlags.filter(flag => flag !== '--')
  if (!['validate', 'check', 'update'].includes(modeArgument ?? '')) {
    throw new Error(usage())
  }
  const unknownFlags = flags.filter(flag => flag !== '--json' && !flag.startsWith('--only='))
  if (unknownFlags.length > 0)
    throw new Error(`Unknown arguments: ${unknownFlags.join(', ')}\n\n${usage()}`)

  const onlyArguments = flags.filter(flag => flag.startsWith('--only='))
  if (onlyArguments.length > 1) throw new Error('Use --only at most once.')
  const requestedSources = onlyArguments[0]
    ?.slice('--only='.length)
    .split(',')
    .map(source => source.trim())
    .filter(Boolean)
  const invalidSources = requestedSources?.filter(
    source => !SOURCE_NAMES.includes(source as SourceName)
  )
  if (invalidSources?.length) throw new Error(`Unknown sources: ${invalidSources.join(', ')}`)

  return {
    mode: modeArgument as MaintenanceMode,
    ...(requestedSources ? { sources: [...new Set(requestedSources)] as SourceName[] } : {}),
    json: flags.includes('--json'),
  }
}

function renderEvent(event: MaintenanceEvent): void {
  if (event.phase === 'start') {
    process.stdout.write(`… ${event.name}\n`)
    return
  }
  const step = event.step
  if (!step) return
  const marker =
    step.status === 'failed'
      ? '✗'
      : step.status === 'drift'
        ? '!'
        : step.status === 'current'
          ? '·'
          : '✓'
  process.stdout.write(`${marker} ${step.name}: ${step.summary}\n`)
}

async function main(): Promise<void> {
  const arguments_ = parseArguments(process.argv.slice(2))
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  try {
    const report = await runManifestDataMaintenance({
      rootDir,
      mode: arguments_.mode,
      ...(arguments_.sources ? { sources: arguments_.sources } : {}),
      ...(!arguments_.json ? { onEvent: renderEvent } : {}),
    })
    if (arguments_.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(
        `Manifest data ${report.mode} passed: ${report.steps.length} steps, ${report.changes} source changes.`
      )
    }
  } catch (error) {
    if (arguments_.json && error instanceof ManifestDataMaintenanceError) {
      console.error(JSON.stringify(error.report, null, 2))
    } else {
      console.error(error instanceof Error ? error.message : error)
    }
    process.exitCode = 1
  }
}

main()
