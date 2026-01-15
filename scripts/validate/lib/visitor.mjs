/**
 * URL visiting utilities
 */

import { REQUEST_DELAY } from './config.mjs'

/**
 * Visit a URL with timeout and retries
 */
export async function visitUrl(urlInfo, retries = 2) {
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
 * Visit all URLs sequentially (one by one)
 */
export async function visitAllUrls(urls) {
  const results = []
  const total = urls.length

  for (let i = 0; i < urls.length; i++) {
    const urlInfo = urls[i]
    const result = await visitUrl(urlInfo)
    results.push(result)

    const processed = i + 1

    if (result.success) {
      console.log(`✓ [${processed}/${total}] ${result.url} (${result.status})`)
    } else {
      console.error(`✗ [${processed}/${total}] ${result.url} - ${result.error || result.status}`)
    }

    // Add delay between requests to avoid overwhelming the server
    if (i < urls.length - 1 && REQUEST_DELAY > 0) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
    }
  }

  return results
}

/**
 * Print summary of visit results
 */
export function printSummary(results, startTime) {
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
