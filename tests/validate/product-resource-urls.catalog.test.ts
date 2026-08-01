import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const productCatalogs = ['clis', 'desktops', 'extensions', 'ides'] as const

interface ProductManifest {
  id?: string
  resourceUrls?: Record<string, unknown>
  sources?: Array<{ fields?: string[] }>
}

describe('validate: product resource URLs', () => {
  it('does not restore the retired MCP resource field or provenance path', () => {
    const violations: string[] = []

    for (const catalog of productCatalogs) {
      const catalogDir = path.join(process.cwd(), 'manifests', catalog)

      for (const file of fs.readdirSync(catalogDir).filter(name => name.endsWith('.json'))) {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(catalogDir, file), 'utf8')
        ) as ProductManifest
        const manifestPath = `${catalog}/${file}`

        if (manifest.resourceUrls && 'mcp' in manifest.resourceUrls) {
          violations.push(`${manifestPath}: resourceUrls.mcp`)
        }

        manifest.sources?.forEach((source, index) => {
          if (source.fields?.includes('resourceUrls.mcp')) {
            violations.push(`${manifestPath}: sources[${index}].fields`)
          }
        })
      }
    }

    expect(violations).toEqual([])
  })
})
