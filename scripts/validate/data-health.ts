#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const MANIFEST_CATEGORIES = [
  'ides',
  'clis',
  'desktops',
  'extensions',
  'models',
  'providers',
  'vendors',
] as const

export type ManifestCategory = (typeof MANIFEST_CATEGORIES)[number]
export type IssueSeverity = 'error' | 'warning' | 'info'

const FRESHNESS_THRESHOLDS: Record<ManifestCategory, number> = {
  models: 30,
  providers: 30,
  ides: 60,
  clis: 60,
  desktops: 60,
  extensions: 60,
  vendors: 90,
}

const RELATED_PRODUCT_CATEGORIES: Record<string, ManifestCategory> = {
  ide: 'ides',
  cli: 'clis',
  desktop: 'desktops',
  extension: 'extensions',
}

const BENCHMARK_KEYS = [
  'sweBench',
  'terminalBench',
  'mmmu',
  'mmmuPro',
  'webDevArena',
  'sciCode',
  'liveCodeBench',
] as const

const COMMUNITY_URL_KEYS = [
  'linkedin',
  'twitter',
  'github',
  'youtube',
  'discord',
  'reddit',
  'blog',
] as const

export interface ManifestRecord {
  category: ManifestCategory
  filePath: string
  data: Record<string, unknown>
}

export interface TranslationCatalog {
  locale: string
  values: Record<string, string>
}

export interface DataHealthIssue {
  severity: IssueSeverity
  code: string
  category: ManifestCategory
  id: string
  message: string
}

interface CategoryHealth {
  total: number
  verified: number
  provenanceComplete: number
  stale: number
}

interface TranslationHealth {
  totalStrings: number
  matchingEnglish: number
  matchingEnglishPercent: number
}

export interface DataHealthReport {
  asOf: string
  thresholds: Record<ManifestCategory, number>
  summary: {
    totalRecords: number
    recordsWithSources: number
    verifiedRecords: number
    provenanceComplete: number
    staleVerifiedRecords: number
    translationPlaceholderValues: number
    danglingRelationships: number
    modelBenchmarkCoverage: number
    productsWithPricing: number
    productRecords: number
    communityUrlsPopulated: number
    communityUrlsWithProvenance: number
    duplicatedVendorCommunityUrls: number
    errors: number
    warnings: number
    info: number
  }
  byCategory: Record<ManifestCategory, CategoryHealth>
  translationsByLocale: Record<string, TranslationHealth>
  issues: DataHealthIssue[]
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getId(record: ManifestRecord): string {
  return getString(record.data.id) ?? path.basename(record.filePath, '.json')
}

function hasCompleteProvenance(data: Record<string, unknown>): boolean {
  return (
    Array.isArray(data.sources) &&
    data.sources.length > 0 &&
    Boolean(getString(data.lastVerifiedAt)) &&
    Boolean(getString(data.verifiedBy)) &&
    ['high', 'medium', 'low'].includes(getString(data.confidence) ?? '')
  )
}

function hasSources(data: Record<string, unknown>): boolean {
  return Array.isArray(data.sources) && data.sources.length > 0
}

function getCommunityUrls(data: Record<string, unknown>): Record<string, unknown> | null {
  const communityUrls = data.communityUrls
  return communityUrls && typeof communityUrls === 'object' && !Array.isArray(communityUrls)
    ? (communityUrls as Record<string, unknown>)
    : null
}

function sourceSupportsField(data: Record<string, unknown>, fieldPath: string): boolean {
  return (
    Array.isArray(data.sources) &&
    data.sources.some(source => {
      if (!source || typeof source !== 'object' || Array.isArray(source)) return false
      const fields = (source as Record<string, unknown>).fields
      return (
        !Array.isArray(fields) || fields.includes('communityUrls') || fields.includes(fieldPath)
      )
    })
  )
}

function getVendorIdentityNames(data: Record<string, unknown>): string[] {
  const aliases = Array.isArray(data.aliases)
    ? data.aliases.map(getString).filter((value): value is string => Boolean(value))
    : []
  return [getString(data.id), getString(data.name), ...aliases]
    .filter((value): value is string => Boolean(value))
    .map(value => value.toLocaleLowerCase())
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null
}

function differenceInDays(asOf: Date, date: Date): number {
  return Math.floor((asOf.getTime() - date.getTime()) / 86_400_000)
}

function countBenchmarkCoverage(records: ManifestRecord[]): number {
  let populated = 0
  let possible = 0
  for (const record of records.filter(item => item.category === 'models')) {
    const benchmarks = record.data.benchmarks
    if (!benchmarks || typeof benchmarks !== 'object' || Array.isArray(benchmarks)) continue
    const values = benchmarks as Record<string, unknown>
    for (const key of BENCHMARK_KEYS) {
      possible++
      if (typeof values[key] === 'number') populated++
    }
  }
  return possible === 0 ? 0 : Number(((populated / possible) * 100).toFixed(1))
}

function countPricingCoverage(records: ManifestRecord[]): {
  covered: number
  total: number
} {
  const products = records.filter(record =>
    ['ides', 'clis', 'desktops', 'extensions'].includes(record.category)
  )
  return {
    covered: products.filter(
      record => Array.isArray(record.data.pricing) && record.data.pricing.length > 0
    ).length,
    total: products.length,
  }
}

export function loadManifestRecords(rootDir: string): ManifestRecord[] {
  const records: ManifestRecord[] = []
  for (const category of MANIFEST_CATEGORIES) {
    const directory = path.join(rootDir, 'manifests', category)
    for (const fileName of fs
      .readdirSync(directory)
      .filter(file => file.endsWith('.json'))
      .sort()) {
      const filePath = path.join(directory, fileName)
      records.push({
        category,
        filePath,
        data: JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>,
      })
    }
  }
  return records
}

function flattenStrings(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) =>
      Object.entries(flattenStrings(child, prefix ? `${prefix}.${key}` : key))
    )
  )
}

function listJsonFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listJsonFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.json') ? [entryPath] : []
  })
}

export function loadTranslationCatalogs(rootDir: string): TranslationCatalog[] {
  const translationsDir = path.join(rootDir, 'translations')
  return fs
    .readdirSync(translationsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const localeDir = path.join(translationsDir, entry.name)
      const values = Object.fromEntries(
        listJsonFiles(localeDir).flatMap(filePath => {
          const relativePath = path.relative(localeDir, filePath).replaceAll(path.sep, '/')
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
          return Object.entries(flattenStrings(parsed)).map(([key, value]) => [
            `${relativePath}:${key}`,
            value,
          ])
        })
      )
      return { locale: entry.name, values }
    })
    .sort((a, b) => a.locale.localeCompare(b.locale))
}

export function analyzeDataHealth(
  records: ManifestRecord[],
  asOfInput: string,
  translationCatalogs: TranslationCatalog[] = []
): DataHealthReport {
  const asOf = parseIsoDate(asOfInput)
  if (!asOf) throw new Error(`Invalid --as-of date: ${asOfInput}`)

  const issues: DataHealthIssue[] = []
  const idsByCategory = new Map<ManifestCategory, Set<string>>()
  const byCategory = Object.fromEntries(
    MANIFEST_CATEGORIES.map(category => [
      category,
      { total: 0, verified: 0, provenanceComplete: 0, stale: 0 },
    ])
  ) as Record<ManifestCategory, CategoryHealth>

  for (const category of MANIFEST_CATEGORIES) {
    idsByCategory.set(
      category,
      new Set(records.filter(record => record.category === category).map(getId))
    )
  }

  const vendorsByIdentity = new Map<string, ManifestRecord>()
  for (const vendor of records.filter(record => record.category === 'vendors')) {
    for (const identity of getVendorIdentityNames(vendor.data)) {
      vendorsByIdentity.set(identity, vendor)
    }
  }

  for (const record of records) {
    const id = getId(record)
    const categoryHealth = byCategory[record.category]
    categoryHealth.total++
    const verified = record.data.verified === true
    const provenanceComplete = hasCompleteProvenance(record.data)
    const communityUrls = getCommunityUrls(record.data)
    const vendorName = getString(record.data.vendor)?.toLocaleLowerCase()
    const vendorCommunityUrls = vendorName
      ? getCommunityUrls(vendorsByIdentity.get(vendorName)?.data ?? {})
      : null

    if (!hasSources(record.data)) {
      issues.push({
        severity: 'info',
        code: 'missing-sources',
        category: record.category,
        id,
        message: 'No structured source references are recorded.',
      })
    }

    if (communityUrls) {
      for (const key of COMMUNITY_URL_KEYS) {
        const url = getString(communityUrls[key])
        if (!url) continue

        const fieldPath = `communityUrls.${key}`
        if (!sourceSupportsField(record.data, fieldPath)) {
          issues.push({
            severity: 'warning',
            code: 'community-url-without-provenance',
            category: record.category,
            id,
            message: `${fieldPath} has no matching structured source.`,
          })
        }

        if (url === getString(vendorCommunityUrls?.[key])) {
          issues.push({
            severity: 'warning',
            code: 'duplicated-vendor-community-url',
            category: record.category,
            id,
            message: `${fieldPath} duplicates the vendor URL; inherit it at read time instead.`,
          })
        }
      }
    }

    if (verified) {
      categoryHealth.verified++
      if (provenanceComplete) categoryHealth.provenanceComplete++
      else {
        issues.push({
          severity: 'warning',
          code: 'verified-without-provenance',
          category: record.category,
          id,
          message: 'Verified record is missing sources, review date, reviewer, or confidence.',
        })
      }
    }

    const lastVerifiedAt = getString(record.data.lastVerifiedAt)
    if (lastVerifiedAt) {
      const verifiedDate = parseIsoDate(lastVerifiedAt)
      if (!verifiedDate) {
        issues.push({
          severity: 'error',
          code: 'invalid-verification-date',
          category: record.category,
          id,
          message: `lastVerifiedAt is not a valid date: ${lastVerifiedAt}`,
        })
      } else {
        const age = differenceInDays(asOf, verifiedDate)
        if (age < 0) {
          issues.push({
            severity: 'error',
            code: 'future-verification-date',
            category: record.category,
            id,
            message: `lastVerifiedAt is ${Math.abs(age)} days after the report date.`,
          })
        } else if (verified && age > FRESHNESS_THRESHOLDS[record.category]) {
          categoryHealth.stale++
          issues.push({
            severity: 'warning',
            code: 'stale-verification',
            category: record.category,
            id,
            message: `Last reviewed ${age} days ago; threshold is ${FRESHNESS_THRESHOLDS[record.category]} days.`,
          })
        }
      }
    }

    const relatedProducts = record.data.relatedProducts
    if (Array.isArray(relatedProducts)) {
      for (const relation of relatedProducts) {
        if (!relation || typeof relation !== 'object' || Array.isArray(relation)) continue
        const related = relation as Record<string, unknown>
        const targetCategory = RELATED_PRODUCT_CATEGORIES[getString(related.type) ?? '']
        const productId = getString(related.productId)
        if (targetCategory && productId && !idsByCategory.get(targetCategory)?.has(productId)) {
          issues.push({
            severity: 'error',
            code: 'dangling-related-product',
            category: record.category,
            id,
            message: `References missing ${targetCategory}/${productId}.`,
          })
        }
      }
    }
  }

  issues.sort((a, b) => {
    const order: Record<IssueSeverity, number> = { error: 0, warning: 1, info: 2 }
    return (
      order[a.severity] - order[b.severity] ||
      a.code.localeCompare(b.code) ||
      a.category.localeCompare(b.category) ||
      a.id.localeCompare(b.id)
    )
  })

  const english = translationCatalogs.find(catalog => catalog.locale === 'en')?.values ?? {}
  const translationsByLocale = Object.fromEntries(
    translationCatalogs
      .filter(catalog => catalog.locale !== 'en')
      .map(catalog => {
        const comparable = Object.entries(catalog.values).filter(([key]) => key in english)
        const matchingEnglish = comparable.filter(([key, value]) => english[key] === value).length
        return [
          catalog.locale,
          {
            totalStrings: comparable.length,
            matchingEnglish,
            matchingEnglishPercent:
              comparable.length === 0
                ? 0
                : Number(((matchingEnglish / comparable.length) * 100).toFixed(1)),
          },
        ]
      })
  )
  const pricing = countPricingCoverage(records)
  const populatedCommunityUrls = records.flatMap(record => {
    const communityUrls = getCommunityUrls(record.data)
    if (!communityUrls) return []
    return COMMUNITY_URL_KEYS.flatMap(key => {
      const url = getString(communityUrls[key])
      return url ? [{ record, fieldPath: `communityUrls.${key}` }] : []
    })
  })
  return {
    asOf: asOfInput,
    thresholds: { ...FRESHNESS_THRESHOLDS },
    summary: {
      totalRecords: records.length,
      recordsWithSources: records.filter(record => hasSources(record.data)).length,
      verifiedRecords: records.filter(record => record.data.verified === true).length,
      provenanceComplete: records.filter(
        record => record.data.verified === true && hasCompleteProvenance(record.data)
      ).length,
      staleVerifiedRecords: MANIFEST_CATEGORIES.reduce(
        (total, category) => total + byCategory[category].stale,
        0
      ),
      translationPlaceholderValues: Object.values(translationsByLocale).reduce(
        (total, locale) => total + locale.matchingEnglish,
        0
      ),
      danglingRelationships: issues.filter(issue => issue.code === 'dangling-related-product')
        .length,
      modelBenchmarkCoverage: countBenchmarkCoverage(records),
      productsWithPricing: pricing.covered,
      productRecords: pricing.total,
      communityUrlsPopulated: populatedCommunityUrls.length,
      communityUrlsWithProvenance: populatedCommunityUrls.filter(({ record, fieldPath }) =>
        sourceSupportsField(record.data, fieldPath)
      ).length,
      duplicatedVendorCommunityUrls: issues.filter(
        issue => issue.code === 'duplicated-vendor-community-url'
      ).length,
      errors: issues.filter(issue => issue.severity === 'error').length,
      warnings: issues.filter(issue => issue.severity === 'warning').length,
      info: issues.filter(issue => issue.severity === 'info').length,
    },
    byCategory,
    translationsByLocale,
    issues,
  }
}

