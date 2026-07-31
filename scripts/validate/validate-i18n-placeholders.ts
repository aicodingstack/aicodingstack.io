import {
  findNewExactEnglishCandidates,
  findStaleExactEnglishBaselineEntries,
  formatExactEnglishBaselineEntries,
  formatExactEnglishCandidates,
  summarizeExactEnglishCandidates,
  writeExactEnglishBaseline,
} from './lib/i18n-placeholders.js'

const writeBaseline = process.argv.includes('--write-baseline')

if (writeBaseline) {
  const candidates = writeExactEnglishBaseline()
  const summary = summarizeExactEnglishCandidates(candidates)
  console.log(
    [
      `Recorded ${summary.total} existing exact-English values in the baseline:`,
      `- UI messages: ${summary.messages}`,
      `- MDX content: ${summary.content}`,
      `- Manifest translations: ${summary.manifest}`,
    ].join('\n')
  )
  process.exit(0)
}

const candidates = findNewExactEnglishCandidates()
const staleEntries = findStaleExactEnglishBaselineEntries()

if (candidates.length > 0 || staleEntries.length > 0) {
  const sections: string[] = []

  if (candidates.length > 0) {
    sections.push(
      `Found ${candidates.length} new non-English translation value(s) copied from English:`,
      formatExactEnglishCandidates(candidates)
    )
  }

  if (staleEntries.length > 0) {
    const entryLabel = staleEntries.length === 1 ? 'entry' : 'entries'
    sections.push(
      `Found ${staleEntries.length} stale exact-English baseline ${entryLabel}:`,
      formatExactEnglishBaselineEntries(staleEntries)
    )
  }

  console.error(
    [
      ...sections,
      '',
      'Translate new values and remove stale allowances. If the remaining values',
      'must intentionally stay in English, review them and refresh the baseline with:',
      '  pnpm validate:i18n-placeholders -- --write-baseline',
    ].join('\n')
  )
  process.exit(1)
}

console.log(
  'No new exact-English placeholders found across UI messages, MDX content, or manifests.'
)
