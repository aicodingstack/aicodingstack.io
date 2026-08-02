import { describe, expect, it } from 'vitest'
import { buildOffersSchema } from '@/lib/metadata/schemas'

describe('structured pricing offers', () => {
  it('keeps a published free tier while omitting unknown and usage-based prices', () => {
    expect(
      buildOffersSchema([
        { name: 'Free', value: 0, currency: 'USD', per: 'month' },
        { name: 'API Key', value: null, currency: null, per: 'usage-based' },
        { name: 'Enterprise', value: null, currency: null, per: 'custom' },
      ])
    ).toEqual({
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })
  })

  it('returns no offer when no numeric price is published', () => {
    expect(
      buildOffersSchema([
        { name: 'API Key', value: null, per: 'usage-based' },
        { name: 'Enterprise', value: null, per: 'custom' },
      ])
    ).toBeUndefined()
  })
})
