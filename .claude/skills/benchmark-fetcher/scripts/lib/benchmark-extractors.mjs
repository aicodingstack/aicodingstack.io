/**
 * Benchmark extractors for each leaderboard website
 * Each extractor navigates to the website, extracts benchmark data, and maps to manifest IDs
 */

import { mapModelName, trackUnmapped } from './model-name-mapper.mjs'

/**
 * Extract SWE-bench Verified scores
 * Website: https://www.swebench.com
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Map<string, number>>} Map of manifest IDs to scores
 */
async function extractSWEBench(mcpTools, mappings) {
  const url = 'https://www.swebench.com'
  console.log(`  🌐 Navigating to ${url}`)

  // Navigate to page
  await mcpTools.navigate_page({ url, type: 'url' })

  // Wait for leaderboard to load
  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Model', timeout: 10000 })

  // Take snapshot to analyze structure
  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  // Parse leaderboard data from snapshot
  console.log('  🔍 Parsing leaderboard data...')
  const benchmarkData = new Map()
  const unmapped = new Set()

  // Parse the snapshot content
  const lines = snapshot.content.split('\n')

  // Look for pattern: model name followed by % Resolved score
  // Pattern: checkbox "Select <ModelName>" ... StaticText "<Score>"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Find checkbox lines with "Select" - these indicate model rows
    if (line.includes('checkbox "Select ') && !line.includes('Select all models')) {
      // Extract model name from checkbox label
      const selectMatch = line.match(/checkbox "Select (.+?)"/)
      if (selectMatch) {
        const modelName = selectMatch[1].trim()

        // Look ahead for the % Resolved score
        // The score appears a few lines after the model name
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const scoreLine = lines[j]

          // Look for StaticText with a number pattern (e.g., "74.40", "21.62")
          const scoreMatch = scoreLine.match(/StaticText "(\d+\.\d+)"/)
          if (scoreMatch && !scoreLine.includes('StaticText "$')) {
            const score = parseFloat(scoreMatch[1])

            // Map model name to manifest ID
            const manifestId = mapModelName('swebench', modelName, mappings)

            if (manifestId) {
              benchmarkData.set(manifestId, score)
              console.log(`    ✓ Mapped: "${modelName}" → ${manifestId} (${score}%)`)
            } else {
              trackUnmapped(unmapped, modelName)
            }

            break // Found score for this model, move to next model
          }
        }
      }
    }
  }

  console.log(`  📊 Extracted ${benchmarkData.size} models, ${unmapped.size} unmapped`)

  return {
    data: benchmarkData,
    unmappedModels: Array.from(unmapped),
  }
}

/**
 * Extract TerminalBench 2.0 accuracy scores
 * Website: https://www.tbench.ai/leaderboard/terminal-bench/2.0
 * CRITICAL: Stores as decimal (0-1 scale), not percentage
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Map<string, number>>} Map of manifest IDs to scores (decimal format)
 */
async function extractTerminalBench(mcpTools, mappings) {
  const url = 'https://www.tbench.ai/leaderboard/terminal-bench/2.0'
  console.log(`  🌐 Navigating to ${url}`)

  await mcpTools.navigate_page({ url, type: 'url' })

  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Accuracy', timeout: 10000 })

  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  console.log('  🔍 Parsing leaderboard data...')
  const benchmarkData = new Map()
  const modelScores = new Map() // Track all scores per model to find max
  const unmapped = new Set()

  // Parse the snapshot content
  const lines = snapshot.content.split('\n')

  // Look for pattern: Rank → Agent → Model → Date → ... → Accuracy
  // After "Model" column, we find the model name, then accuracy appears later
  let currentModel = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip header rows and empty lines
    if (!line || line.includes('StaticText "Rank"') || line.includes('StaticText "Model"')) {
      continue
    }

    // Look for model names (they appear after rank numbers and agent names)
    // Pattern: StaticText "<Number>" (rank) → StaticText "<Agent>" → StaticText "<Model>"
    // Then much later: StaticText "<Accuracy>" StaticText "%"

    // Detect model name - it comes after agent name
    // We can identify it by looking for patterns that match model names
    const modelMatch = line.match(/StaticText "([^"]+)"/)
    if (modelMatch) {
      const text = modelMatch[1]

      // Check if this looks like a model name (contains key words or patterns)
      if (
        text.includes('Claude') ||
        text.includes('GPT') ||
        text.includes('Gemini') ||
        text.includes('Opus') ||
        text.includes('Sonnet') ||
        text.includes('Haiku') ||
        text.includes('Codex') ||
        text.includes('Kimi') ||
        text.includes('MiniMax') ||
        text.includes('Qwen') ||
        text.includes('GLM') ||
        text.includes('Grok') ||
        text.includes('Multiple')
      ) {
        currentModel = text
        continue
      }
    }

    // Look for accuracy percentage
    // Pattern: StaticText "<Number>.<Number>" followed by StaticText "%"
    const accuracyMatch = line.match(/StaticText "(\d+\.\d+)"/)
    if (accuracyMatch && currentModel && i + 1 < lines.length) {
      const nextLine = lines[i + 1]
      if (nextLine.includes('StaticText "%"')) {
        const percentage = parseFloat(accuracyMatch[1])
        const decimalScore = percentage / 100 // Convert to decimal (0-1)

        // Store the score for this model
        if (!modelScores.has(currentModel)) {
          modelScores.set(currentModel, [])
        }
        modelScores.get(currentModel).push(decimalScore)

        currentModel = null // Reset for next row
      }
    }
  }

  // For each model, take the highest score and map to manifest ID
  for (const [modelName, scores] of modelScores.entries()) {
    const maxScore = Math.max(...scores)
    const manifestId = mapModelName('terminalBench', modelName, mappings)

    if (manifestId) {
      benchmarkData.set(manifestId, maxScore)
      console.log(`    ✓ Mapped: "${modelName}" → ${manifestId} (${maxScore.toFixed(3)})`)
    } else {
      trackUnmapped(unmapped, modelName)
    }
  }

  console.log(`  📊 Extracted ${benchmarkData.size} models, ${unmapped.size} unmapped`)
  console.log(`  ⚠️  Note: Values stored in decimal format (0-1 scale)`)

  return {
    data: benchmarkData,
    unmappedModels: Array.from(unmapped),
  }
}

