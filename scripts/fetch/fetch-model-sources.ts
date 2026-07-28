#!/usr/bin/env node

import { syncModelSourceDigests } from './lib/model-source-sync'

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag)
}

function currentShanghaiDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

async function main(): Promise<void> {
  const write = hasFlag('--write')
  const check = hasFlag('--check')
  if (write && check) {
    throw new Error('Use either --write or --check, not both.')
  }

  const result = await syncModelSourceDigests({
    rootDir: process.cwd(),
    write,
    observedAt: currentShanghaiDate(),
  })

  console.log(`Checked ${result.checked} monitored model sources.`)
  if (result.changes.length === 0) {
    console.log('All monitored pricing and lifecycle sources are unchanged.')
    return
  }

  for (const change of result.changes) {
    console.log(
      `${write ? 'Recorded' : 'Detected'} source change for models/${change.modelId}: ${change.fields.join(', ')}`
    )
    console.log(`  ${change.url}`)
  }

  if (check) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
