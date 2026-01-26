/**
 * Route and slug utilities
 */

import fs from 'node:fs'
import path from 'node:path'
import { ROOT_DIR } from './config'

/**
 * Read JSON file
 */
export function readJsonFile(filePath: string): Record<string, unknown> {
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as Record<string, unknown>
}

/**
 * Get all static routes
 */
export function getStaticRoutes(): string[] {
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
export function getSlugsFromManifests(category: string): string[] {
  const manifestsDir = path.join(ROOT_DIR, 'manifests', category)
  if (!fs.existsSync(manifestsDir)) {
    return []
  }

  const files = fs.readdirSync(manifestsDir).filter(f => f.endsWith('.json'))
  const slugs: string[] = []

  for (const file of files) {
    const filePath = path.join(manifestsDir, file)
    try {
      const data = readJsonFile(filePath)
      if (data && typeof data === 'object' && data.id) {
        slugs.push(data.id as string)
      }
    } catch (error) {
      const err = error as Error
      console.warn(`Warning: Failed to read ${filePath}: ${err.message}`)
    }
  }

  return slugs
}

/**
 * Get article slugs from content directory
 */
export function getArticleSlugs(): string[] {
  try {
    const articlesDir = path.join(ROOT_DIR, 'content/articles/en')
    if (!fs.existsSync(articlesDir)) {
      return []
    }

    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'))
    return files.map(file => file.replace('.mdx', ''))
  } catch (error) {
    const err = error as Error
    console.warn(`Warning: Failed to get article slugs: ${err.message}`)
    return []
  }
}

/**
 * Get doc slugs from content directory
 */
export function getDocSlugs(): string[] {
  try {
    const docsDir = path.join(ROOT_DIR, 'content/docs/en')
    if (!fs.existsSync(docsDir)) {
      return []
    }

    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.mdx'))
    return files.map(file => file.replace('.mdx', ''))
  } catch (error) {
    const err = error as Error
    console.warn(`Warning: Failed to get doc slugs: ${err.message}`)
    return []
  }
}

/**
 * Dynamic route configuration
 */
export interface DynamicRoute {
  path: string
  category: string
}

/**
 * Get dynamic route configurations
 */
export function getDynamicRoutes(): DynamicRoute[] {
  return [
    { path: '/ides', category: 'ides' },
    { path: '/clis', category: 'clis' },
    { path: '/extensions', category: 'extensions' },
    { path: '/models', category: 'models' },
    { path: '/model-providers', category: 'providers' },
    { path: '/vendors', category: 'vendors' },
  ]
}
