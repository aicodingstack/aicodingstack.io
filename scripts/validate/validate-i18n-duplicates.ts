#!/usr/bin/env tsx

import {
  findDuplicateValueGroups,
  findNewDuplicateValueGroups,
  findStaleDuplicateValueBaselineEntries,
  formatDuplicateValueBaselineEntries,
  formatDuplicateValueGroups,
  readDuplicateValueBaseline,
  writeDuplicateValueBaseline,
} from './lib/i18n-duplicates.js'

const writeBaseline = process.argv.includes('--write-baseline')

if (writeBaseline) {
  const groups = writeDuplicateValueBaseline()
  console.log(`Recorded ${groups.length} reviewed duplicate translation value groups.`)
  process.exit(0)
}

const groups = findDuplicateValueGroups()
const baseline = readDuplicateValueBaseline()
const newGroups = findNewDuplicateValueGroups()
const staleEntries = findStaleDuplicateValueBaselineEntries()

if (newGroups.length > 0 || staleEntries.length > 0) {
  const sections: string[] = []

  if (newGroups.length > 0) {
    sections.push(
      `Found ${newGroups.length} new or changed duplicate translation value group(s):`,
      formatDuplicateValueGroups(newGroups)
    )
  }

  if (staleEntries.length > 0) {
    const entryLabel = staleEntries.length === 1 ? 'entry' : 'entries'
    sections.push(
      `Found ${staleEntries.length} stale duplicate-value baseline ${entryLabel}:`,
      formatDuplicateValueBaselineEntries(staleEntries)
    )
  }

  console.error(
    [
      ...sections,
      '',
      'Reuse an existing translation key where the namespace architecture allows it.',
      'Remove stale allowances. If the remaining duplication is intentional, review',
      'it and refresh the baseline with:',
      '  pnpm validate:i18n-duplicates -- --write-baseline',
    ].join('\n')
  )
  process.exit(1)
}

console.log(
  [
    `Scanned ${groups.length} duplicate English translation value group(s).`,
    `${Object.keys(baseline.reviewedDuplicateGroups).length} reviewed group(s); no new duplication found.`,
    'Repeated leaf names across different namespace files are valid and are not treated as collisions.',
  ].join('\n')
)
