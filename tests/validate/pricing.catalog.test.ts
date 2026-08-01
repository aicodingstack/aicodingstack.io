import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'
import type { ManifestPricingPeriod } from '@/types/manifests'

type PricingTier = {
  name: string
  value: number | null
  currency?: string | null
  per?: ManifestPricingPeriod | null
}

type ProductManifest = {
  id: string
  pricing?: PricingTier[]
}

type CatalogPricingTier = PricingTier & {
  catalog: string
  productId: string
}

const productCatalogs = ['clis', 'desktops', 'extensions', 'ides'] as const
const numericPeriods = new Set<ManifestPricingPeriod>([
  'month',
  'user/month',
  'year',
  'hour',
  'credit',
])
const nonNumericPricingStates = new Set<ManifestPricingPeriod>([
  'usage-based',
  'subscription',
  'custom',
])

function loadPricingTiers(): CatalogPricingTier[] {
  return productCatalogs.flatMap(catalog => {
    const catalogDir = path.join(process.cwd(), 'manifests', catalog)

    return fs
      .readdirSync(catalogDir)
      .filter(file => file.endsWith('.json'))
      .flatMap(file => {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(catalogDir, file), 'utf8')
        ) as ProductManifest

        return (manifest.pricing ?? []).map(tier => ({
          ...tier,
          catalog,
          productId: manifest.id,
        }))
      })
  })
}

function identify(tier: CatalogPricingTier): string {
  return `${tier.catalog}/${tier.productId}:${tier.name}`
}

describe('validate: product pricing metadata', () => {
  it('uses a numeric billing unit for every positive published price', () => {
    const failures = loadPricingTiers()
      .filter(
        tier =>
          tier.value !== null &&
          tier.value > 0 &&
          (!tier.currency || !tier.per || !numericPeriods.has(tier.per))
      )
      .map(identify)
      .sort()

    expect(failures).toEqual([])
  })

  it('uses a non-numeric pricing state only when no numeric price is published', () => {
    const failures = loadPricingTiers()
      .filter(tier => {
        if (tier.value === null) {
          return !tier.per || !nonNumericPricingStates.has(tier.per)
        }

        return tier.per ? nonNumericPricingStates.has(tier.per) : false
      })
      .map(identify)
      .sort()

    expect(failures).toEqual([])
  })

  it('keeps trial duration and other plan details out of the billing unit', () => {
    const failures = loadPricingTiers()
      .filter(
        tier => tier.per && !numericPeriods.has(tier.per) && !nonNumericPricingStates.has(tier.per)
      )
      .map(identify)
      .sort()

    expect(failures).toEqual([])
  })
})
