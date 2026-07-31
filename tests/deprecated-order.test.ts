import { describe, expect, it } from 'vitest'
import { sortDeprecatedLast } from '@/lib/deprecated'

describe('deprecated product ordering', () => {
  it('pins deprecated products after active products', () => {
    const items = [
      { id: 'deprecated-a', deprecated: true },
      { id: 'active-a' },
      { id: 'deprecated-b', deprecated: true },
      { id: 'active-b', deprecated: false },
    ]

    expect(sortDeprecatedLast(items).map(item => item.id)).toEqual([
      'active-a',
      'active-b',
      'deprecated-a',
      'deprecated-b',
    ])
  })

  it('preserves the existing order within each lifecycle group', () => {
    const items = [
      { id: 'active-b' },
      { id: 'active-a' },
      { id: 'deprecated-b', deprecated: true },
      { id: 'deprecated-a', deprecated: true },
    ]

    expect(sortDeprecatedLast(items).map(item => item.id)).toEqual([
      'active-b',
      'active-a',
      'deprecated-b',
      'deprecated-a',
    ])
  })

  it('does not mutate the input array', () => {
    const items = [{ id: 'deprecated', deprecated: true }, { id: 'active' }]

    sortDeprecatedLast(items)

    expect(items.map(item => item.id)).toEqual(['deprecated', 'active'])
  })
})
