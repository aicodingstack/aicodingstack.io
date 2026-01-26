#!/usr/bin/env node

/**
 * Refactor Scripts Entry Point
 *
 * This script runs all refactoring scripts.
 * Can be called from CI or manually.
 *
 * Usage:
 *   node scripts/refactor/index.ts [script-name]
 *
 * If no script name is provided, runs all scripts.
 *
 * Note: For includes/excludes, use the script name without .ts extension.
 * For example, 'sort-manifest-fields' (not 'sort-manifest-fields.ts')
 */

import { type CategoryConfig, runCategoryScripts } from '../_shared/runner'

runCategoryScripts({
  categoryName: 'refactor',
  // Example: excludes: ['sort-manifest-fields'] to exclude it
  // Example: includes: ['sort-manifest-fields'] to only run it
} as CategoryConfig).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
