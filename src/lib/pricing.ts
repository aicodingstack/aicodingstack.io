// Pricing utility functions

export interface PricingTier {
  name: string
  value: number | null
  currency?: string | null
  per?: string | null
  category: string
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
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
