#!/usr/bin/env node
/**
 * Script 2: Visit URLs
 * - Only English locale
 * - All static pages
 * - All slug pages (all slugs for each route type)
 */

import { BASE_URL } from './lib/config.mjs'
import { buildUrls } from './lib/url-builder.mjs'
import { printSummary, visitAllUrls } from './lib/visitor.mjs'

async function main() {
  console.log(`Building URL list...`)
  console.log(`Configuration: English only, all static pages, all slugs per route type`)
  const urls = buildUrls({ allLocales: false, allSlugs: true })
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
