#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const TRANSLATIONS_DIR = path.join(PROJECT_ROOT, 'translations')
const EN_DIR = path.join(TRANSLATIONS_DIR, 'en')
const write = process.argv.includes('--write')

if (write && process.argv.includes('--check')) {
  console.error('Choose either --check or --write, not both.')
  process.exit(1)
}

function getEnabledLocales() {
  const content = fs.readFileSync(path.join(PROJECT_ROOT, 'src/i18n/config.ts'), 'utf8')
  const match = content.match(/export const locales\s*=\s*\[([^\]]+)\]/s)
  if (!match) throw new Error('Could not parse locales from src/i18n/config.ts')
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

function getJsonFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const files = []
  function visit(current, relative = '') {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const nextRelative = path.join(relative, entry.name)
      if (entry.isDirectory()) visit(path.join(current, entry.name), nextRelative)
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(nextRelative)
    }
  }
  visit(dir)
  return files.sort()
}

function leafKeys(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      leafKeys(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [prefix]
}

function synchronize(reference, target, prefix = '') {
  const result = {}
  const added = []
  const removed = []
  const targetObject = target && typeof target === 'object' && !Array.isArray(target) ? target : {}

  for (const [key, referenceValue] of Object.entries(reference)) {
    const field = prefix ? `${prefix}.${key}` : key
    if (referenceValue && typeof referenceValue === 'object' && !Array.isArray(referenceValue)) {
      const nested = synchronize(referenceValue, targetObject[key], field)
      result[key] = nested.result
      added.push(...nested.added)
      removed.push(...nested.removed)
    } else if (Object.hasOwn(targetObject, key)) {
      const targetValue = targetObject[key]
      const referenceIsArray = Array.isArray(referenceValue)
      const targetIsArray = Array.isArray(targetValue)
      const targetIsObject = targetValue !== null && typeof targetValue === 'object'
      if ((referenceIsArray && targetIsArray) || (!referenceIsArray && !targetIsObject)) {
        result[key] = targetValue
      } else {
        result[key] = referenceValue
        added.push(field)
        removed.push(...leafKeys(targetValue, field))
      }
    } else {
      result[key] = referenceValue
      added.push(field)
    }
  }

  for (const [key, value] of Object.entries(targetObject)) {
    if (!Object.hasOwn(reference, key)) {
      const field = prefix ? `${prefix}.${key}` : key
      removed.push(...leafKeys(value, field))
    }
  }
  return { result, added, removed }
}

function main() {
  if (!fs.existsSync(EN_DIR)) throw new Error(`English translations not found: ${EN_DIR}`)
  const locales = getEnabledLocales().filter(locale => locale !== 'en')
  const englishFiles = getJsonFiles(EN_DIR)
  let driftCount = 0
  let extraFileCount = 0

  for (const locale of locales) {
    const localeDir = path.join(TRANSLATIONS_DIR, locale)
    const localeFiles = getJsonFiles(localeDir)
    const extraFiles = localeFiles.filter(file => !englishFiles.includes(file))
    for (const relativePath of extraFiles) {
      console.log(`${locale}: extra file requires manual review: ${relativePath}`)
      driftCount++
      extraFileCount++
    }

    for (const relativePath of englishFiles) {
      const reference = JSON.parse(fs.readFileSync(path.join(EN_DIR, relativePath), 'utf8'))
      const targetPath = path.join(localeDir, relativePath)
      const exists = fs.existsSync(targetPath)
      const target = exists ? JSON.parse(fs.readFileSync(targetPath, 'utf8')) : {}
      const synced = synchronize(reference, target)
      if (!exists || synced.added.length > 0 || synced.removed.length > 0) {
        driftCount++
        console.log(
          `${locale}/${relativePath}: ${exists ? '' : 'missing file; '}${synced.added.length} key(s) to add, ${synced.removed.length} key(s) to remove`
        )
        if (synced.added.length) console.log(`  add: ${synced.added.join(', ')}`)
        if (synced.removed.length) console.log(`  remove: ${synced.removed.join(', ')}`)
        if (write) {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true })
          fs.writeFileSync(targetPath, `${JSON.stringify(synced.result, null, 2)}\n`, 'utf8')
        }
      }
    }
  }

  if (driftCount === 0) {
    console.log('All locale JSON structures match English.')
    return
  }
  if (write) {
    console.log(
      `Synchronized ${driftCount} structural difference(s). Extra files were not deleted.`
    )
    if (extraFileCount > 0) process.exitCode = 1
  } else {
    console.error(`Found ${driftCount} structural difference(s). Preview only; no files changed.`)
    process.exitCode = 1
  }
}

try {
  main()
} catch (error) {
  console.error(`i18n sync failed: ${error.message}`)
  process.exit(1)
}
