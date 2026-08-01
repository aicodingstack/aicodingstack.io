import { describe, expect, it } from 'vitest'
import {
  convertTokenRate,
  formatModelTokenRate,
  formatPrimaryTokenRate,
  formatReferenceTokenRate,
  getPrimaryTokenPricingOffer,
  getPrimaryTokenRate,
  getPrimaryTokenRateRange,
  hasCurrentSingleTierPricing,
  hasTieredTokenPricing,
} from '@/lib/model-pricing'
import type { ManifestReferenceTokenPricing, ManifestTokenPricing } from '@/types/manifests'

const tieredPricing: ManifestTokenPricing = {
  status: 'available',
  primaryOffer: 'cn-standard',
  offers: [
    {
      id: 'global-standard',
      currency: 'USD',
      region: 'global',
      serviceTier: 'standard',
      effectiveFrom: null,
      effectiveTo: null,
      tiers: [
        {
          condition: null,
          rates: { input: 1, output: 5, cacheRead: null, cacheWrite: null },
        },
      ],
    },
    {
      id: 'cn-standard',
      currency: 'CNY',
      region: 'CN',
      serviceTier: 'standard',
      effectiveFrom: '2026-07-01',
      effectiveTo: null,
      tiers: [
        {
          condition: { metric: 'inputTokens', min: 1, max: 128000 },
          rates: { input: 0.8, output: 4.8, cacheRead: null, cacheWrite: null },
        },
        {
          condition: { metric: 'inputTokens', min: 128001, max: 256000 },
          rates: { input: 2, output: 12, cacheRead: null, cacheWrite: null },
        },
      ],
    },
  ],
}

describe('model pricing', () => {
  it('uses the declared primary offer and its first tier', () => {
    expect(getPrimaryTokenPricingOffer(tieredPricing)?.id).toBe('cn-standard')
    expect(getPrimaryTokenRate(tieredPricing, 'input')).toBe(0.8)
  })

  it('summarizes tiered rates in the offer native currency', () => {
    expect(getPrimaryTokenRateRange(tieredPricing, 'output')).toEqual({ min: 4.8, max: 12 })
    expect(formatPrimaryTokenRate(tieredPricing, 'output', 'zh-CN')).toBe('¥4.80–¥12.00')
    expect(hasTieredTokenPricing(tieredPricing)).toBe(true)
    expect(hasCurrentSingleTierPricing(tieredPricing)).toBe(false)
  })

  it('does not expose unavailable or ended prices as current prices', () => {
    const unavailable: ManifestTokenPricing = {
      status: 'unavailable',
      reason: 'official-price-not-published',
      primaryOffer: null,
      offers: [],
    }
    const ended: ManifestTokenPricing = {
      status: 'available',
      primaryOffer: 'historical',
      offers: [
        {
          id: 'historical',
          currency: 'USD',
          region: 'global',
          serviceTier: 'standard',
          effectiveFrom: null,
          effectiveTo: '2026-05-25',
          tiers: [
            {
              condition: null,
              rates: { input: 0.6, output: 2.5, cacheRead: null, cacheWrite: null },
            },
          ],
        },
      ],
    }

    expect(getPrimaryTokenPricingOffer(unavailable)).toBeNull()
    expect(formatPrimaryTokenRate(unavailable, 'input', 'en')).toBeNull()
    expect(hasCurrentSingleTierPricing(ended)).toBe(false)
  })

  it('converts between USD and CNY without mutating native prices', () => {
    const conversion = { targetCurrency: 'CNY' as const, usdToCny: 6.7669 }

    expect(convertTokenRate(1, 'USD', conversion)).toEqual({
      value: 6.7669,
      currency: 'CNY',
      converted: true,
    })
    expect(convertTokenRate(1, 'CNY', conversion)).toEqual({
      value: 1,
      currency: 'CNY',
      converted: false,
    })
  })

  it('falls back to externally tracked reference pricing without replacing official pricing', () => {
    const unavailable: ManifestTokenPricing = {
      status: 'unavailable',
      reason: 'official-price-not-published',
      primaryOffer: null,
      offers: [],
    }
    const reference: ManifestReferenceTokenPricing = {
      currency: 'USD',
      basis: 'provider-median',
      rates: { input: 0.7, output: 2.5, cacheRead: null, cacheWrite: null },
      source: {
        name: 'Models.dev provider median',
        url: 'https://models.dev/api.json',
        observedAt: '2026-07-31',
      },
    }

    expect(formatReferenceTokenRate(reference, 'input', 'en')).toBe('≈$0.70')
    expect(
      formatModelTokenRate(
        { tokenPricing: unavailable, referenceTokenPricing: reference },
        'output',
        'en'
      )
    ).toBe('≈$2.50')
  })
})
