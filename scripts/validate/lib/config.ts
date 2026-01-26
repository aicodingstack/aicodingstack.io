/**
 * Configuration constants
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { locales } from '@/i18n/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const ROOT_DIR = path.resolve(__dirname, '../../..')

// Re-export from central i18n config
export const LOCALES = locales as readonly string[]

// Base URL - can be overridden via BASE_URL environment variable
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Delay between requests in milliseconds - can be overridden via REQUEST_DELAY environment variable
export const REQUEST_DELAY = Number.parseInt(process.env.REQUEST_DELAY || '100', 10)
