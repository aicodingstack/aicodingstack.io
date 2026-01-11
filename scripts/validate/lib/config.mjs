/**
 * Configuration constants
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const ROOT_DIR = path.resolve(__dirname, '../../..')

// Locales configuration
export const LOCALES = [
  'en',
  'de',
  'es',
  'fr',
  'id',
  'ja',
  'ko',
  'pt',
  'ru',
  'tr',
  'zh-Hans',
  'zh-Hant',
]

// Base URL - can be overridden via BASE_URL environment variable
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Delay between requests in milliseconds - can be overridden via REQUEST_DELAY environment variable
// Default: 100ms (0.1 second) between requests to avoid overwhelming the server
export const REQUEST_DELAY = Number.parseInt(process.env.REQUEST_DELAY || '100', 10)

/**
 * Get locale prefix for URL
 */
export function getLocalePrefix(locale) {
  return locale === 'en' ? '' : `/${locale}`
}
