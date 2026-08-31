#!/usr/bin/env node

import { syncGithubStars } from './lib/github-stars-sync'

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
  const check = hasFlag('--check')
  const write = hasFlag('--write') || !check
  if (write && check) throw new Error('Use either --write or --check, not both.')

  const result = await syncGithubStars({
    rootDir: process.cwd(),
    write,
    observedAt: currentShanghaiDate(),
  })

  console.log(`Checked ${result.checked} GitHub repositories.`)
  if (result.changes.length === 0) {
    console.log(
      write ? 'Refreshed the GitHub stars observation date.' : 'All star counts are current.'
    )
    return
  }

  for (const change of result.changes) {
    console.log(
      `${write ? 'Updated' : 'Would update'} ${change.repositoryId}: ${String(change.previousStars)} -> ${change.nextStars}`
    )
  }
  if (check) process.exitCode = 1
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
