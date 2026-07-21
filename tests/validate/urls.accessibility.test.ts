import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'

// Type definition for user-agents package
type UserAgentConstructor = new (data?: {
  deviceCategory?: string
  platform?: string
  vendor?: string
}) => {
  toString(): string
  data: {
    userAgent: string
    platform: string
    vendor: string
    deviceCategory: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const UserAgent = require('user-agents') as UserAgentConstructor

type UrlInfo = { url: string; source: string; itemId: string; field: string }
type UrlResult =
  | (UrlInfo & { valid: true; skipped?: true; status?: number | 'skipped'; reason?: string })
  | (UrlInfo & { valid: false; status?: number; error: string })

/**
 * Decide whether URL accessibility tests should run (networked).
 * This is intentionally disabled by default for local dev.
 */
function shouldRunUrlTests(): boolean {
  const raw = process.env.RUN_URL_TESTS
  return raw === '1' || raw === 'true' || raw === 'yes'
}

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Extract a string URL field from an object if present.
 */
function extractUrlField(
  item: Record<string, unknown>,
  field: string,
  manifestFile: string,
  itemId: string,
  fieldPath?: string
): UrlInfo | null {
  const value = item[field]
  if (typeof value === 'string' && value.length > 0) {
    return {
      url: value,
      source: `${manifestFile} → ${itemId} → ${fieldPath ?? field}`,
      itemId,
      field: fieldPath ?? field,
    }
  }
  return null
}

/**
 * Extract URLs from a nested object (resourceUrls, communityUrls, platformUrls).
 */
function extractNestedUrls(
  item: Record<string, unknown>,
  nestedField: string,
  manifestFile: string,
  itemId: string
): UrlInfo[] {
  const urls: UrlInfo[] = []
  const nested = item[nestedField]
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [key, value] of Object.entries(nested as Record<string, unknown>)) {
      if (typeof value === 'string' && value.length > 0) {
        urls.push({
          url: value,
          source: `${manifestFile} → ${itemId} → ${nestedField}.${key}`,
          itemId,
          field: `${nestedField}.${key}`,
        })
      }
    }
  }
  return urls
}

/**
 * Extract all URLs from a single manifest object.
 */
