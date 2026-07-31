import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import { defaultLocale, locales } from '../../../src/i18n/config.js'

export type I18nResourceKind = 'messages' | 'content' | 'manifest'

export interface ExactEnglishCandidate {
  id: string
  resource: I18nResourceKind
  locale: string
  file: string
  key: string
  value: string
}

export interface ExactEnglishBaseline {
  version: 1
  allowedExactEnglish: Record<string, string>
}

export interface ExactEnglishBaselineEntry {
  id: string
  value: string
}

const URL_OR_PATH_PREFIX = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i
const PLACEHOLDER_PATTERN = /\{[^{}]+\}/g
const ENGLISH_WORD_PATTERN = /[A-Za-z][A-Za-z'’-]*/g
const MARKDOWN_PREFIX = /^(?:#{1,6}\s+|>\s*|[-+*]\s+|\d+[.)]\s+)/

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

/**
 * Detect any human-readable value containing an English word. Exact matches
 * that must stay unchanged, such as product names and technical identifiers,
 * belong in the reviewed baseline instead of being hidden by a length heuristic.
 */
export function isPotentialUntranslatedText(value: string): boolean {
  const normalized = normalizeText(value)

  if (!normalized || normalized.startsWith('@:') || URL_OR_PATH_PREFIX.test(normalized)) {
    return false
  }

  const withoutPlaceholders = normalized.replace(PLACEHOLDER_PATTERN, ' ')
  const words = withoutPlaceholders.match(ENGLISH_WORD_PATTERN) ?? []

  return words.length >= 1
}

function collectStringLeaves(value: unknown, prefix: string, output: Map<string, string>): void {
  if (typeof value === 'string') {
    output.set(prefix, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringLeaves(item, `${prefix}[${index}]`, output)
    })
    return
  }

  if (value === null || typeof value !== 'object') {
    return
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key
    collectStringLeaves(nestedValue, keyPath, output)
  }
}

function listFiles(directory: string, extension: string, root = directory): string[] {
  if (!fs.existsSync(directory)) return []

  const files: string[] = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath, extension, root))
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(toPosixPath(path.relative(root, absolutePath)))
    }
  }

  return files.sort()
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

function readStringLeaves(filePath: string): Map<string, string> {
  const leaves = new Map<string, string>()
  collectStringLeaves(readJson(filePath), '', leaves)
  return leaves
}

function createCandidate(
  resource: I18nResourceKind,
  locale: string,
  file: string,
  key: string,
  value: string
): ExactEnglishCandidate {
  const normalizedValue = normalizeText(value)

  return {
    id: `${resource}:${locale}:${file}#${key}`,
    resource,
    locale,
    file,
    key,
    value: normalizedValue,
  }
}

function valuesAreUntranslated(englishValue: string, localeValue: string): boolean {
  const normalizedEnglish = normalizeText(englishValue)
  const normalizedLocale = normalizeText(localeValue)

  return normalizedEnglish === normalizedLocale && isPotentialUntranslatedText(normalizedEnglish)
}

export function findMessageExactEnglishCandidates(
  projectRoot = process.cwd()
): ExactEnglishCandidate[] {
  const translationsDirectory = path.join(projectRoot, 'translations')
  const englishDirectory = path.join(translationsDirectory, defaultLocale)
  const candidates: ExactEnglishCandidate[] = []

  for (const relativeFile of listFiles(englishDirectory, '.json')) {
    const englishLeaves = readStringLeaves(path.join(englishDirectory, relativeFile))

    for (const locale of locales) {
      if (locale === defaultLocale) continue

      const localeFile = path.join(translationsDirectory, locale, relativeFile)
      if (!fs.existsSync(localeFile)) continue

      const localeLeaves = readStringLeaves(localeFile)

      for (const [key, englishValue] of englishLeaves) {
        const localeValue = localeLeaves.get(key)
        if (localeValue === undefined || !valuesAreUntranslated(englishValue, localeValue)) {
          continue
        }

        const file = toPosixPath(path.relative(projectRoot, localeFile))
        candidates.push(createCandidate('messages', locale, file, key, englishValue))
      }
    }
  }

  return candidates
}

