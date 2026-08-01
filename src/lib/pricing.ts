// Pricing utility functions

import type { ManifestPricingPeriod } from '@/types/manifests'

export interface PricingTier {
  name: string
  value: number | null
  currency?: string | null
  per?: ManifestPricingPeriod | null
  category: string
}

export type PricingBoundary = 'min' | 'max'

export type PricingSummary =
  | { kind: 'numeric'; tier: PricingTier & { value: number } }
  | { kind: 'free-only' | 'custom' | 'usage-based' | 'not-available' }

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
}

function isUsageBasedTier(tier: PricingTier): boolean {
  return tier.value === null && tier.per === 'usage-based'
}

/**
 * Summarize a product's published pricing without treating custom or usage-based
 * plans as missing data.
 */
export function getPricingSummary(
  pricing: PricingTier[] | null | undefined,
  boundary: PricingBoundary
): PricingSummary {
  if (!pricing || pricing.length === 0) return { kind: 'not-available' }

  const numericPlans = pricing.filter(
    (tier): tier is PricingTier & { value: number } => tier.value !== null && tier.value > 0
  )
  if (numericPlans.length > 0) {
    const targetValue =
      boundary === 'min'
        ? Math.min(...numericPlans.map(tier => tier.value))
        : Math.max(...numericPlans.map(tier => tier.value))
    const tier = numericPlans.find(plan => plan.value === targetValue)
    if (tier) return { kind: 'numeric', tier }
  }

  if (pricing.some(isUsageBasedTier)) return { kind: 'usage-based' }
  if (pricing.some(tier => tier.value === null)) return { kind: 'custom' }
  if (pricing.some(tier => tier.value === 0)) return { kind: 'free-only' }

  return { kind: 'not-available' }
}

/**
 * Format pricing tier for display
 * Examples:
 * - Free -> "Free"
 * - $20/month -> "$20 per month"
 * - $40/user/month -> "$40 per user/month"
 * - Custom -> "Contact sales"
 */
export function formatPrice(tier: PricingTier): string {
  // Free pricing
  if (tier.value === 0) {
    return 'Free'
  }

  // Custom pricing
  if (tier.value === null || tier.per === 'custom') {
    return 'Contact sales'
  }

  // Regular pricing
  const currencySymbol = tier.currency ? CURRENCY_SYMBOLS[tier.currency] || tier.currency : ''
  const perText = tier.per ? ` per ${tier.per}` : ''

  return `${currencySymbol}${tier.value}${perText}`
}
