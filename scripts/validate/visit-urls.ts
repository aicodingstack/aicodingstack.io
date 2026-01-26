#!/usr/bin/env tsx
/**
 * Unified URL validation script
 *
 * Usage:
 *   visit-urls.ts [options]
 *
 * Options:
 *   --locales <value>    Locale strategy: "en" (default) or "all"
 *   --slugs <value>      Slug strategy: "one" (default) or "all"
 *   --concurrency <n>    Max concurrent requests (default: 1)
 *
 * Examples:
 *   visit-urls.ts                           # English only, one slug per route
 *   visit-urls.ts --locales all             # All locales, one slug per route
 *   visit-urls.ts --slugs all               # English only, all slugs
 *   visit-urls.ts --locales all --slugs all # All locales, all slugs
 *   visit-urls.ts --concurrency 5           # With 5 concurrent requests
 */

import { BASE_URL } from './lib/config'
import { buildUrls } from './lib/url-builder'
import { printSummary, visitAllUrlsConcurrent } from './lib/visitor'

/**
 * CLI options interface
 */
interface CliOptions {
  locales: 'en' | 'all'
  slugs: 'one' | 'all'
  concurrency: number
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    locales: 'en',
    slugs: 'one',
    concurrency: 1,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) continue
    const nextArg = args[i + 1]

    switch (arg) {
      case '--locales':
        options.locales = nextArg === 'all' ? 'all' : 'en'
        i++
        break
      case '--slugs':
        options.slugs = nextArg === 'all' ? 'all' : 'one'
        i++
        break
      case '--concurrency':
        options.concurrency = Math.max(1, Number.parseInt(nextArg || '1', 10))
        i++
        break
      case '--help':
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: process.exit terminates
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`)
          console.error('Run --help for usage information')
          process.exit(1)
        }
        // If not a flag, silently ignore and continue
        break
    }
  }

  return options
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
URL Validation Script

Usage:
  visit-urls.ts [options]

Options:
  --locales <value>    Locale strategy: "en" (default) or "all"
  --slugs <value>      Slug strategy: "one" (default) or "all"
  --concurrency <n>    Max concurrent requests (default: 1)
  --help, -h           Show this help message

Examples:
  visit-urls.ts                           # English only, one slug per route
  visit-urls.ts --locales all             # All locales, one slug per route
  visit-urls.ts --slugs all               # English only, all slugs
  visit-urls.ts --locales all --slugs all # All locales, all slugs
  visit-urls.ts --concurrency 5           # With 5 concurrent requests

Environment Variables:
  BASE_URL          Base URL to test (default: http://localhost:3000)
  REQUEST_DELAY     Delay between requests in ms (default: 100)
`)
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  console.log(`Building URL list...`)
  console.log(
    `Configuration: ${options.locales === 'all' ? 'All locales' : 'English only'}, ${options.slugs === 'all' ? 'all slugs' : 'one slug per route type'}`
  )
  const urls = buildUrls({
    allLocales: options.locales === 'all',
    allSlugs: options.slugs === 'all',
  })
  console.log(`Found ${urls.length} URLs to visit`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Concurrency: ${options.concurrency}`)
  console.log(`\nStarting to visit URLs...\n`)

  const startTime = Date.now()
  const results = await visitAllUrlsConcurrent(urls, options.concurrency)
  const success = printSummary(results, startTime)

  process.exit(success ? 0 : 1)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