function extractUrlsFromManifestItem(
  item: Record<string, unknown>,
  manifestFile: string
): UrlInfo[] {
  const urls: UrlInfo[] = []
  const itemId =
    (typeof item.id === 'string' && item.id) ||
    (typeof item.name === 'string' && item.name) ||
    'unknown'

  const manifestType: string = manifestFile.includes('/')
    ? (manifestFile.split('/')[0] ?? '')
    : manifestFile.replace('.json', '')

  const websiteUrl = extractUrlField(item, 'websiteUrl', manifestFile, itemId)
  if (websiteUrl) urls.push(websiteUrl)

  const docsUrl = extractUrlField(item, 'docsUrl', manifestFile, itemId)
  if (docsUrl) urls.push(docsUrl)

  if (['clis', 'ides', 'extensions', 'models'].includes(manifestType)) {
    const githubUrl = extractUrlField(item, 'githubUrl', manifestFile, itemId)
    if (githubUrl) urls.push(githubUrl)

    urls.push(...extractNestedUrls(item, 'resourceUrls', manifestFile, itemId))
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  if (manifestType === 'extensions') {
    const supportedIdes = item.supportedIdes
    if (Array.isArray(supportedIdes)) {
      supportedIdes.forEach((ideSupport, index) => {
        if (ideSupport && typeof ideSupport === 'object') {
          const marketplaceUrl = (ideSupport as Record<string, unknown>).marketplaceUrl
          if (typeof marketplaceUrl === 'string' && marketplaceUrl.length > 0) {
            urls.push({
              url: marketplaceUrl,
              source: `${manifestFile} → ${itemId} → supportedIdes[${index}].marketplaceUrl`,
              itemId,
              field: `supportedIdes[${index}].marketplaceUrl`,
            })
          }
        }
      })
    }
  }

  if (manifestType === 'providers') {
    const applyKeyUrl = extractUrlField(item, 'applyKeyUrl', manifestFile, itemId)
    if (applyKeyUrl) urls.push(applyKeyUrl)
    urls.push(...extractNestedUrls(item, 'platformUrls', manifestFile, itemId))
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  if (manifestType === 'models') {
    urls.push(...extractNestedUrls(item, 'platformUrls', manifestFile, itemId))
  }

  if (manifestType === 'vendors') {
    urls.push(...extractNestedUrls(item, 'communityUrls', manifestFile, itemId))
  }

  return urls
}

/**
 * Load all URL references across manifests.
 */
function loadAllUrls(rootDir: string): UrlInfo[] {
  const all: UrlInfo[] = []
  const manifestsDir = path.join(rootDir, 'manifests')

  const manifestDirs = ['clis', 'ides', 'extensions', 'providers', 'models', 'vendors'] as const
  for (const dir of manifestDirs) {
    const dirPath = path.join(manifestsDir, dir)
    if (!fs.existsSync(dirPath)) continue
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const manifestFile = `${dir}/${file}`
      const data = readJsonFile(filePath)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        all.push(...extractUrlsFromManifestItem(data as Record<string, unknown>, manifestFile))
      }
    }
  }

  const collectionsPath = path.join(manifestsDir, 'collections.json')
  if (fs.existsSync(collectionsPath)) {
    const data = readJsonFile(collectionsPath)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [sectionName, section] of Object.entries(data as Record<string, unknown>)) {
        const sections = (section as Record<string, unknown>)?.sections
        if (!Array.isArray(sections)) continue
        sections.forEach((subSection: unknown) => {
          const subSectionObj = subSection as Record<string, unknown>
          const items = subSectionObj?.items
          if (!Array.isArray(items)) return
          items.forEach((item: unknown) => {
            const itemObj = item as Record<string, unknown>
            if (typeof itemObj?.url === 'string' && itemObj.url.length > 0) {
              const itemId = typeof itemObj?.name === 'string' ? itemObj.name : 'unknown'
              all.push({
                url: itemObj.url,
                source: `collections.json → ${sectionName} → ${String(subSectionObj?.title ?? 'subsection')} → ${itemId} → url`,
                itemId,
                field: 'url',
              })
            }
          })
        })
      }
    }
  }

  // Deduplicate by URL (keep first source for reporting).
  return Array.from(new Map(all.map(u => [u.url, u])).values())
}

const SKIP_DOMAIN_PREFIXES = [
  'https://huggingface.co',
  'https://discord.com/invite/',
  'https://discord.gg/',
  'https://x.com/',
  'https://www.linkedin.com/',
  'https://www.npmjs.com/package/',
  'https://www.reddit.com/r/',
  'https://www.youtube.com/',
]

/**
 * Check if a URL should be skipped (known flaky / blocked domains).
 */
function shouldSkipUrl(url: string): boolean {
  return SKIP_DOMAIN_PREFIXES.some(prefix => url.startsWith(prefix))
}

/**
 * Validate URL format that should be deterministic (no trailing slash).
 */
function validateUrlFormat(urls: UrlInfo[]): UrlResult[] {
  const results: UrlResult[] = []
  for (const urlInfo of urls) {
    if (urlInfo.url.endsWith('/')) {
      results.push({ ...urlInfo, valid: false, error: 'URL ends with trailing slash (/)' })
    }
  }
  return results
}

/**
 * Generate a random user-agent string to avoid being blocked by websites.
 */
function getRandomUserAgent(): string {
  const userAgent = new UserAgent()
  return userAgent.toString()
}

/**
 * Fetch a URL with timeout and retries.
 */
