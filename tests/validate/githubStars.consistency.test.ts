import fs from 'node:fs'
import path from 'node:path'

import { describe, it } from 'vitest'

/**
 * Read and parse JSON from disk.
 */
function readJsonFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as unknown
}

/**
 * Collect manifest IDs from manifests/{category}/*.json.
 */
function getManifestIds(rootDir: string, category: string): string[] {
  const dirPath = path.join(rootDir, 'manifests', category)
  if (!fs.existsSync(dirPath)) {
    return []
  }
  return fs
    .readdirSync(dirPath)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'))
    .sort()
}

/**
 * Collect github-stars IDs for a given category from data/github-stars.json.
 */
function getGithubStarIds(githubStars: unknown, category: string): string[] {
  if (githubStars === null || typeof githubStars !== 'object') {
    return []
  }
  const record = githubStars as Record<string, unknown>
  const section = record[category]
  if (section === null || typeof section !== 'object') {
    return []
  }
  return Object.keys(section as Record<string, unknown>).sort()
}

/**
 * Validate that github-stars.json and manifests are in sync.
 */
function validateGithubStarsConsistency(rootDir: string): string[] {
  const failures: string[] = []
  const categories = ['extensions', 'clis', 'ides'] as const

  const githubStarsPath = path.join(rootDir, 'data', 'github-stars.json')
  const githubStars = readJsonFile(githubStarsPath)

  for (const category of categories) {
    const manifestIds = getManifestIds(rootDir, category)
    const githubStarIds = getGithubStarIds(githubStars, category)

    const orphaned = githubStarIds.filter(id => !manifestIds.includes(id))
    const missing = manifestIds.filter(id => !githubStarIds.includes(id))

    if (orphaned.length > 0) {
      failures.push(
        `[${category}] entries in data/github-stars.json without manifest files:\n${orphaned.map(i => `- ${i}`).join('\n')}`
      )
    }
    if (missing.length > 0) {
      failures.push(
        `[${category}] manifest files missing in data/github-stars.json:\n${missing.map(i => `- ${i}`).join('\n')}`
      )
    }
  }

  return failures
}

describe('validate: github-stars consistency', () => {
  it('data/github-stars.json matches manifest files', () => {
    const failures = validateGithubStarsConsistency(process.cwd())
    if (failures.length > 0) {
      throw new Error(`github-stars consistency validation failed:\n\n${failures.join('\n\n')}`)
    }
  })
})
