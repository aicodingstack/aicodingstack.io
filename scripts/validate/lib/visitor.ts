/**
 * URL visiting utilities
 */

import { REQUEST_DELAY } from './config'
import type { UrlInfo } from './url-builder'

/**
 * Visit result interface
 */
export interface VisitResult extends UrlInfo {
  status: number | null
  success: boolean
  error: string | null
}

/**
 * Visit a URL with timeout and retries
 */
export async function visitUrl(urlInfo: UrlInfo, retries = 2): Promise<VisitResult> {
  const REQUEST_TIMEOUT = 10000

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(urlInfo.url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          Accept: 'text/html',
        },
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

      const err = error as Error
      return {
        ...urlInfo,
        status: null,
        success: false,
        error: err.name === 'AbortError' ? 'Request timeout' : err.message,
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
export async function visitAllUrlsConcurrent(
  urls: UrlInfo[],
  maxConcurrency = 1
): Promise<VisitResult[]> {
  const results: VisitResult[] = []
  const queue = [...urls]
  let processed = 0
  const total = urls.length

  async function worker(): Promise<void> {
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

      // Add delay between requests to avoid overwhelming the server
      if (queue.length > 0 && REQUEST_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, maxConcurrency) }, () => worker())
  await Promise.all(workers)

  return results
}

/**
 * Visit all URLs sequentially (one by one)
 * Alias for visitAllUrlsConcurrent with concurrency=1
 */
export async function visitAllUrls(urls: UrlInfo[]): Promise<VisitResult[]> {
  return visitAllUrlsConcurrent(urls, 1)
}

/**
 * Print summary of visit results
 */
export function printSummary(results: VisitResult[], startTime: number): boolean {
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
    return false
  }

  console.log(`\nAll URLs visited successfully!`)
  return true
}
