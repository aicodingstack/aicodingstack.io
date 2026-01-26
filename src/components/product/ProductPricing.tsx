import { useTranslations } from 'next-intl'
import { formatPrice, type PricingTier } from '@/lib/pricing'

export interface ProductPricingProps {
  pricing: PricingTier[]
  pricingUrl?: string
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
                {formatPrice(tier as PricingTier)}
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
