#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MANIFEST_CATEGORIES = [
  'ides',
  'clis',
  'extensions',
  'models',
  'providers',
  'vendors',
] as const

type ManifestCategory = (typeof MANIFEST_CATEGORIES)[number]
type ChangeType = 'added' | 'updated' | 'removed'

export interface ManifestChange {
  category: ManifestCategory
  id: string
  change: ChangeType
  fields: string[]
}

interface ChangelogEntry {
  id: string
  date: string
  summary: string
  changes: ManifestChange[]
}

interface ChangelogFile {
  version: 1
  entries: ChangelogEntry[]
}

function comparableFields(record: Record<string, unknown> | null): string[] {
  return record
    ? Object.keys(record)
        .filter(key => key !== '$schema')
        .sort()
    : []
}

export function createManifestChange(
  category: ManifestCategory,
  id: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): ManifestChange | null {
  if (!before && !after) return null
  if (!before) return { category, id, change: 'added', fields: comparableFields(after) }
  if (!after) return { category, id, change: 'removed', fields: comparableFields(before) }

  const fields = [...new Set([...comparableFields(before), ...comparableFields(after)])].filter(
    key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
  )
  return fields.length > 0 ? { category, id, change: 'updated', fields } : null
}

function runGit(rootDir: string, args: string[]): string {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim()
}

function readBaseManifest(
  rootDir: string,
  base: string,
  filePath: string
): Record<string, unknown> | null {
  try {
    return JSON.parse(runGit(rootDir, ['show', `${base}:${filePath}`])) as Record<string, unknown>
  } catch {
    return null
  }
}

function readWorkingManifest(rootDir: string, filePath: string): Record<string, unknown> | null {
  const absolutePath = path.join(rootDir, filePath)
  return fs.existsSync(absolutePath)
    ? (JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as Record<string, unknown>)
    : null
}

function parseManifestPath(filePath: string): { category: ManifestCategory; id: string } | null {
  const match = /^manifests\/([^/]+)\/([^/]+)\.json$/.exec(filePath)
  if (!match || !MANIFEST_CATEGORIES.includes(match[1] as ManifestCategory)) return null
  return { category: match[1] as ManifestCategory, id: match[2]! }
}

export function collectManifestChanges(rootDir: string, base: string): ManifestChange[] {
  const manifestPaths = MANIFEST_CATEGORIES.map(category => `manifests/${category}`)
  const trackedOutput = runGit(rootDir, [
    'diff',
    '--name-status',
    '--find-renames',
    base,
    '--',
    ...manifestPaths,
  ])
  const untrackedOutput = runGit(rootDir, [
    'ls-files',
    '--others',
    '--exclude-standard',
    '--',
    ...manifestPaths,
  ])
  const lines = [
    ...(trackedOutput ? trackedOutput.split('\n') : []),
    ...(untrackedOutput ? untrackedOutput.split('\n').map(filePath => `A\t${filePath}`) : []),
  ]
  if (lines.length === 0) return []

  const changes: ManifestChange[] = []
  for (const line of lines) {
    const [status = '', firstPath, secondPath] = line.split('\t')
    const paths = status.startsWith('R') ? [firstPath, secondPath] : [firstPath]
    for (const filePath of paths.filter((value): value is string => Boolean(value))) {
      const parsed = parseManifestPath(filePath)
      if (!parsed) continue
      const before =
        status.startsWith('A') || (status.startsWith('R') && filePath === secondPath)
          ? null
          : readBaseManifest(rootDir, base, filePath)
      const after =
        status.startsWith('D') || (status.startsWith('R') && filePath === firstPath)
          ? null
          : readWorkingManifest(rootDir, filePath)
      const change = createManifestChange(parsed.category, parsed.id, before, after)
      if (change) changes.push(change)
    }
  }

  return changes.sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      a.id.localeCompare(b.id) ||
      a.change.localeCompare(b.change)
  )
}

