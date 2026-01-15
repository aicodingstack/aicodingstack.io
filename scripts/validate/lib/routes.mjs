/**
 * Route and slug utilities
 */

import fs from 'node:fs'
import path from 'node:path'
import { ROOT_DIR } from './config.mjs'

/**
 * Read JSON file
 */
export function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

/**
 * Get all static routes
 */
export function getStaticRoutes() {
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
export function getSlugsFromManifests(category) {
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
export function getArticleSlugs() {
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
export function getDocSlugs() {
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
 * Get dynamic route configurations
 */
export function getDynamicRoutes() {
  return [
    { path: '/ides', category: 'ides' },
    { path: '/clis', category: 'clis' },
    { path: '/extensions', category: 'extensions' },
    { path: '/models', category: 'models' },
    { path: '/model-providers', category: 'providers' },
    { path: '/vendors', category: 'vendors' },
  ]
}