/**
 * Extract MMMU and MMMU Pro benchmark scores
 * Website: https://mmmu-benchmark.github.io/#leaderboard
 * Special: Returns both MMMU and MMMU Pro from single website
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Object>} Object with mmmu and mmmuPro Maps
 */
async function extractMMMU(mcpTools, mappings) {
  const url = 'https://mmmu-benchmark.github.io/#leaderboard'
  console.log(`  🌐 Navigating to ${url}`)

  await mcpTools.navigate_page({ url, type: 'url' })

  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Leaderboard', timeout: 10000 })

  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  console.log('  🔍 Parsing leaderboard data...')
  const mmmuData = new Map()
  const mmmuProData = new Map()
  const unmapped = new Set()

  // Parse snapshot - look for leaderboard tables
  const lines = snapshot.content.split('\n')

  // MMMU typically has sections for standard and Pro versions
  // Look for model names and scores in percentage format
  let inMmmuSection = false
  let inMmmuProSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect section headers
    if (line.includes('MMMU Pro') || line.includes('mmmu-pro')) {
      inMmmuProSection = true
      inMmmuSection = false
      continue
    } else if (line.includes('MMMU') && !line.includes('Pro')) {
      inMmmuSection = true
      inMmmuProSection = false
      continue
    }

    // Look for model entries with scores
    const textMatch = line.match(/StaticText "([^"]+)"/)
    if (textMatch) {
      const text = textMatch[1]

      // Check if this is a model name
      if (text.includes('Claude') || text.includes('GPT') || text.includes('Gemini')) {
        // Look ahead for score
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const scoreMatch = lines[j].match(/StaticText "(\d+\.?\d*)"/)
          if (scoreMatch) {
            const score = parseFloat(scoreMatch[1])

            const manifestId = mapModelName('mmmu', text, mappings)

            if (manifestId) {
              if (inMmmuProSection) {
                mmmuProData.set(manifestId, score)
                console.log(`    ✓ MMMU Pro: "${text}" → ${manifestId} (${score}%)`)
              } else if (inMmmuSection) {
                mmmuData.set(manifestId, score)
                console.log(`    ✓ MMMU: "${text}" → ${manifestId} (${score}%)`)
              }
            } else {
              trackUnmapped(unmapped, text)
            }

            break
          }
        }
      }
    }
  }

  console.log(
    `  📊 Extracted MMMU: ${mmmuData.size}, MMMU Pro: ${mmmuProData.size}, unmapped: ${unmapped.size}`
  )

  return {
    data: {
      mmmu: mmmuData,
      mmmuPro: mmmuProData,
    },
    unmappedModels: Array.from(unmapped),
  }
}

/**
 * Extract SciCode benchmark scores
 * Website: https://scicode-bench.github.io/leaderboard/
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Map<string, number>>} Map of manifest IDs to scores
 */
