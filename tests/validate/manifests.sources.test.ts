import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const MANIFEST_CATEGORIES = [
  'clis',
  'desktops',
  'ides',
  'extensions',
  'models',
  'providers',
  'vendors',
] as const

interface ManifestSourceRecord {
  fields?: string[]
}

interface ManifestRecord {
  id?: string
  sources?: ManifestSourceRecord[]
  [key: string]: unknown
}

function sourceFieldExists(manifest: ManifestRecord, fieldPath: string): boolean {
  let value: unknown = manifest

  for (const segment of fieldPath.split('.')) {
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, segment)) {
      return false
    }
    value = (value as Record<string, unknown>)[segment]
  }

  return true
}

describe('manifest source field paths', () => {
  it('resolves every declared source field to the manifest it supports', () => {
    const failures: string[] = []

    for (const category of MANIFEST_CATEGORIES) {
      const directory = path.join(process.cwd(), 'manifests', category)
      const files = fs
        .readdirSync(directory)
        .filter(file => file.endsWith('.json'))
        .sort()

      for (const file of files) {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(directory, file), 'utf8')
        ) as ManifestRecord

        manifest.sources?.forEach((source, sourceIndex) => {
          source.fields?.forEach(fieldPath => {
            if (!sourceFieldExists(manifest, fieldPath)) {
              failures.push(
                `${category}/${file} sources[${sourceIndex}].fields references missing path "${fieldPath}"`
              )
            }
          })
        })
      }
    }

    expect(failures).toEqual([])
  })

  it('accepts nested and null fields but rejects misspelled paths', () => {
    const manifest: ManifestRecord = {
      pricing: [],
      resourceUrls: { pricing: null },
    }
    const misspelledPricing = 'pricing'.replace('i', '')

    expect(sourceFieldExists(manifest, 'pricing')).toBe(true)
    expect(sourceFieldExists(manifest, 'resourceUrls.pricing')).toBe(true)
    expect(sourceFieldExists(manifest, misspelledPricing)).toBe(false)
    expect(sourceFieldExists(manifest, `resourceUrls.${misspelledPricing}`)).toBe(false)
  })
})
