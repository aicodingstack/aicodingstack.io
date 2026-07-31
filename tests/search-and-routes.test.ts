import { describe, expect, it } from 'vitest'
import {
  buildManifestPath,
  getAllCategories,
  getAllManifests,
  getCategoryRouteBase,
} from '@/lib/manifest-registry'
import { search } from '@/lib/search'

describe('manifest route contracts', () => {
  it('maps every category to its public route base', () => {
    expect(
      Object.fromEntries(
        getAllCategories().map(category => [category, getCategoryRouteBase(category)])
      )
    ).toEqual({
      ides: 'ides',
      clis: 'clis',
      desktops: 'desktops',
      extensions: 'extensions',
      models: 'models',
      providers: 'model-providers',
      vendors: 'vendors',
    })
  })

  it('builds a valid detail path for every manifest entry', () => {
    for (const { category, data } of getAllManifests()) {
      expect(buildManifestPath(category, data.id)).toBe(
        `/${getCategoryRouteBase(category)}/${data.id}`
      )
    }
  })

  it('uses the model-provider route for providers', () => {
    expect(buildManifestPath('providers', 'openai')).toBe('/model-providers/openai')
  })
})

describe('search', () => {
  it('returns localized display content and searches localized descriptions', () => {
    const cursor = search('代码生成', 'zh-Hans').find(result => result.id === 'cursor')

    expect(cursor?.category).toBe('ides')
    expect(cursor?.description).toContain('代码生成')
  })

  it('searches vendors and model capabilities', () => {
    expect(search('Anysphere').some(result => result.id === 'cursor')).toBe(true)
    expect(search('structured-outputs').some(result => result.category === 'models')).toBe(true)
  })

  it('searches canonical vendors by alias', () => {
    const results = search('Cline Bot', 'en')

    expect(results.some(result => result.category === 'vendors' && result.id === 'cline')).toBe(
      true
    )
  })

  it('searches curated collection items and links to their page anchor', () => {
    const result = search('CLIProxyAPI', 'en').find(item => item.category === 'collections')

    expect(result?.href).toBe('/curated-collections#tools-productivity-utilities-cliproxyapi')
  })
})