export function renderDataHealthMarkdown(report: DataHealthReport): string {
  const issueCounts = new Map<string, number>()
  for (const issue of report.issues)
    issueCounts.set(issue.code, (issueCounts.get(issue.code) ?? 0) + 1)

  const categoryRows = MANIFEST_CATEGORIES.map(category => {
    const health = report.byCategory[category]
    return `| ${category} | ${health.total} | ${health.verified} | ${health.provenanceComplete} | ${health.stale} |`
  }).join('\n')
  const translationRows = Object.entries(report.translationsByLocale)
    .map(
      ([locale, health]) =>
        `| ${locale} | ${health.totalStrings} | ${health.matchingEnglish} | ${health.matchingEnglishPercent}% |`
    )
    .join('\n')
  const backlogRows = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code, count]) => `| ${code} | ${count} |`)
    .join('\n')
  const priorityIssues = report.issues
    .filter(issue => issue.severity !== 'info')
    .slice(0, 100)
    .map(
      issue =>
        `| ${issue.severity} | ${issue.code} | ${issue.category}/${issue.id} | ${issue.message.replaceAll('|', '\\|')} |`
    )
    .join('\n')

  return `# Data Health Report

Snapshot date: ${report.asOf}. Regenerate with \`pnpm data-health:report\`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | ${report.summary.totalRecords} |
| Records with structured sources | ${report.summary.recordsWithSources} |
| Verified records | ${report.summary.verifiedRecords} |
| Verified with complete provenance | ${report.summary.provenanceComplete} |
| Stale verified records | ${report.summary.staleVerifiedRecords} |
| Non-English values identical to English | ${report.summary.translationPlaceholderValues} |
| Dangling product relationships | ${report.summary.danglingRelationships} |
| Model benchmark coverage | ${report.summary.modelBenchmarkCoverage}% |
| Products with pricing | ${report.summary.productsWithPricing}/${report.summary.productRecords} |
| Community URLs with provenance | ${report.summary.communityUrlsWithProvenance}/${report.summary.communityUrlsPopulated} |
| Duplicated vendor community URLs | ${report.summary.duplicatedVendorCommunityUrls} |
| Errors / warnings / info | ${report.summary.errors} / ${report.summary.warnings} / ${report.summary.info} |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
${categoryRows}

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
${translationRows || '| None | 0 | 0 | 0% |'}

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
${backlogRows || '| None | 0 |'}

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and \`data/data-health.json\`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
${priorityIssues || '| — | — | — | No priority issues. |'}

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
`
}

