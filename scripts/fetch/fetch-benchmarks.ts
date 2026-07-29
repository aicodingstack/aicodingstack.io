#!/usr/bin/env node

import { syncBenchmarks } from './lib/benchmark-sync'

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag)
}

async function main(): Promise<void> {
  const write = hasFlag('--write')
  const check = hasFlag('--check')
  if (write && check) {
    throw new Error('Use either --write or --check, not both.')
  }

  const result = await syncBenchmarks({
    rootDir: process.cwd(),
    write,
  })

  console.log(`Checked ${result.checked} exact benchmark mappings.`)
  if (result.changes.length === 0) {
    console.log('All tracked benchmark scores are current.')
    return
  }

  for (const change of result.changes) {
    console.log(
      `${write ? 'Updated' : 'Would update'} models/${change.modelId} ${change.benchmark}: ${change.previousScore} -> ${change.nextScore}`
    )
    console.log(`  ${change.modelLabel}`)
    console.log(`  Source: ${change.sourceUrl}`)
  }

  if (check) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
