#!/usr/bin/env node

/**
 * Manifest Automation - Entry Point
 * Usage:
 *   node automate.mjs create cli cursor-cli https://cursor.com/cli
 *   node automate.mjs update extension claude-code https://code.anthropic.com
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  MANIFEST_PATHS,
  MANIFEST_TYPES,
  RETRY_CONFIG,
  SCHEMA_PATHS,
  WORKFLOW_PATHS,
} from './lib/config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse command-line arguments
const [, , mode, type, name, url] = process.argv

// Validation
function validate() {
  const errors = []

  if (!mode || !['create', 'update'].includes(mode)) {
    errors.push('Mode must be "create" or "update"')
  }

  if (!type || !MANIFEST_TYPES.includes(type)) {
    errors.push(`Type must be one of: ${MANIFEST_TYPES.join(', ')}`)
  }

  if (!name) {
    errors.push('Name is required')
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    errors.push('Name must be lowercase with hyphens (e.g., "cursor-cli")')
  }

  if (mode === 'create' && !url) {
    errors.push('URL is required for CREATE mode')
  }

  if (url && !url.startsWith('https://')) {
    errors.push('URL must start with https://')
  }

  return errors
}

const errors = validate()

if (errors.length > 0) {
  console.error('❌ Validation Errors:\n')
  for (const error of errors) {
    console.error(`   • ${error}`)
  }
  console.error('\nUsage:')
  console.error('  node automate.mjs create <type> <name> <url>')
  console.error('  node automate.mjs update <type> <name> [url]')
  console.error('\nExamples:')
  console.error('  node automate.mjs create cli cursor-cli https://cursor.com/cli')
  console.error('  node automate.mjs update extension claude-code https://code.anthropic.com')
  process.exit(1)
}

// Load schema
const schemaPath = SCHEMA_PATHS[type]
const manifestPath = MANIFEST_PATHS[type](name)
const workflowPath = WORKFLOW_PATHS[type]

// Check if files exist
const projectRoot = path.resolve(__dirname, '../../../..')
const schemaFullPath = path.join(projectRoot, schemaPath)
const manifestFullPath = path.join(projectRoot, manifestPath)
const workflowFullPath = path.join(projectRoot, workflowPath)

if (!fs.existsSync(schemaFullPath)) {
  console.error(`❌ Schema not found: ${schemaPath}`)
  process.exit(1)
}

if (!fs.existsSync(workflowFullPath)) {
  console.error(`❌ Workflow not found: ${workflowPath}`)
  process.exit(1)
}

// For UPDATE mode, check if manifest exists
let _existingManifest = null
if (mode === 'update') {
  if (!fs.existsSync(manifestFullPath)) {
    console.error(`❌ Manifest not found for update: ${manifestPath}`)
    console.error('   Use "create" mode for new manifests')
    process.exit(1)
  }

  try {
    const manifestContent = fs.readFileSync(manifestFullPath, 'utf-8')
    _existingManifest = JSON.parse(manifestContent)
  } catch (error) {
    console.error(`❌ Failed to parse existing manifest: ${error.message}`)
    process.exit(1)
  }
}

// Load workflow
const workflowContent = fs.readFileSync(workflowFullPath, 'utf-8')

// Output instructions
console.log('📋 Manifest Workflow Preparation')
console.log('━'.repeat(60))
console.log('')
console.log(`Mode:   ${mode.toUpperCase()}`)
console.log(`Type:   ${type}`)
console.log(`Name:   ${name}`)
if (url) console.log(`URL:    ${url}`)
console.log('')
console.log(`Schema: ${schemaPath}`)
console.log(`Output: ${manifestPath}`)
console.log('')
console.log('━'.repeat(60))
console.log('📋 Workflow Instructions')
console.log('━'.repeat(60))
console.log('')

if (mode === 'update') {
  console.log('## UPDATE Mode - Smart Merge\n')
  console.log('You are updating an existing manifest. Follow these rules:\n')
  console.log('1. **Load existing manifest** from:', manifestPath)
  console.log('2. **Follow the workflow below** to extract fresh data')
  console.log('3. **Use smart merge only as an advisory diff**:')
  console.log('   - Verify every mutable fact against a current authoritative source')
  console.log('   - Preserve identity, relationships, and translations for manual review')
  console.log('   - Merge arrays by schema identity and reject incompatible evidence')
  console.log('4. **Generate change report** showing what was updated/added/preserved')
  console.log('5. **Write updated manifest** back to the same path\n')
  console.log('━'.repeat(60))
  console.log('')
}

console.log(workflowContent)
console.log('')
console.log('━'.repeat(60))
console.log('🎯 Evidence and Error Handling Rules')
console.log('━'.repeat(60))
console.log('')
console.log(`• Make at most ${RETRY_CONFIG.maxAttempts} materially different attempts per field`)
console.log('• Prefer official documentation, repositories, model cards, and marketplaces')
console.log('• Do not guess values or put comments/placeholders into JSON')
console.log('• Report unresolved fields separately; stop if a required field cannot be verified')
console.log('• Record source provenance and verification metadata required by the schema\n')

if (mode === 'update') {
  console.log('Change Tracking:')
  console.log('  Track all changes using merge-strategies.mjs')
  console.log('  Generate report with updated/added/preserved/needsReview fields\n')
}

console.log('━'.repeat(60))
console.log('📝 Required Validation')
console.log('━'.repeat(60))
console.log('')
console.log('After editing and reviewing the manifest:')
console.log('1. pnpm generate')
console.log('2. pnpm test:validate')
console.log('3. pnpm validate:i18n')
console.log('4. pnpm data-health:check')
console.log('')
console.log('━'.repeat(60))
console.log('')
console.log('✅ Ready. The helper prepared instructions; it did not browse or edit files.')
console.log('')

export { type as manifestType, name as manifestName, mode as operationMode }
