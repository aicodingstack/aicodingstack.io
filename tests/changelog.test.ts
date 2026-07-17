import { describe, expect, it } from 'vitest'

import { createManifestChange } from '../scripts/validate/changelog'

describe('manifest changelog generation', () => {
  it('captures added and removed records', () => {
    expect(
      createManifestChange('models', 'new-model', null, { id: 'new-model', name: 'New' })
    ).toEqual({
      category: 'models',
      id: 'new-model',
      change: 'added',
      fields: ['id', 'name'],
    })
    expect(createManifestChange('providers', 'old', { id: 'old' }, null)).toEqual({
      category: 'providers',
      id: 'old',
      change: 'removed',
      fields: ['id'],
    })
  })

  it('reports only changed top-level fields', () => {
    expect(
      createManifestChange(
        'models',
        'example',
        { $schema: 'old', id: 'example', name: 'Before', verified: false },
        { $schema: 'new', id: 'example', name: 'After', verified: true }
      )
    ).toEqual({
      category: 'models',
      id: 'example',
      change: 'updated',
      fields: ['name', 'verified'],
    })
  })

  it('ignores records without material changes', () => {
    expect(createManifestChange('vendors', 'same', { id: 'same' }, { id: 'same' })).toBeNull()
  })
})
