#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const TRANSLATIONS_DIR = path.join(PROJECT_ROOT, 'translations')
const EN_DIR = path.join(TRANSLATIONS_DIR, 'en')

const LOCALE_NAMES = {
  de: 'Deutsch (German)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  id: 'Bahasa Indonesia (Indonesian)',
  ja: '日本語 (Japanese)',
  ko: '한국어 (Korean)',
  pt: 'Português (Portuguese)',
  ru: 'Русский (Russian)',
  tr: 'Türkçe (Turkish)',
  'zh-Hans': '简体中文 (Simplified Chinese)',
  'zh-Hant': '繁體中文 (Traditional Chinese)',
}

function getEnabledLocales() {
  const content = fs.readFileSync(path.join(PROJECT_ROOT, 'src/i18n/config.ts'), 'utf8')
  const match = content.match(/export const locales\s*=\s*\[([^\]]+)\]/s)
  if (!match) throw new Error('Could not parse locales from src/i18n/config.ts')
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

function getJsonFiles(dir) {
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

function entries(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      entries(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [{ key: prefix, value }]
}

function getAtPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current?.[key], value)
}

function main() {
  const locale = process.argv[2]
  const enabled = getEnabledLocales()
  if (!locale || locale === 'en' || !enabled.includes(locale)) {
    throw new Error(
      `Choose an enabled non-English locale: ${enabled.filter(item => item !== 'en').join(', ')}`
    )
  }

  const targetDir = path.join(TRANSLATIONS_DIR, locale)
  const tasks = {}
  let count = 0

  for (const relativePath of getJsonFiles(EN_DIR)) {
    const english = JSON.parse(fs.readFileSync(path.join(EN_DIR, relativePath), 'utf8'))
    const targetPath = path.join(targetDir, relativePath)
    const target = fs.existsSync(targetPath) ? JSON.parse(fs.readFileSync(targetPath, 'utf8')) : {}
    for (const item of entries(english)) {
      const targetValue = getAtPath(target, item.key)
      if (targetValue === undefined || targetValue === '' || targetValue === item.value) {
        tasks[relativePath] ||= {}
        tasks[relativePath][item.key] = item.value
        count++
      }
    }
  }

  if (count === 0) {
    console.log(`No missing or exact-English translation candidates found for ${locale}.`)
    return
  }

  console.log(`Translation candidates for ${LOCALE_NAMES[locale] || locale}: ${count} entries`)
  console.log(
    'Apply translations to the named files. Preserve placeholders, ICU branches, tags, URLs, paths, code, and @: references exactly.'
  )
  console.log(
    'Review every candidate. Keep official names and intentional shared technical terms unchanged; Latin letters alone do not imply missing translation.'
  )
  console.log(JSON.stringify(tasks, null, 2))
}

try {
  main()
} catch (error) {
  console.error(`i18n translation task failed: ${error.message}`)
  process.exit(1)
}