function parseChangelog(content: string): ChangelogFile {
  const parsed = JSON.parse(content) as Partial<ChangelogFile>
  if (parsed.version === undefined && Object.keys(parsed).length === 0) {
    return { version: 1, entries: [] }
  }
  if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error('data/changelogs.json must contain version 1 and an entries array')
  }
  return parsed as ChangelogFile
}

function readChangelog(filePath: string): ChangelogFile {
  return parseChangelog(fs.readFileSync(filePath, 'utf8'))
}

function readBaseChangelog(rootDir: string, base: string): ChangelogFile {
  try {
    return parseChangelog(runGit(rootDir, ['show', `${base}:data/changelogs.json`]))
  } catch {
    return { version: 1, entries: [] }
  }
}

function changesMatch(left: ManifestChange, right: ManifestChange): boolean {
  return (
    left.category === right.category &&
    left.id === right.id &&
    left.change === right.change &&
    JSON.stringify(left.fields) === JSON.stringify(right.fields)
  )
}

function validateChangelog(changelog: ChangelogFile): void {
  const entryIds = new Set<string>()
  for (const entry of changelog.entries) {
    if (!entry.id || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !entry.summary) {
      throw new Error(`Invalid changelog entry: ${entry.id || '(missing id)'}`)
    }
    if (entryIds.has(entry.id)) throw new Error(`Duplicate changelog entry id: ${entry.id}`)
    entryIds.add(entry.id)
    if (!Array.isArray(entry.changes) || entry.changes.length === 0) {
      throw new Error(`Changelog entry has no manifest changes: ${entry.id}`)
    }
  }
}

function getArgument(name: string): string | null {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) ?? null
}

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const changelogPath = path.join(rootDir, 'data', 'changelogs.json')
  const base = getArgument('base') ?? process.env.CHANGELOG_BASE ?? 'origin/main'
  const date = getArgument('date') ?? new Date().toISOString().slice(0, 10)
  const id = getArgument('id') ?? `${date}-manifest-update`
  const changes = collectManifestChanges(rootDir, base)
  const summary =
    getArgument('summary') ??
    `${changes.length} manifest record${changes.length === 1 ? '' : 's'} changed`
  const changelog = readChangelog(changelogPath)

  if (process.argv.includes('--write')) {
    if (changes.length === 0) throw new Error(`No manifest changes found relative to ${base}`)
    const entry: ChangelogEntry = {
      id,
      date,
      summary,
      changes,
    }
    changelog.entries = [...changelog.entries.filter(existing => existing.id !== id), entry].sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    )
    fs.writeFileSync(changelogPath, `${JSON.stringify(changelog, null, 2)}\n`, 'utf8')
    execFileSync('npx', ['biome', 'format', '--write', changelogPath], {
      cwd: rootDir,
      stdio: 'ignore',
    })
    console.log(`Wrote ${changes.length} manifest changes to data/changelogs.json`)
  }

  validateChangelog(changelog)

  if (process.argv.includes('--check') && changes.length > 0) {
    try {
      execFileSync('git', ['diff', '--quiet', base, '--', 'data/changelogs.json'], { cwd: rootDir })
      throw new Error('Manifest changes require an update to data/changelogs.json')
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Manifest changes require'))
        throw error
    }

    const baseChangelog = readBaseChangelog(rootDir, base)
    const changedEntries = changelog.entries.filter(entry => {
      const previous = baseChangelog.entries.find(candidate => candidate.id === entry.id)
      return !previous || JSON.stringify(previous) !== JSON.stringify(entry)
    })
    const missing = changes.filter(
      change =>
        !changedEntries.some(entry => entry.changes.some(saved => changesMatch(change, saved)))
    )
    if (missing.length > 0) {
      throw new Error(
        `Changelog is missing manifest changes: ${missing.map(change => `${change.category}/${change.id}`).join(', ')}`
      )
    }
  }

  console.log(
    `Changelog valid: ${changelog.entries.length} entries; ${changes.length} manifest changes relative to ${base}`
  )
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
