import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export interface DuplicateValueGroup {
  value: string
  locations: string[]
}

export interface DuplicateValueBaseline {
  version: 1
  reviewedDuplicateGroups: Record<string, string>
}

export interface DuplicateValueBaselineEntry {
  id: string
  value: string
}

type JsonLeaf = string | number | boolean | null

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

function flattenObject(value: unknown, prefix = '', output = new Map<string, JsonLeaf>()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenObject(item, `${prefix}[${index}]`, output)
    })
    return output
  }

  if (value === null || typeof value !== 'object') {
    if (prefix) output.set(prefix, value as JsonLeaf)
    return output
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key
    flattenObject(nestedValue, keyPath, output)
  }

  return output
}

function listJsonFiles(directory: string, root = directory): string[] {
  if (!fs.existsSync(directory)) return []

  const files: string[] = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...listJsonFiles(absolutePath, root))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(toPosixPath(path.relative(root, absolutePath)))
    }
  }

  return files.sort()
}

function getGroupId(group: DuplicateValueGroup): string {
  return createHash('sha256').update(JSON.stringify(group)).digest('hex').slice(0, 16)
}

export function findDuplicateValueGroups(projectRoot = process.cwd()): DuplicateValueGroup[] {
  const englishDirectory = path.join(projectRoot, 'translations/en')
  const valueLocations = new Map<string, string[]>()

  for (const relativeFile of listJsonFiles(englishDirectory)) {
    const parsed = JSON.parse(
      fs.readFileSync(path.join(englishDirectory, relativeFile), 'utf8')
    ) as unknown

    for (const [key, value] of flattenObject(parsed)) {
      if (typeof value !== 'string') continue

      const locations = valueLocations.get(value) ?? []
      locations.push(`${relativeFile}#${key}`)
      valueLocations.set(value, locations)
    }
  }

  return Array.from(valueLocations.entries())
    .filter(([, locations]) => locations.length > 1)
    .map(([value, locations]) => ({
      value,
      locations: locations.sort(),
    }))
    .sort((left, right) => left.value.localeCompare(right.value))
}

export function readDuplicateValueBaseline(projectRoot = process.cwd()): DuplicateValueBaseline {
  const baselinePath = path.join(
    projectRoot,
    'scripts/validate/i18n-duplicate-values-baseline.json'
  )
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as DuplicateValueBaseline

  if (baseline.version !== 1 || typeof baseline.reviewedDuplicateGroups !== 'object') {
    throw new Error(`Invalid duplicate-value baseline: ${baselinePath}`)
  }

  return baseline
}

export function findNewDuplicateValueGroups(projectRoot = process.cwd()): DuplicateValueGroup[] {
  const baseline = readDuplicateValueBaseline(projectRoot)

  return findDuplicateValueGroups(projectRoot).filter(
    group => baseline.reviewedDuplicateGroups[getGroupId(group)] !== group.value
  )
}

export function findStaleDuplicateValueBaselineEntries(
  projectRoot = process.cwd()
): DuplicateValueBaselineEntry[] {
  const baseline = readDuplicateValueBaseline(projectRoot)
  const currentGroups = new Map(
    findDuplicateValueGroups(projectRoot).map(group => [getGroupId(group), group.value])
  )

  return Object.entries(baseline.reviewedDuplicateGroups)
    .filter(([id, value]) => currentGroups.get(id) !== value)
    .map(([id, value]) => ({ id, value }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

export function writeDuplicateValueBaseline(projectRoot = process.cwd()): DuplicateValueGroup[] {
  const groups = findDuplicateValueGroups(projectRoot)
  const reviewedDuplicateGroups = Object.fromEntries(
    groups.map(group => [getGroupId(group), group.value])
  )
  const baseline: DuplicateValueBaseline = {
    version: 1,
    reviewedDuplicateGroups,
  }
  const baselinePath = path.join(
    projectRoot,
    'scripts/validate/i18n-duplicate-values-baseline.json'
  )

  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
  return groups
}

export function formatDuplicateValueGroups(groups: DuplicateValueGroup[]): string {
  return groups
    .map(group => {
      const locations = group.locations.map(location => `    - ${location}`).join('\n')
      return `- ${JSON.stringify(group.value)}\n${locations}`
    })
    .join('\n')
}

export function formatDuplicateValueBaselineEntries(
  entries: DuplicateValueBaselineEntry[]
): string {
  return entries.map(entry => `- ${entry.id}: ${JSON.stringify(entry.value)}`).join('\n')
}
