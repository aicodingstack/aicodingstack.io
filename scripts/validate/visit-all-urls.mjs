#!/usr/bin/env node
/**
 * Script to visit all URLs on the website
 * For dynamic routes with [slug], only visits once per unique slug
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

// Locales configuration
const LOCALES = ['en', 'de', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh-Hans', 'zh-Hant']

// Base URL - can be overridden via BASE_URL environment variable
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

/**
 * Get locale prefix for URL
 */
function getLocalePrefix(locale) {
  return locale === 'en' ? '' : `/${locale}`
}

/**
 * Read JSON file
 */
function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

/**
 * Get all static routes
 */
function getStaticRoutes() {
  return [
    '/',
    '/ides',
    '/clis',
    '/extensions',
    '/models',
    '/model-providers',
    '/vendors',
    '/articles',
    '/ai-coding-stack',
    '/docs',
    '/curated-collections',
    '/manifesto',
    '/ai-coding-landscape',
    '/open-source-rank',
    '/search',
    '/clis/comparison',
    '/extensions/comparison',
    '/ides/comparison',
    '/models/comparison',
  ]
}

/**
 * Get all slugs from manifests directory
 */
function getSlugsFromManifests(category) {
  const manifestsDir = path.join(ROOT_DIR, 'manifests', category)
  if (!fs.existsSync(manifestsDir)) {
    return []
  }

  const files = fs.readdirSync(manifestsDir).filter(f => f.endsWith('.json'))
  const slugs = []

  for (const file of files) {
    const filePath = path.join(manifestsDir, file)
    try {
      const data = readJsonFile(filePath)
      if (data && typeof data === 'object' && data.id) {
        slugs.push(data.id)
      }
    } catch (error) {
      console.warn(`Warning: Failed to read ${filePath}: ${error.message}`)
    }
  }

  return slugs
}

/**
 * Get article slugs from content directory
 */
function getArticleSlugs() {
  try {
    // Read from content directory
    const articlesDir = path.join(ROOT_DIR, 'content/articles/en')
    if (!fs.existsSync(articlesDir)) {
      return []
    }

    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'))
    return files.map(file => file.replace('.mdx', ''))
  } catch (error) {
    console.warn(`Warning: Failed to get article slugs: ${error.message}`)
    return []
  }
}

/**
 * Get doc slugs from content directory
 */
function getDocSlugs() {
  try {
    const docsDir = path.join(ROOT_DIR, 'content/docs/en')
    if (!fs.existsSync(docsDir)) {
      return []
    }

    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.mdx'))
    return files.map(file => file.replace('.mdx', ''))
  } catch (error) {
    console.warn(`Warning: Failed to get doc slugs: ${error.message}`)
    return []
  }
}

/**
 * Build all URLs to visit
 */
function buildAllUrls() {
  const urls = []
  const visitedSlugs = new Set() // Track visited slugs for dynamic routes

  // Static routes - visit for all locales
  const staticRoutes = getStaticRoutes()
  for (const route of staticRoutes) {
    for (const locale of LOCALES) {
      const localePrefix = getLocalePrefix(locale)
      const url = `${BASE_URL}${localePrefix}${route}`
      urls.push({ url, route, locale, type: 'static' })
    }
  }

  // Dynamic routes with [slug]
  const dynamicRoutes = [
    { path: '/ides', category: 'ides' },
    { path: '/clis', category: 'clis' },
    { path: '/extensions', category: 'extensions' },
    { path: '/models', category: 'models' },
    { path: '/model-providers', category: 'providers' },
    { path: '/vendors', category: 'vendors' },
  ]

  for (const { path: routePath, category } of dynamicRoutes) {
    const slugs = getSlugsFromManifests(category)
    for (const slug of slugs) {
      // Only visit once per unique slug (use first locale)
      if (!visitedSlugs.has(`${routePath}/${slug}`)) {
        visitedSlugs.add(`${routePath}/${slug}`)
        const url = `${BASE_URL}${routePath}/${slug}`
        urls.push({ url, route: `${routePath}/${slug}`, locale: 'en', type: 'dynamic', slug })
      }
    }
  }

  // Articles - visit once per slug
  const articleSlugs = getArticleSlugs()
  for (const slug of articleSlugs) {
    if (!visitedSlugs.has(`/articles/${slug}`)) {
      visitedSlugs.add(`/articles/${slug}`)
      const url = `${BASE_URL}/articles/${slug}`
      urls.push({ url, route: `/articles/${slug}`, locale: 'en', type: 'dynamic', slug })
    }
  }

  // Docs - visit once per slug
  const docSlugs = getDocSlugs()
  for (const slug of docSlugs) {
    if (!visitedSlugs.has(`/docs/${slug}`)) {
      visitedSlugs.add(`/docs/${slug}`)
      const url = `${BASE_URL}/docs/${slug}`
      urls.push({ url, route: `/docs/${slug}`, locale: 'en', type: 'dynamic', slug })
    }
  }

  return urls
}

/**
 * Visit a URL with timeout and retries
 */
async function visitUrl(urlInfo, retries = 2) {
  const REQUEST_TIMEOUT = 10000

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(urlInfo.url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      return {
        ...urlInfo,
        status: response.status,
        success: response.ok || (response.status >= 300 && response.status < 400),
        error: null,
      }
    } catch (error) {
      if (attempt < retries) {
        const delay = 2 ** attempt * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return {
        ...urlInfo,
        status: null,
        success: false,
        error: error.name === 'AbortError' ? 'Request timeout' : error.message,
      }
    }
  }

  return {
    ...urlInfo,
    status: null,
    success: false,
    error: 'Unknown error',
  }
}

/**
 * Visit all URLs with concurrency control
 */
async function visitAllUrls(urls, maxConcurrency = 5) {
  const results = []
  const queue = [...urls]
  let processed = 0
  const total = urls.length

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift()
      if (!next) return

      const result = await visitUrl(next)
      results.push(result)
      processed++

      if (result.success) {
        console.log(`✓ [${processed}/${total}] ${result.url} (${result.status})`)
      } else {
        console.error(`✗ [${processed}/${total}] ${result.url} - ${result.error || result.status}`)
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, maxConcurrency) }, () => worker())
  await Promise.all(workers)

  return results
}

/**
 * Main function
 */
async function main() {
  console.log(`Building URL list...`)
  const urls = buildAllUrls()
  console.log(`Found ${urls.length} URLs to visit`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`\nStarting to visit URLs...\n`)

  const startTime = Date.now()
  const results = await visitAllUrls(urls, 5)
  const endTime = Date.now()

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Summary:`)
  console.log(`  Total URLs: ${results.length}`)
  console.log(`  Successful: ${successful.length}`)
  console.log(`  Failed: ${failed.length}`)
  console.log(`  Time: ${((endTime - startTime) / 1000).toFixed(2)}s`)

  if (failed.length > 0) {
    console.log(`\nFailed URLs:`)
    for (const result of failed) {
      console.log(`  - ${result.url} (${result.error || result.status})`)
    }
    process.exit(1)
  }

  console.log(`\nAll URLs visited successfully!`)
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
