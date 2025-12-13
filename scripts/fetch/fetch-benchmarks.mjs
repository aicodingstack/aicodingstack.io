#!/usr/bin/env node

import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to models directory
const MODELS_DIR = path.join(__dirname, '..', '..', 'manifests', 'models')

// Model name mappings - maps manifest ID to possible benchmark names
const MODEL_NAME_MAPPINGS = {
  // Anthropic Claude models
  'claude-sonnet-4-5': [
    'Claude Sonnet 4.5',
    'Claude 4.5 Sonnet',
    'claude-sonnet-4.5',
    'Claude Sonnet 4.5 (Oct 2024)',
    'Claude 3.7 Sonnet',
  ],
  'claude-opus-4-1': ['Claude Opus 4.1', 'Claude 4.1 Opus', 'claude-opus-4.1', 'Claude Opus 4'],
  'claude-opus-4': ['Claude Opus 4', 'Claude 4 Opus', 'claude-opus-4.0', 'Claude Opus 4.0'],
  'claude-sonnet-4': [
    'Claude Sonnet 4',
    'Claude 4 Sonnet',
    'claude-sonnet-4.0',
    'Claude Sonnet 4.0',
  ],
  'claude-haiku-4-5': [
    'Claude Haiku 4.5',
    'Claude 4.5 Haiku',
    'claude-haiku-4.5',
    'Claude 3.7 Haiku',
  ],

  // OpenAI GPT models
  'gpt-4o': ['GPT-4o', 'gpt-4o', 'GPT4o', 'gpt-4o-2024-11-20'],
  'gpt-4-1': ['GPT-4.1', 'gpt-4.1', 'GPT-4 Turbo', 'gpt-4-turbo'],
  'gpt-5': ['GPT-5', 'gpt-5', 'gpt-5-preview'],
  'gpt-5-1': ['GPT-5.1', 'gpt-5.1'],
  'gpt-5-codex': ['GPT-5 Codex', 'gpt-5-codex'],
  'gpt-5-1-codex': ['GPT-5.1 Codex', 'gpt-5.1-codex'],

  // Google Gemini models
  'gemini-2-5-pro': [
    'Gemini 2.5 Pro',
    'Gemini Pro 2.5',
    'gemini-2.5-pro',
    'gemini-2.5-pro-preview',
    'Gemini 2.5 Pro (Dec 2024)',
  ],
  'gemini-2-5-flash': [
    'Gemini 2.5 Flash',
    'Gemini Flash 2.5',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview',
  ],
  'gemini-3-pro': ['Gemini 3 Pro', 'Gemini Pro 3', 'gemini-3-pro', 'gemini-3.0-pro'],

  // DeepSeek models
  'deepseek-r1': [
    'DeepSeek R1',
    'DeepSeek-R1',
    'deepseek-r1',
    'DeepSeek-R1-Preview',
    'deepseek-reasoner',
  ],
  'deepseek-v3-terminus': [
    'DeepSeek V3.1 Terminus',
    'DeepSeek V3 Terminus',
    'deepseek-v3.1-terminus',
    'DeepSeek-V3.1',
    'deepseek-v3-terminus',
  ],

  // Alibaba Qwen models
  'qwen3-coder-30b-a3b': [
    'Qwen3 Coder 30B-A3B',
    'Qwen3-Coder-30B-A3B',
    'qwen3-coder-30b-a3b',
    'Qwen3 Coder 32B',
    'QwQ 32B',
  ],
  'qwen3-coder-480b-a35b': [
    'Qwen3 Coder 480B-A35B',
    'Qwen3-Coder-480B-A35B',
    'qwen3-coder-480b-a35b',
    'Qwen3 Coder 480B',
  ],
  'qwen3-coder-plus': [
    'Qwen3 Coder Plus',
    'qwen3-coder-plus',
    'Qwen3 Coder 480B Plus',
    'Qwen3-Coder-Plus',
  ],

  // Z.ai GLM models
  'glm-4-6': ['GLM-4-6', 'GLM4-6', 'glm-4-6', 'GLM-4.6', 'GLM 4.6'],
  'glm-4-6v': ['GLM-4.6V', 'GLM4-6V', 'glm-4.6v', 'GLM-4.6 V', 'GLM 4.6V'],

  // Meta Llama models
  'llama-4-maverick': [
    'Llama 4 Maverick',
    'Llama-4-Maverick',
    'llama-4-maverick',
    'Llama4 Maverick',
  ],

  // Moonshot Kimi models
  'kimi-k2-0905': ['Kimi K2', 'Kimi-K2', 'kimi-k2-0905', 'kimi-k2', 'Moonshot Kimi K2'],

  // xAI Grok models
  'grok-code-fast-1': [
    'Grok Code Fast 1',
    'grok-code-fast-1',
    'Grok-Code-Fast-1',
    'Grok Code Fast',
  ],

  // MiniMax models
  'minimax-m2': ['MiniMax M2', 'minimax-m2', 'MiniMax-M2'],

  // Cursor Composer
  composer: ['Composer', 'Cursor Composer', 'cursor-composer', 'Cursor Sonnet'],
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Normalize model name for matching (lowercase, remove special chars)
 */
function normalizeModelName(name) {
  return name.toLowerCase().replace(/[-._ ]/g, '')
}

/**
 * Fuzzy match a model ID to benchmark names using hardcoded mappings + fuzzy fallback
 */
function matchModelName(modelId, benchmarkNames) {
  // First try hardcoded mappings
  const mappings = MODEL_NAME_MAPPINGS[modelId] || []
  for (const mapping of mappings) {
    if (benchmarkNames.includes(mapping)) {
      return mapping
    }
  }

  // Fallback: Fuzzy matching
  const normalized = normalizeModelName(modelId)
  for (const name of benchmarkNames) {
    const normalizedName = normalizeModelName(name)
    if (normalizedName.includes(normalized) || normalized.includes(normalizedName)) {
      return name
    }
  }

  return null
}

/**
 * Safely fetch benchmark data with retry logic
 */
async function fetchBenchmarkSafely(fetchFn, benchmarkName, page) {
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn(page)
    } catch (error) {
      console.error(`  ⚠️  ${benchmarkName} attempt ${attempt}/${maxRetries} failed:`, error.message)
      if (attempt === maxRetries) {
        console.error(`  ❌ ${benchmarkName} failed after ${maxRetries} attempts`)
        return null
      }
      await sleep(1000 * 2 ** attempt) // Exponential backoff
    }
  }
}