async function extractSciCode(mcpTools, mappings) {
  const url = 'https://scicode-bench.github.io/leaderboard/'
  console.log(`  🌐 Navigating to ${url}`)

  await mcpTools.navigate_page({ url, type: 'url' })

  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Model', timeout: 10000 })

  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  console.log('  🔍 Parsing leaderboard data...')
  const benchmarkData = new Map()
  const unmapped = new Set()

  // Generic extraction pattern - look for model names and nearby scores
  return extractGenericLeaderboard(snapshot, mappings, 'sciCode', benchmarkData, unmapped)
}

/**
 * Extract LiveCodeBench Pass@1 scores
 * Website: https://livecodebench.github.io/leaderboard.html
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Map<string, number>>} Map of manifest IDs to scores
 */
async function extractLiveCodeBench(mcpTools, mappings) {
  const url = 'https://livecodebench.github.io/leaderboard.html'
  console.log(`  🌐 Navigating to ${url}`)

  await mcpTools.navigate_page({ url, type: 'url' })

  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Pass@1', timeout: 10000 })

  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  console.log('  🔍 Parsing leaderboard data...')
  const benchmarkData = new Map()
  const unmapped = new Set()

  // Generic extraction pattern
  return extractGenericLeaderboard(snapshot, mappings, 'liveCodeBench', benchmarkData, unmapped)
}

/**
 * Extract WebDevArena scores
 * Website: https://web.lmarena.ai/leaderboard
 *
 * @param {Object} mcpTools - MCP Chrome DevTools tools
 * @param {Object} mappings - Model name mappings configuration
 * @returns {Promise<Map<string, number>>} Map of manifest IDs to scores
 */
async function extractWebDevArena(mcpTools, mappings) {
  const url = 'https://web.lmarena.ai/leaderboard'
  console.log(`  🌐 Navigating to ${url}`)

  await mcpTools.navigate_page({ url, type: 'url' })

  console.log('  ⏳ Waiting for leaderboard...')
  await mcpTools.wait_for({ text: 'Leaderboard', timeout: 10000 })

  console.log('  📸 Taking snapshot...')
  const snapshot = await mcpTools.take_snapshot()

  console.log('  🔍 Parsing leaderboard data...')
  const benchmarkData = new Map()
  const unmapped = new Set()

  // Generic extraction pattern
  return extractGenericLeaderboard(snapshot, mappings, 'webDevArena', benchmarkData, unmapped)
}

/**
 * Generic leaderboard extraction helper
 * Looks for model names and nearby numeric scores
 *
 * @param {Object} snapshot - Page snapshot
 * @param {Object} mappings - Model name mappings
 * @param {string} benchmarkId - Benchmark identifier
 * @param {Map} benchmarkData - Map to populate with data
 * @param {Set} unmapped - Set to track unmapped models
 * @returns {Object} Result object with data and unmapped models
 */
function extractGenericLeaderboard(snapshot, mappings, benchmarkId, benchmarkData, unmapped) {
  const lines = snapshot.content.split('\n')

  // Look for model names followed by scores
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const textMatch = line.match(/StaticText "([^"]+)"/)

    if (textMatch) {
      const text = textMatch[1]

      // Check if this looks like a model name
      if (
        text.includes('Claude') ||
        text.includes('GPT') ||
        text.includes('Gemini') ||
        text.includes('DeepSeek') ||
        text.includes('Grok') ||
        text.includes('claude') ||
        text.includes('gpt') ||
        text.includes('gemini')
      ) {
        // Look ahead for a numeric score
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const scoreMatch = lines[j].match(/StaticText "(\d+\.?\d*)"/)
          if (scoreMatch && !lines[j].includes('StaticText "$')) {
            const score = parseFloat(scoreMatch[1])

            // Only process reasonable scores (0-100 range)
            if (score >= 0 && score <= 100) {
              const manifestId = mapModelName(benchmarkId, text, mappings)

              if (manifestId) {
                benchmarkData.set(manifestId, score)
                console.log(`    ✓ Mapped: "${text}" → ${manifestId} (${score}%)`)
              } else {
                trackUnmapped(unmapped, text)
              }

              break
            }
          }
        }
      }
    }
  }

  console.log(`  📊 Extracted ${benchmarkData.size} models, ${unmapped.size} unmapped`)

  return {
    data: benchmarkData,
    unmappedModels: Array.from(unmapped),
  }
}

/**
 * Extractor registry
 * Maps benchmark IDs to their extractor functions
 */
export const extractors = {
  swebench: extractSWEBench,
  terminalBench: extractTerminalBench,
  mmmu: extractMMMU,
  sciCode: extractSciCode,
  liveCodeBench: extractLiveCodeBench,
  webDevArena: extractWebDevArena,
}
