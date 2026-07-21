#!/usr/bin/env node

/**
 * GitHub Stars Updater
 * Updates github-stars.json with new manifest entries
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get project root directory
 */
function getProjectRoot() {
  return path.resolve(__dirname, '../../../../..')
}

/**
 * Get the path to github-stars.json
 */
function getGithubStarsPath() {
  return path.join(getProjectRoot(), 'data/github-stars.json')
}

/**
 * Load github-stars.json
 * @returns {Object} The current github-stars data
 */
export function loadGithubStars() {
  const filePath = getGithubStarsPath()

  if (!fs.existsSync(filePath)) {
    throw new Error(`github-stars.json not found at: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Save github-stars.json
 * @param {Object} data - The github-stars data to save
 */
export function saveGithubStars(data) {
  const filePath = getGithubStarsPath()
  const content = `${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * Get the category name (plural form) from manifest type
 * @param {string} type - Manifest type (cli, extension, ide, model, provider, vendor)
 * @returns {string} Category name for github-stars.json
 */
function getCategoryName(type) {
  const mapping = {
    cli: 'clis',
    extension: 'extensions',
    ide: 'ides',
    model: 'models',
    provider: 'providers',
    vendor: 'vendors',
  }

  return mapping[type] || `${type}s`
}

/**
 * Update github-stars.json with a new or updated manifest entry
 * @param {string} type - Manifest type (cli, extension, ide, etc.)
 * @param {string} id - Manifest id
 * @param {Object} options - Options
 * @param {boolean} options.isNew - Whether this is a new entry (true) or update (false)
 * @returns {Object} Result with status and message
 */
export function updateGithubStarsEntry(type, id, options = {}) {
  const { isNew = false } = options

  try {
    // Load current data
    const githubStars = loadGithubStars()
    const category = getCategoryName(type)

    // Ensure category exists
    if (!githubStars[category]) {
      githubStars[category] = {}
    }

    // Check if entry already exists
    const exists = id in githubStars[category]

    if (isNew && exists) {
      return {
        status: 'skipped',
        message: `Entry "${id}" already exists in github-stars.json under "${category}"`,
      }
    }

    if (!isNew && !exists) {
      return {
        status: 'warning',
        message: `Entry "${id}" does not exist in github-stars.json under "${category}", adding as new`,
      }
    }

    // Add or update entry with null (stars will be fetched later)
    githubStars[category][id] = null

    // Sort entries alphabetically within category
    const sortedCategory = Object.keys(githubStars[category])
      .sort()
      .reduce((acc, key) => {
        acc[key] = githubStars[category][key]
        return acc
      }, {})

    githubStars[category] = sortedCategory

    // Save updated data
    saveGithubStars(githubStars)

    return {
      status: 'success',
      message: `Updated github-stars.json: ${category}["${id}"] = null`,
      action: exists ? 'updated' : 'added',
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Failed to update github-stars.json: ${error.message}`,
      error,
    }
  }
}

/**
 * Remove an entry from github-stars.json
 * @param {string} type - Manifest type
 * @param {string} id - Manifest id
 * @returns {Object} Result with status and message
 */
export function removeGithubStarsEntry(type, id) {
  try {
    const githubStars = loadGithubStars()
    const category = getCategoryName(type)

    if (!githubStars[category] || !(id in githubStars[category])) {
      return {
        status: 'skipped',
        message: `Entry "${id}" not found in github-stars.json under "${category}"`,
      }
    }

    delete githubStars[category][id]
    saveGithubStars(githubStars)

    return {
      status: 'success',
      message: `Removed "${id}" from github-stars.json under "${category}"`,
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Failed to remove entry from github-stars.json: ${error.message}`,
      error,
    }
  }
}

/**
 * CLI entry point for testing
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, type, id] = process.argv

  if (!command || !['add', 'update', 'remove'].includes(command)) {
    console.error('Usage:')
    console.error('  node github-stars-updater.mjs add <type> <id>')
    console.error('  node github-stars-updater.mjs update <type> <id>')
    console.error('  node github-stars-updater.mjs remove <type> <id>')
    console.error('')
    console.error('Examples:')
    console.error('  node github-stars-updater.mjs add cli cursor-cli')
    console.error('  node github-stars-updater.mjs update extension claude-code')
    console.error('  node github-stars-updater.mjs remove ide windsurf')
    process.exit(1)
  }

  if (!type || !id) {
    console.error('Error: type and id are required')
    process.exit(1)
  }

  let result

  if (command === 'add' || command === 'update') {
    result = updateGithubStarsEntry(type, id, { isNew: command === 'add' })
  } else {
    result = removeGithubStarsEntry(type, id)
  }

  console.log(`Status: ${result.status}`)
  console.log(`Message: ${result.message}`)

  if (result.status === 'error') {
    process.exit(1)
  }
}
