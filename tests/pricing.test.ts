import { describe, expect, it } from 'vitest'
import { getPricingSummary, type PricingTier } from '@/lib/pricing'

describe('product pricing summaries', () => {
  it('selects the lowest and highest published numeric prices', () => {
    const pricing: PricingTier[] = [
      { name: 'Free', value: 0, currency: 'USD', per: 'month', category: 'Individual' },
      { name: 'Pro', value: 20, currency: 'USD', per: 'month', category: 'Individual' },
      { name: 'Max', value: 200, currency: 'USD', per: 'month', category: 'Individual' },
      {
        name: 'Enterprise',
        value: null,
        currency: null,
        per: 'custom',
        category: 'Enterprise',
      },
    ]

    expect(getPricingSummary(pricing, 'min')).toEqual({ kind: 'numeric', tier: pricing[1] })
    expect(getPricingSummary(pricing, 'max')).toEqual({ kind: 'numeric', tier: pricing[2] })
  })

  it('distinguishes usage-based, custom, free-only, and unavailable pricing', () => {
    expect(
      getPricingSummary(
        [
          { name: 'Free', value: 0, currency: null, per: null, category: 'Individual' },
          {
            name: 'Usage',
            value: null,
            currency: 'USD',
            per: 'usage-based',
            category: 'Individual',
          },
        ],
        'min'
      )
    ).toEqual({ kind: 'usage-based' })
    expect(
      getPricingSummary(
        [{ name: 'Enterprise', value: null, per: 'custom', category: 'Enterprise' }],
        'max'
      )
    ).toEqual({ kind: 'custom' })
    expect(
      getPricingSummary([{ name: 'Open Source', value: 0, category: 'Individual' }], 'max')
    ).toEqual({ kind: 'free-only' })
    expect(getPricingSummary([], 'min')).toEqual({ kind: 'not-available' })
  })
})
