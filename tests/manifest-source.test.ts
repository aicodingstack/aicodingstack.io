import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getManifestEditUrl, type ManifestCategory } from '@/lib/manifest-source'

const categories: Array<[ManifestCategory, string]> = [
  ['IDE', 'ides'],
  ['CLI', 'clis'],
  ['DESKTOP', 'desktops'],
  ['EXTENSION', 'extensions'],
  ['MODEL', 'models'],
  ['PROVIDER', 'providers'],
  ['VENDOR', 'vendors'],
]

describe('manifest source links', () => {
  it.each(categories)(
    'opens every %s manifest in the matching GitHub directory',
    (category, directory) => {
      const manifestFiles = fs
        .readdirSync(path.join(process.cwd(), 'manifests', directory))
        .filter(file => file.endsWith('.json'))

      expect(manifestFiles.length).toBeGreaterThan(0)

      for (const file of manifestFiles) {
        const manifestId = path.basename(file, '.json')
        expect(getManifestEditUrl(category, manifestId)).toBe(
          `https://github.com/aicodingstack/aicodingstack.io/edit/main/manifests/${directory}/${manifestId}.json`
        )
      }
    }
  )
})
