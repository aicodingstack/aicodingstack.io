#!/usr/bin/env node

/**
 * Fetch Scripts Entry Point
 *
 * This script runs all fetch scripts.
 * Can be called from CI or manually.
 *
 * Usage:
 *   node scripts/fetch/index.ts [script-name]
 *
 * If no script name is provided, runs all scripts.
 */

import { runCategoryScripts } from '../_shared/runner'

runCategoryScripts({
  categoryName: 'fetch',
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