function renderConsoleSummary(report: DataHealthReport): string {
  return [
    `Data health as of ${report.asOf}`,
    `Records: ${report.summary.totalRecords}`,
    `Structured sources: ${report.summary.recordsWithSources}/${report.summary.totalRecords}`,
    `Verified provenance: ${report.summary.provenanceComplete}/${report.summary.verifiedRecords}`,
    `English-identical translations: ${report.summary.translationPlaceholderValues}`,
    `Dangling relationships: ${report.summary.danglingRelationships}`,
    `Model benchmark coverage: ${report.summary.modelBenchmarkCoverage}%`,
    `Community URL provenance: ${report.summary.communityUrlsWithProvenance}/${report.summary.communityUrlsPopulated}`,
    `Duplicated vendor community URLs: ${report.summary.duplicatedVendorCommunityUrls}`,
    `Issues: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.info} info`,
  ].join('\n')
}

function getArgument(name: string): string | null {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) ?? null
}

export function shouldFailDataHealth(
  report: DataHealthReport,
  failOn: string,
  failOnCodes: Set<string> = new Set()
): boolean {
  if (!['error', 'warning', 'never'].includes(failOn)) {
    throw new Error(`Invalid --fail-on value: ${failOn}`)
  }
  return (
    (failOn === 'error' && report.summary.errors > 0) ||
    (failOn === 'warning' && report.summary.errors + report.summary.warnings > 0) ||
    report.issues.some(issue => failOnCodes.has(issue.code))
  )
}

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const snapshotPath = path.join(rootDir, 'data', 'data-health.json')
  const markdownPath = path.join(rootDir, 'docs', 'DATA-HEALTH.md')
  const checkSnapshot = process.argv.includes('--check-snapshot')
  const snapshotAsOf = checkSnapshot
    ? getString((JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as Record<string, unknown>).asOf)
    : null
  const asOf = getArgument('as-of') ?? snapshotAsOf ?? new Date().toISOString().slice(0, 10)
  const report = analyzeDataHealth(
    loadManifestRecords(rootDir),
    asOf,
    loadTranslationCatalogs(rootDir)
  )
  console.log(renderConsoleSummary(report))
  const jsonOutput = `${JSON.stringify(report, null, 2)}\n`
  const markdownOutput = renderDataHealthMarkdown(report)

  if (process.argv.includes('--write')) {
    fs.writeFileSync(snapshotPath, jsonOutput, 'utf8')
    fs.writeFileSync(markdownPath, markdownOutput, 'utf8')
    console.log('Wrote data/data-health.json and docs/DATA-HEALTH.md')
  }

  if (
    checkSnapshot &&
    (fs.readFileSync(snapshotPath, 'utf8') !== jsonOutput ||
      fs.readFileSync(markdownPath, 'utf8') !== markdownOutput)
  ) {
    throw new Error('Data-health snapshot is stale; run pnpm data-health:report')
  }

  const failOn = getArgument('fail-on') ?? 'never'
  const failOnCodes = new Set(
    (getArgument('fail-on-code') ?? '')
      .split(',')
      .map(code => code.trim())
      .filter(Boolean)
  )
  if (shouldFailDataHealth(report, failOn, failOnCodes)) {
    process.exitCode = 1
  }
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
