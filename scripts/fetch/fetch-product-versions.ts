#!/usr/bin/env node

import { syncProductVersions } from './lib/product-version-sync'

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag)
}

async function main(): Promise<void> {
  const write = hasFlag('--write')
  const check = hasFlag('--check')
  if (write && check) {
    throw new Error('Use either --write or --check, not both.')
  }

  const result = await syncProductVersions({
    rootDir: process.cwd(),
    write,
  })

  console.log(`Checked ${result.checked} tracked products.`)
  if (result.changes.length === 0) {
    console.log('All tracked product versions are current.')
    return
  }

  for (const change of result.changes) {
    console.log(
      `${write ? 'Updated' : 'Would update'} ${change.category}/${change.id}: ${change.previousVersion} -> ${change.nextVersion}`
    )
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