async function checkUrl(urlInfo: UrlInfo, retries: number): Promise<UrlResult> {
  if (shouldSkipUrl(urlInfo.url)) {
    return {
      ...urlInfo,
      valid: true,
      skipped: true,
      status: 'skipped',
      reason: 'Known automation-blocking domain',
    }
  }

  const REQUEST_TIMEOUT = 10_000

  async function fetchWithTimeout(method: 'HEAD' | 'GET', userAgent: string) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      return await fetch(urlInfo.url, {
        method,
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': userAgent,
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Generate a random user-agent for each request to avoid being blocked.
      const userAgent = getRandomUserAgent()

      // Prefer HEAD; fallback to GET when HEAD fails or returns error status.
      let method: 'HEAD' | 'GET' = 'HEAD'
      let response: Response
      try {
        response = await fetchWithTimeout(method, userAgent)
      } catch {
        method = 'GET'
        response = await fetchWithTimeout(method, userAgent)
      }

      if (!response.ok && method === 'HEAD') {
        await response.body?.cancel()
        method = 'GET'
        response = await fetchWithTimeout(method, userAgent)
      }

      const status = response.status
      await response.body?.cancel()

      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return { ...urlInfo, valid: true, status }
      }

      if (status === 404 || status === 410) {
        return {
          ...urlInfo,
          valid: false,
          status,
          error: `HTTP ${status}`,
        }
      }

      // Retry on transient errors (e.g., 403/429/5xx) with exponential backoff.
      if (attempt < retries) {
        const delay = 2 ** attempt * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return { ...urlInfo, valid: true, skipped: true, status, reason: `HTTP ${status}` }
    } catch (error) {
      if (attempt < retries) {
        const delay = 2 ** attempt * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      const reason =
        (error as Error).name === 'AbortError' ? 'Request timeout' : (error as Error).message
      return { ...urlInfo, valid: true, skipped: true, status: 'skipped', reason }
    }
  }

  return { ...urlInfo, valid: false, error: 'Unknown error' }
}

/**
 * Validate URL accessibility with a fixed concurrency limit.
 */
async function validateUrls(urls: UrlInfo[], maxConcurrency: number): Promise<UrlResult[]> {
  const results: UrlResult[] = []
  const queue = [...urls]

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift()
      if (!next) return
      // Align with existing script behavior: 3 retries.
      const result = await checkUrl(next, 3)
      results.push(result)
    }
  }

  const workers = Array.from({ length: Math.max(1, maxConcurrency) }, () => worker())
  await Promise.all(workers)
  return results
}

describe('validate: urls accessibility', () => {
  const run = shouldRunUrlTests()
  const testIt = run ? it : it.skip
  const URL_VALIDATION_TEST_TIMEOUT = 10 * 60 * 1000

  testIt(
    'all URLs are accessible (CI-only; non-blocking in workflow)',
    async () => {
      const urls = loadAllUrls(process.cwd())
      if (urls.length === 0) return

      const formatFailures = validateUrlFormat(urls)
      if (formatFailures.length > 0) {
        const details = formatFailures
          .map(
            r => `- ${r.url}\n  source: ${r.source}\n  error: ${'error' in r ? r.error : 'Unknown'}`
          )
          .join('\n')
        throw new Error(`URL format validation failed:\n\n${details}`)
      }

      const results = await validateUrls(urls, 10)
      const skipped = results.filter(
        (result): result is Extract<UrlResult, { valid: true }> =>
          result.valid && result.skipped === true
      )
      if (skipped.length > 0) {
        const details = skipped
          .map(r => `- ${r.url}\n  source: ${r.source}\n  reason: ${r.reason ?? 'Unknown'}`)
          .join('\n')
        console.warn(`URL accessibility checks skipped:\n\n${details}`)
      }

      const invalid = results.filter(r => !r.valid)
      if (invalid.length > 0) {
        const details = invalid
          .map(
            r => `- ${r.url}\n  source: ${r.source}\n  error: ${'error' in r ? r.error : 'Unknown'}`
          )
          .join('\n')
        throw new Error(`URL accessibility validation failed:\n\n${details}`)
      }
    },
    URL_VALIDATION_TEST_TIMEOUT
  )
})