function stripMarkdownSyntax(value: string): string {
  return normalizeText(
    value
      .replace(MARKDOWN_PREFIX, '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*_~`]/g, '')
  )
}

/**
 * Extract both line-level and paragraph-level prose while excluding fenced code.
 * Comparing both forms catches copied prose even when an MDX paragraph is rewrapped.
 */
export function extractMdxProseUnits(content: string): Map<string, string> {
  const units = new Map<string, string>()
  const paragraphs: string[][] = []
  let currentParagraph: string[] = []
  let inCodeFence = false

  const record = (value: string): void => {
    const normalized = stripMarkdownSyntax(value)
    if (!isPotentialUntranslatedText(normalized)) return

    const digest = createHash('sha256').update(normalized).digest('hex').slice(0, 16)
    units.set(digest, normalized)
  }

  const finishParagraph = (): void => {
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph)
      currentParagraph = []
    }
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (/^(```|~~~)/.test(trimmed)) {
      finishParagraph()
      inCodeFence = !inCodeFence
      continue
    }

    if (inCodeFence || /^(?:import|export)\s/.test(trimmed)) {
      continue
    }

    if (!trimmed) {
      finishParagraph()
      continue
    }

    record(trimmed)
    currentParagraph.push(trimmed)
  }

  finishParagraph()
  paragraphs.forEach(paragraph => {
    record(paragraph.join(' '))
  })

  return units
}

export function findContentExactEnglishCandidates(
  projectRoot = process.cwd()
): ExactEnglishCandidate[] {
  const contentDirectory = path.join(projectRoot, 'content')
  if (!fs.existsSync(contentDirectory)) return []

  const candidates: ExactEnglishCandidate[] = []
  const contentTypes = fs
    .readdirSync(contentDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(contentType => fs.existsSync(path.join(contentDirectory, contentType, defaultLocale)))
    .sort()

  for (const contentType of contentTypes) {
    const englishDirectory = path.join(contentDirectory, contentType, defaultLocale)

    for (const relativeFile of listFiles(englishDirectory, '.mdx')) {
      const englishMdx = matter.read(path.join(englishDirectory, relativeFile))
      const englishFrontmatter = new Map<string, string>()
      collectStringLeaves(englishMdx.data, '', englishFrontmatter)
      const englishProse = extractMdxProseUnits(englishMdx.content)

      for (const locale of locales) {
        if (locale === defaultLocale) continue

        const localeFile = path.join(contentDirectory, contentType, locale, relativeFile)
        if (!fs.existsSync(localeFile)) continue

        const localeMdx = matter.read(localeFile)
        const localeFrontmatter = new Map<string, string>()
        collectStringLeaves(localeMdx.data, '', localeFrontmatter)
        const file = toPosixPath(path.relative(projectRoot, localeFile))

        for (const [key, englishValue] of englishFrontmatter) {
          const localeValue = localeFrontmatter.get(key)
          if (localeValue === undefined || !valuesAreUntranslated(englishValue, localeValue)) {
            continue
          }

          candidates.push(
            createCandidate('content', locale, file, `frontmatter.${key}`, englishValue)
          )
        }

        const localeProse = extractMdxProseUnits(localeMdx.content)
        for (const [digest, englishValue] of englishProse) {
          if (localeProse.get(digest) !== englishValue) continue

          candidates.push(createCandidate('content', locale, file, `body.${digest}`, englishValue))
        }
      }
    }
  }

  return candidates
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function scanManifestValue(
  value: unknown,
  file: string,
  objectPath: string,
  candidates: ExactEnglishCandidate[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      scanManifestValue(item, file, `${objectPath}[${index}]`, candidates)
    })
    return
  }

  if (!isRecord(value)) return

  const translations = value.translations
  if (isRecord(translations)) {
    const englishSource = isRecord(translations[defaultLocale])
      ? translations[defaultLocale]
      : value
    const englishLeaves = new Map<string, string>()
    collectStringLeaves(englishSource, '', englishLeaves)

    for (const locale of locales) {
      if (locale === defaultLocale || !isRecord(translations[locale])) continue

      const localeLeaves = new Map<string, string>()
      collectStringLeaves(translations[locale], '', localeLeaves)

      for (const [key, englishValue] of englishLeaves) {
        const localeValue = localeLeaves.get(key)
        if (localeValue === undefined || !valuesAreUntranslated(englishValue, localeValue)) {
          continue
        }

        const translationPath = objectPath
          ? `${objectPath}.translations.${locale}.${key}`
          : `translations.${locale}.${key}`
        candidates.push(createCandidate('manifest', locale, file, translationPath, englishValue))
      }
    }
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === 'translations') continue
    const nestedPath = objectPath ? `${objectPath}.${key}` : key
    scanManifestValue(nestedValue, file, nestedPath, candidates)
  }
}

export function findManifestExactEnglishCandidates(
  projectRoot = process.cwd()
): ExactEnglishCandidate[] {
  const manifestsDirectory = path.join(projectRoot, 'manifests')
  const candidates: ExactEnglishCandidate[] = []

  for (const relativeFile of listFiles(manifestsDirectory, '.json').filter(
    file => !file.startsWith('$schemas/')
  )) {
    const file = toPosixPath(path.join('manifests', relativeFile))
    scanManifestValue(readJson(path.join(manifestsDirectory, relativeFile)), file, '', candidates)
  }

  return candidates
}

export function findExactEnglishCandidates(projectRoot = process.cwd()): ExactEnglishCandidate[] {
  return [
    ...findMessageExactEnglishCandidates(projectRoot),
    ...findContentExactEnglishCandidates(projectRoot),
    ...findManifestExactEnglishCandidates(projectRoot),
  ].sort((left, right) => left.id.localeCompare(right.id))
}

export function readExactEnglishBaseline(projectRoot = process.cwd()): ExactEnglishBaseline {
  const baselinePath = path.join(projectRoot, 'scripts/validate/i18n-exact-english-baseline.json')
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as ExactEnglishBaseline

  if (baseline.version !== 1 || typeof baseline.allowedExactEnglish !== 'object') {
    throw new Error(`Invalid exact-English baseline: ${baselinePath}`)
  }

  return baseline
}

export function findNewExactEnglishCandidates(
  projectRoot = process.cwd()
): ExactEnglishCandidate[] {
  const baseline = readExactEnglishBaseline(projectRoot)

  return findExactEnglishCandidates(projectRoot).filter(
    candidate => baseline.allowedExactEnglish[candidate.id] !== candidate.value
  )
}

export function findStaleExactEnglishBaselineEntries(
  projectRoot = process.cwd()
): ExactEnglishBaselineEntry[] {
  const baseline = readExactEnglishBaseline(projectRoot)
  const currentCandidates = new Map(
    findExactEnglishCandidates(projectRoot).map(candidate => [candidate.id, candidate.value])
  )

  return Object.entries(baseline.allowedExactEnglish)
    .filter(([id, value]) => currentCandidates.get(id) !== value)
    .map(([id, value]) => ({ id, value }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

export function writeExactEnglishBaseline(projectRoot = process.cwd()): ExactEnglishCandidate[] {
  const candidates = findExactEnglishCandidates(projectRoot)
  const allowedExactEnglish = Object.fromEntries(
    candidates.map(candidate => [candidate.id, candidate.value])
  )
  const baseline: ExactEnglishBaseline = {
    version: 1,
    allowedExactEnglish,
  }
  const baselinePath = path.join(projectRoot, 'scripts/validate/i18n-exact-english-baseline.json')

  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
  return candidates
}

export function summarizeExactEnglishCandidates(
  candidates: ExactEnglishCandidate[]
): Record<I18nResourceKind | 'total', number> {
  return candidates.reduce(
    (summary, candidate) => {
      summary[candidate.resource] += 1
      summary.total += 1
      return summary
    },
    { messages: 0, content: 0, manifest: 0, total: 0 }
  )
}

export function formatExactEnglishCandidates(candidates: ExactEnglishCandidate[]): string {
  return candidates
    .map(
      candidate =>
        `- [${candidate.resource}] ${candidate.file}#${candidate.key} (${candidate.locale}): ${JSON.stringify(candidate.value)}`
    )
    .join('\n')
}

export function formatExactEnglishBaselineEntries(entries: ExactEnglishBaselineEntry[]): string {
  return entries.map(entry => `- ${entry.id}: ${JSON.stringify(entry.value)}`).join('\n')
}
