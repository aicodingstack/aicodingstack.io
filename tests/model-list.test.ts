import { describe, expect, it } from 'vitest'

import { modelsData } from '../src/lib/generated'
import { groupModelsByLifecycle, sortModelsByReleaseDateDesc } from '../src/lib/model-list'

describe('model list sorting', () => {
  const models = [
    { id: 'undated', name: 'Undated', releaseDate: null },
    { id: 'newer-zulu', name: 'Zulu 2', releaseDate: '2026-07-31' },
    { id: 'older', name: 'Older', releaseDate: '2026-07-24' },
    { id: 'newer-alpha', name: 'Alpha 10', releaseDate: '2026-07-31' },
    { id: 'newer-alpha-2', name: 'Alpha 2', releaseDate: '2026-07-31' },
  ]

  it('orders dated models newest first and leaves undated models last', () => {
    expect(sortModelsByReleaseDateDesc(models).map(model => model.id)).toEqual([
      'newer-alpha-2',
      'newer-alpha',
      'newer-zulu',
      'older',
      'undated',
    ])
  })

  it('does not mutate the generated catalog order', () => {
    const originalOrder = models.map(model => model.id)

    sortModelsByReleaseDateDesc(models)

    expect(models.map(model => model.id)).toEqual(originalOrder)
  })

  it('sorts latest, maintained, and deprecated groups newest first', () => {
    const grouped = groupModelsByLifecycle([
      { id: 'latest-old', name: 'Latest Old', releaseDate: '2026-07-01', lifecycle: 'latest' },
      { id: 'latest-new', name: 'Latest New', releaseDate: '2026-07-31', lifecycle: 'latest' },
      {
        id: 'maintained-old',
        name: 'Maintained Old',
        releaseDate: '2025-01-01',
        lifecycle: 'maintained',
      },
      {
        id: 'maintained-new',
        name: 'Maintained New',
        releaseDate: '2026-01-01',
        lifecycle: 'maintained',
      },
      {
        id: 'deprecated-old',
        name: 'Deprecated Old',
        releaseDate: '2024-01-01',
        lifecycle: 'deprecated',
      },
      {
        id: 'deprecated-new',
        name: 'Deprecated New',
        releaseDate: '2025-01-01',
        lifecycle: 'deprecated',
      },
    ])

    expect(grouped.latest.map(model => model.id)).toEqual(['latest-new', 'latest-old'])
    expect(grouped.maintained.map(model => model.id)).toEqual(['maintained-new', 'maintained-old'])
    expect(grouped.deprecated.map(model => model.id)).toEqual(['deprecated-new', 'deprecated-old'])
  })

  it('keeps Composer generations named consistently and in distinct lifecycle groups', () => {
    expect(
      ['composer', 'cursor-composer-2', 'cursor-composer-2-5'].map(id => {
        const model = modelsData.find(item => item.id === id)
        return [model?.id, model?.name, model?.lifecycle]
      })
    ).toEqual([
      ['composer', 'Composer', 'deprecated'],
      ['cursor-composer-2', 'Composer 2', 'deprecated'],
      ['cursor-composer-2-5', 'Composer 2.5', 'latest'],
    ])
  })

  it('keeps Kimi K2.7 Code maintained while it remains available alongside Kimi K3', () => {
    const model = modelsData.find(item => item.id === 'kimi-k2-7-code')

    expect(model?.lifecycle).toBe('maintained')
  })
})
