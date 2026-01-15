#!/usr/bin/env node
/**
 * Script 3: Visit URLs
 * - All locales
 * - All static pages
 * - All slug pages (only one slug per route type)
 */

import { BASE_URL } from './lib/config.mjs'
import { buildUrls } from './lib/url-builder.mjs'
import { printSummary, visitAllUrls } from './lib/visitor.mjs'

async function main() {
  console.log(`Building URL list...`)
  console.log(`Configuration: All locales, all static pages, one slug per route type`)
  const urls = buildUrls({ allLocales: true, allSlugs: false })
  console.log(`Found ${urls.length} URLs to visit`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`\nStarting to visit URLs...\n`)

  const startTime = Date.now()
  const results = await visitAllUrls(urls)
  const success = printSummary(results, startTime)

  process.exit(success ? 0 : 1)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
