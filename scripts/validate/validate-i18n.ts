#!/usr/bin/env tsx
/**
 * Validate i18n translations for metadata
 * Run with: pnpm validate:i18n
 */

import {
  getTranslationStats,
  validateAllPageTranslations,
} from '../../src/lib/metadata/i18n-validation'

async function main() {
  console.log('🔍 Starting i18n translation validation...\n')

  // Show statistics
  const stats = getTranslationStats()
  console.log('📊 Translation Statistics:')
  console.log(`  Total pages: ${stats.totalPages}`)
  console.log(`  Total locales: ${stats.totalLocales}`)
  console.log(`  Expected translation files: ${stats.expectedTranslationFiles}`)
  console.log(`\n  Pages by type:`)
  Object.entries(stats.pagesByType).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count}`)
  })
  console.log('')

  // Validate all pages
  const errorCount = await validateAllPageTranslations()

  // Exit with error code if there are errors
  if (errorCount > 0) {
    console.error(`\n❌ Validation failed with ${errorCount} errors`)
    process.exit(1)
  } else {
    console.log('\n✅ All translations are valid!')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
