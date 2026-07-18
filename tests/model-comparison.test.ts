import { describe, expect, it } from 'vitest'

import { buildModelComparisonPath, normalizeModelComparisonIds } from '../src/lib/model-comparison'

describe('model comparison selection', () => {
  const validIds = new Set(['alpha', 'beta', 'gamma'])

  it('keeps two unique valid models and replaces the oldest selection', () => {
    expect(normalizeModelComparisonIds(['alpha', 'beta', 'gamma'], validIds)).toEqual([
      'beta',
      'gamma',
    ])
    expect(normalizeModelComparisonIds(['alpha', 'alpha', 'missing'], validIds)).toEqual(['alpha'])
  })

  it('builds the canonical selector and pair paths', () => {
    expect(buildModelComparisonPath([])).toBe('/models/compare')
    expect(buildModelComparisonPath(['alpha'])).toBe('/models/compare')
    expect(buildModelComparisonPath(['alpha', 'beta'])).toBe('/models/compare/alpha-vs-beta')
  })
})
