import { useLocale, useTranslations } from 'next-intl'
import { getPricingSummary, type PricingBoundary, type PricingTier } from '@/lib/pricing'

export interface ProductPricingProps {
  pricing: PricingTier[]
  pricingUrl?: string
}

type PricingSummaryValueProps = {
  pricing: PricingTier[] | null | undefined
  boundary: PricingBoundary
}

function NumericPricingValue({ tier }: { tier: PricingTier & { value: number } }) {
  const locale = useLocale()
  const tComponent = useTranslations('components.product')
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: tier.currency ?? 'USD',
    maximumFractionDigits: 2,
  }).format(tier.value)

  switch (tier.per?.toLowerCase()) {
    case 'month':
      return tComponent('productPricing.perMonth', { price })
    case 'user/month':
      return tComponent('productPricing.perUserMonth', { price })
    case 'year':
      return tComponent('productPricing.perYear', { price })
    case 'hour':
      return tComponent('productPricing.perHour', { price })
    case 'credit':
      return tComponent('productPricing.perCredit', { price })
    default:
      return price
  }
}

export function PricingSummaryValue({ pricing, boundary }: PricingSummaryValueProps) {
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')
  const summary = getPricingSummary(pricing, boundary)

  if (summary.kind === 'numeric') return <NumericPricingValue tier={summary.tier} />
  if (summary.kind === 'usage-based') return tComponent('productPricing.usageBased')
  if (summary.kind === 'custom') return tComponent('productPricing.custom')
  if (summary.kind === 'free-only') return tComponent('productPricing.freeOnly')
  return tShared('modelPricing.notAvailable')
}

function PricingTierValue({ tier }: { tier: PricingTier }) {
  const tComponent = useTranslations('components.product')

  if (tier.value === 0) return tComponent('productPricing.free')
  if (tier.value === null) {
    const summary = getPricingSummary([tier], 'min')
    return summary.kind === 'usage-based'
      ? tComponent('productPricing.usageBased')
      : tComponent('productPricing.custom')
  }

  return <NumericPricingValue tier={tier as PricingTier & { value: number }} />
}

export function ProductPricing({ pricing, pricingUrl }: ProductPricingProps) {
  const tShared = useTranslations('shared')

  if (!pricing || pricing.length === 0) {
    return null
  }

  return (
    <section className="py-[var(--spacing-xl)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-md)]">
          {tShared('terms.pricing')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)] mt-[var(--spacing-xl)]">
          {pricing.map(tier => (
            <div
              key={tier.name}
              className="border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all"
            >
              <div className="mb-[var(--spacing-sm)]">
                {tier.category && (
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                    {tier.category}
                  </p>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{tier.name}</h3>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                <PricingTierValue tier={tier} />
              </p>
            </div>
          ))}
        </div>

        {pricingUrl && (
          <div className="mt-[var(--spacing-md)] text-center">
            <a
              href={pricingUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {tShared('actions.viewFullDetails')}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