// =============================================================================
// Benchmark Fetchers
// =============================================================================

/**
 * Fetch SWE-bench scores
 * URL: https://www.swebench.com
 * Strategy: Extract model names and scores from text nodes
 */
async function fetchSweBench(page) {
  console.log('  🔍 Fetching SWE-bench data...')
  await page.goto('https://www.swebench.com', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  const data = await page.evaluate(() => {
    const results = {}
    try {
      // Extract all text nodes
      const allText = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

      let node = walker.nextNode()
      while (node) {
        const text = node.textContent.trim()
        if (text) {
          allText.push(text)
        }
        node = walker.nextNode()
      }

      // Find pattern: model name followed by score (xx.xx format)
      for (let i = 0; i < allText.length - 1; i++) {
        const current = allText[i]
        const next = allText[i + 1]

        // Check if next is a score (xx.xx format)
        const scoreMatch = next.match(/^(\d+\.\d+)$/)
        if (scoreMatch) {
          const score = parseFloat(scoreMatch[1])
          // Check if current looks like a model name
          if (current.length > 5 && /[a-zA-Z]/.test(current) && !current.includes('$')) {
            results[current] = score
          }
        }
      }
    } catch (error) {
      console.error('Error extracting SWE-bench data:', error.message)
    }
    return results
  })

  console.log(`  ✅ SWE-bench: Extracted ${Object.keys(data).length} models`)
  return data
}

/**
 * Fetch TerminalBench scores
 * URL: https://www.tbench.ai/leaderboard/terminal-bench/2.0
 * Strategy: Extract model names and accuracy scores from text nodes
 * Returns scores as decimals (0-1 range)
 */
async function fetchTerminalBench(page) {
  console.log('  🔍 Fetching TerminalBench data...')
  await page.goto('https://www.tbench.ai/leaderboard/terminal-bench/2.0', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  const data = await page.evaluate(() => {
    const results = {}
    try {
      // Extract all text nodes
      const allText = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

      let node = walker.nextNode()
      while (node) {
        const text = node.textContent.trim()
        if (text) {
          allText.push(text)
        }
        node = walker.nextNode()
      }

      // Find pattern: date -> model name -> score% (with % symbol after)
      // Score format: xx.x followed by '%'
      for (let i = 0; i < allText.length; i++) {
        const text = allText[i]

        // Find accuracy score (xx.x format followed by %)
        const scoreMatch = text.match(/^(\d+\.\d+)$/)
        if (scoreMatch && allText[i + 1] === '%') {
          const score = parseFloat(scoreMatch[1]) / 100 // Convert to 0-1 range

          // Look backward for model name (before date)
          let modelName = null
          let foundDate = false

          for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
            const candidate = allText[j]

            // Find date (yyyy-mm-dd format)
            if (candidate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              foundDate = true
              // Model name should be before the date
              if (j > 0) {
                modelName = allText[j - 1]
                break
              }
            }
          }

          if (modelName && foundDate && modelName.length > 3) {
            // Keep highest score for each model
            if (!results[modelName] || results[modelName] < score) {
              results[modelName] = score
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing TerminalBench table:', error.message)
    }
    return results
  })

  console.log(`  ✅ TerminalBench: Extracted ${Object.keys(data).length} models`)
  return data
}

/**
 * Fetch MMMU scores
 * URL: https://mmmu-benchmark.github.io/#leaderboard
 * NOTE: This page has dynamic loading issues and may not load completely
 * Returns null if data cannot be extracted
 */
async function fetchMMMU(page) {
  console.log('  🔍 Fetching MMMU data...')
  try {
    await page.goto('https://mmmu-benchmark.github.io/#leaderboard', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const data = await page.evaluate(() => {
      const results = {}
      try {
        // Extract all text nodes
        const allText = []
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

        let node = walker.nextNode()
        while (node) {
          const text = node.textContent.trim()
          if (text) {
            allText.push(text)
          }
          node = walker.nextNode()
        }

        // Look for leaderboard table data
        // The page uses tabs for MMMU-Pro, MMMU(Val), MMMU(Test)
        // Try to extract from any available data
        // Pattern: Name -> Size -> Date -> Overall score
        for (let i = 0; i < allText.length; i++) {
          const text = allText[i]
          // Model names are typically longer and contain letters
          if (
            text.length > 3 &&
            /[a-zA-Z]/.test(text) &&
            !text.match(/^\d+\.?\d*$/) &&
            !['Name', 'Size', 'Date', 'Overall'].includes(text)
          ) {
            // Check for score in nearby text
            for (let j = i + 1; j < Math.min(i + 5, allText.length); j++) {
              const candidate = allText[j]
              const score = parseFloat(candidate)
              if (!Number.isNaN(score) && score >= 0 && score <= 100) {
                results[text] = score
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing MMMU table:', error.message)
      }
      return results
    })

    console.log(`  ✅ MMMU: Extracted ${Object.keys(data).length} models`)
    return Object.keys(data).length > 0 ? data : null
  } catch (error) {
    console.error(`  ⚠️  MMMU fetch failed: ${error.message}`)
    return null
  }
}

/**
 * Fetch MMMU Pro scores
 * URL: https://mmmu-benchmark.github.io/#leaderboard (same page, different section)
 * NOTE: This page has dynamic loading issues and may not load completely
 * Returns null if data cannot be extracted
 */
async function fetchMMMUPro(_page) {
  console.log('  🔍 Fetching MMMU Pro data...')
  // MMMU Pro is on the same page as MMMU, just a different tab
  // The extraction logic would be similar to MMMU
  // Since the page has loading issues, we return null for now
  console.log('  ⚠️  MMMU Pro: Skipping due to page loading issues')
  return null
}

/**
 * Fetch WebDevArena scores
 * URL: https://web.lmarena.ai/leaderboard
 * NOTE: This page is protected by Vercel Security Checkpoint and cannot be accessed by automated tools
 * Returns null until a workaround is implemented
 */
async function fetchWebDevArena(_page) {
  console.log('  🔍 Fetching WebDevArena data...')
  console.log('  ⚠️  WebDevArena: Skipping due to Vercel Security Checkpoint')
  // The page requires passing Vercel's bot detection
  // This would require additional setup like using real browser profiles or proxies
  // For now, we return null
  return null
}

/**
 * Fetch SciCode scores
 * URL: https://scicode-bench.github.io/leaderboard/
 * Strategy: Extract model names and Main Problem Resolve Rate scores
 */
async function fetchSciCode(page) {
  console.log('  🔍 Fetching SciCode data...')
  await page.goto('https://scicode-bench.github.io/leaderboard/', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  const data = await page.evaluate(() => {
    const results = {}
    try {
      // Extract all text nodes
      const allText = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

      let node = walker.nextNode()
      while (node) {
        const text = node.textContent.trim()
        if (text) {
          allText.push(text)
        }
        node = walker.nextNode()
      }

      // Find "Main Problem Resolve Rate" header
      let startIndex = -1
      for (let i = 0; i < allText.length; i++) {
        if (allText[i] === 'Main Problem Resolve Rate') {
          startIndex = i + 2 // Skip "Subproblem" column header
          break
        }
      }

      if (startIndex === -1) return results

      // Extract model names and scores
      for (let i = startIndex; i < allText.length; i++) {
        const text = allText[i]

        // Stop at table end
        if (text.includes('Note: If the models tie')) break

        // Check if this is a model name (contains letters, not pure number)
        if (/[a-zA-Z]/.test(text) && !text.match(/^\d+\.?\d*$/)) {
          // Remove medal emojis if present
          const modelName = text.replace(/[🥇🥈🥉]\s*/gu, '')

          // Next should be Main Problem score
          if (i + 1 < allText.length) {
            const scoreText = allText[i + 1]
            const score = parseFloat(scoreText)
            if (!Number.isNaN(score) && score >= 0 && score <= 100) {
              results[modelName] = score
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing SciCode table:', error.message)
    }
    return results
  })

  console.log(`  ✅ SciCode: Extracted ${Object.keys(data).length} models`)
  return data
}

/**
 * Fetch LiveCodeBench scores
 * URL: https://livecodebench.github.io/leaderboard.html
 * Strategy: Extract model names and Pass@1 scores from text nodes
 */
async function fetchLiveCodeBench(page) {
  console.log('  🔍 Fetching LiveCodeBench data...')
  await page.goto('https://livecodebench.github.io/leaderboard.html', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  // Give time for dynamic content to load
  await sleep(2000)

  const data = await page.evaluate(() => {
    const results = {}
    try {
      // Extract all text nodes
      const allText = []
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

      let node = walker.nextNode()
      while (node) {
        const text = node.textContent.trim()
        if (text) {
          allText.push(text)
        }
        node = walker.nextNode()
      }

      // Find pattern: rank (1-100) -> model name -> Pass@1 score
      // Start after seeing '1' and a model name
      let inData = false
      for (let i = 0; i < allText.length; i++) {
        const text = allText[i]

        // Detect start of data area (rank 1)
        if (text === '1' && i + 1 < allText.length && /[a-zA-Z]/.test(allText[i + 1])) {
          inData = true
        }

        if (!inData) continue

        // In data area, find model names followed by scores
        // Model names contain letters and are longer than 3 chars
        if (
          /[a-zA-Z]/.test(text) &&
          !text.match(/^\d+\.?\d*$/) && // Not a pure number
          text.length > 3 &&
          !['RANK', 'MODEL', 'PASS@1', 'EASY', 'MEDIUM', 'HARD'].includes(text)
        ) {
          // Check next element for score
          if (i + 1 < allText.length) {
            const nextText = allText[i + 1]
            const score = parseFloat(nextText)
            if (
              !Number.isNaN(score) &&
              score >= 0 &&
              score <= 100 &&
              nextText.match(/^\d+\.?\d*$/)
            ) {
              results[text] = score
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing LiveCodeBench table:', error.message)
    }
    return results
  })

  console.log(`  ✅ LiveCodeBench: Extracted ${Object.keys(data).length} models`)
  return data
}

// =============================================================================
// Main Logic
// =============================================================================

/**
 * Load all model manifests from the models directory
 */
function loadModelManifests() {
  const models = {}

  if (!fs.existsSync(MODELS_DIR)) {
    throw new Error(`Models directory not found: ${MODELS_DIR}`)
  }

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(MODELS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const manifest = JSON.parse(content)
    const modelId = file.replace(/\.json$/, '')
    models[modelId] = manifest
  }

  return models
}

/**
 * Fetch all benchmarks in parallel
 */
async function fetchAllBenchmarks(browser) {
  console.log('\n📊 Fetching benchmark data from all sources...\n')

  // Create separate pages for parallel fetching
  const pages = await Promise.all([
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
  ])

  // Fetch all benchmarks in parallel with retry logic
  const [sweBench, terminalBench, mmmu, mmmuPro, webDevArena, sciCode, liveCodeBench] =
    await Promise.all([
      fetchBenchmarkSafely(fetchSweBench, 'SWE-bench', pages[0]),
      fetchBenchmarkSafely(fetchTerminalBench, 'TerminalBench', pages[1]),
      fetchBenchmarkSafely(fetchMMMU, 'MMMU', pages[2]),
      fetchBenchmarkSafely(fetchMMMUPro, 'MMMU Pro', pages[3]),
      fetchBenchmarkSafely(fetchWebDevArena, 'WebDevArena', pages[4]),
      fetchBenchmarkSafely(fetchSciCode, 'SciCode', pages[5]),
      fetchBenchmarkSafely(fetchLiveCodeBench, 'LiveCodeBench', pages[6]),
    ])

  // Close all pages
  await Promise.all(pages.map(p => p.close()))

  return {
    sweBench,
    terminalBench,
    mmmu,
    mmmuPro,
    webDevArena,
    sciCode,
    liveCodeBench,
  }
}

/**
 * Match models with benchmark data and update manifests
 */
function matchModelsWithBenchmarks(models, benchmarkData) {
  console.log('\n🔗 Matching models with benchmark data...\n')

  let totalMatches = 0
  let totalMismatches = 0

  for (const [modelId, manifest] of Object.entries(models)) {
    const benchmarks = {}
    let matched = false

    // For each benchmark type
    for (const [benchmarkKey, benchmarkScores] of Object.entries(benchmarkData)) {
      if (!benchmarkScores) {
        console.log(`  ⚠️  ${benchmarkKey}: No data (fetch failed)`)
        continue
      }

      const benchmarkNames = Object.keys(benchmarkScores)
      const matchedName = matchModelName(modelId, benchmarkNames)

      if (matchedName) {
        benchmarks[benchmarkKey] = benchmarkScores[matchedName]
        matched = true
        console.log(`  ✅ ${modelId} → ${matchedName}: ${benchmarkScores[matchedName]}`)
      } else {
        benchmarks[benchmarkKey] = null
      }
    }

    // Update manifest with benchmarks (preserve existing + add new)
    manifest.benchmarks = {
      ...(manifest.benchmarks || {}),
      ...benchmarks,
    }

    if (matched) {
      totalMatches++
    } else {
      totalMismatches++
      console.log(`  ⚠️  ${modelId}: No matches found in any benchmark`)
    }
  }

  console.log(`\n📊 Matching complete: ${totalMatches} matched, ${totalMismatches} not found`)
}

/**
 * Write updated manifests back to disk
 */
function updateManifestFiles(models) {
  console.log('\n💾 Writing updated manifests to disk...\n')

  let updated = 0

  for (const [modelId, manifest] of Object.entries(models)) {
    const filePath = path.join(MODELS_DIR, `${modelId}.json`)

    // Only write if we have benchmark data
    if (manifest.benchmarks && Object.keys(manifest.benchmarks).length > 0) {
      fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
      updated++
      console.log(`  ✅ Updated ${modelId}.json`)
    }
  }

  console.log(`\n✨ ${updated} manifest files updated`)
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting benchmark data fetcher...\n')

  // Load all model manifests
  const models = loadModelManifests()
  console.log(`📦 Loaded ${Object.keys(models).length} model manifests\n`)

  // Initialize browser
  console.log('🌐 Launching browser...\n')
  const browser = await chromium.launch({
    headless: true,
    timeout: 60000,
  })

  try {
    // Fetch all benchmarks
    const benchmarkData = await fetchAllBenchmarks(browser)

    // Match and update
    matchModelsWithBenchmarks(models, benchmarkData)
    updateManifestFiles(models)

    console.log('\n✅ Benchmark data update completed!')
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await browser.close()
    console.log('\n🌐 Browser closed')
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
