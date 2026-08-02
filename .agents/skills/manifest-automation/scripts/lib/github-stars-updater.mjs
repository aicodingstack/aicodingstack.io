#!/usr/bin/env node

/**
 * GitHub Stars Updater
 * Keeps repository keys in github-stars.json aligned with product manifests.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const manifestDirectories = {
  cli: 'clis',
  desktop: 'desktops',
  extension: 'extensions',
  ide: 'ides',
}

function getProjectRoot() {
  return path.resolve(__dirname, '../../../../..')
}

function getGithubStarsPath() {
  return path.join(getProjectRoot(), 'data/github-stars.json')
}

function getManifestPath(type, id) {
  const directory = manifestDirectories[type]
  return directory ? path.join(getProjectRoot(), 'manifests', directory, `${id}.json`) : null
}

function repositoryIdFromUrl(url) {
  const match = url
    ?.replace(/\/$/, '')
    .replace(/\.git$/, '')
    .match(/^https:\/\/github\.com\/(.+\/.+)$/)
  return match?.[1] ?? null
}

function loadManifestRepository(type, id) {
  const manifestPath = getManifestPath(type, id)
  if (!manifestPath || !fs.existsSync(manifestPath)) return null
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  return repositoryIdFromUrl(manifest.githubUrl)
}

function countRepositoryAssociations(repositoryId, excludedType, excludedId) {
  let count = 0
  for (const [type, directory] of Object.entries(manifestDirectories)) {
    const directoryPath = path.join(getProjectRoot(), 'manifests', directory)
    for (const file of fs.readdirSync(directoryPath).filter(name => name.endsWith('.json'))) {
      const id = file.replace(/\.json$/, '')
      if (type === excludedType && id === excludedId) continue
      const manifest = JSON.parse(fs.readFileSync(path.join(directoryPath, file), 'utf8'))
      if (repositoryIdFromUrl(manifest.githubUrl) === repositoryId) count += 1
    }
  }
  return count
}

export function loadGithubStars() {
  const filePath = getGithubStarsPath()
  if (!fs.existsSync(filePath)) {
    throw new Error(`github-stars.json not found at: ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function saveGithubStars(data) {
  const sortedRepositories = Object.fromEntries(
    Object.entries(data.repositories).sort(([left], [right]) => left.localeCompare(right))
  )
  fs.writeFileSync(
    getGithubStarsPath(),
    `${JSON.stringify({ ...data, repositories: sortedRepositories }, null, 2)}\n`,
    'utf8'
  )
}

export function updateGithubStarsEntry(type, id, options = {}) {
  const { isNew = false } = options

  try {
    const repositoryId = loadManifestRepository(type, id)
    if (!repositoryId) {
      return {
        status: 'skipped',
        message: `Manifest "${type}:${id}" has no tracked GitHub repository`,
      }
    }

    const githubStars = loadGithubStars()
    const exists = Object.hasOwn(githubStars.repositories, repositoryId)
    if (isNew && exists) {
      return {
        status: 'skipped',
        message: `Repository "${repositoryId}" already exists in github-stars.json`,
      }
    }

    githubStars.repositories[repositoryId] ??= null
    saveGithubStars(githubStars)
    return {
      status: 'success',
      message: `Tracked github-stars.json repository "${repositoryId}"`,
      action: exists ? 'unchanged' : 'added',
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Failed to update github-stars.json: ${error.message}`,
      error,
    }
  }
}

export function removeGithubStarsEntry(type, id) {
  try {
    const repositoryId = loadManifestRepository(type, id)
    if (!repositoryId) {
      return {
        status: 'skipped',
        message: `Manifest "${type}:${id}" has no tracked GitHub repository`,
      }
    }

    if (countRepositoryAssociations(repositoryId, type, id) > 0) {
      return {
        status: 'skipped',
        message: `Repository "${repositoryId}" is still used by another product surface`,
      }
    }

    const githubStars = loadGithubStars()
    if (!Object.hasOwn(githubStars.repositories, repositoryId)) {
      return {
        status: 'skipped',
        message: `Repository "${repositoryId}" is not tracked in github-stars.json`,
      }
    }

    delete githubStars.repositories[repositoryId]
    saveGithubStars(githubStars)
    return {
      status: 'success',
      message: `Removed repository "${repositoryId}" from github-stars.json`,
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Failed to remove repository from github-stars.json: ${error.message}`,
      error,
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, type, id] = process.argv
  if (!command || !['add', 'update', 'remove'].includes(command) || !type || !id) {
    console.error('Usage:')
    console.error('  node github-stars-updater.mjs <add|update|remove> <type> <id>')
    process.exit(1)
  }

  const result =
    command === 'remove'
      ? removeGithubStarsEntry(type, id)
      : updateGithubStarsEntry(type, id, { isNew: command === 'add' })
  console.log(`Status: ${result.status}`)
  console.log(`Message: ${result.message}`)
  if (result.status === 'error') process.exit(1)
}
