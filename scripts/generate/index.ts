#!/usr/bin/env node

/**
 * Generate Scripts Entry Point
 *
 * This script runs all generation scripts.
 * Can be called from CI or manually.
 *
 * Usage:
 *   node scripts/generate/index.ts [script-name]
 *
 * If no script name is provided, runs all scripts.
 */

import { type CategoryConfig, runCategoryScripts } from '../_shared/runner'

runCategoryScripts({
  categoryName: 'generate',
} as CategoryConfig).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
