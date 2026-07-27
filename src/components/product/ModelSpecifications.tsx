'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCurrency } from '@/components/CurrencyProvider'
import { formatTokenCount } from '@/lib/format'
import { convertTokenRate, formatTokenRate, isTokenPricingAvailable } from '@/lib/model-pricing'
import type {
  ManifestModel,
  ManifestTokenPricingCondition,
  ManifestTokenPricingReason,
} from '@/types/manifests'

export interface ModelSpecificationsProps {
  model: Pick<ManifestModel, 'size' | 'contextWindow' | 'maxOutput' | 'tokenPricing' | 'lifecycle'>
}

const reasonKeys: Record<ManifestTokenPricingReason, string> = {
  'open-weights-only': 'modelPricing.reasons.openWeightsOnly',
  'subscription-only': 'modelPricing.reasons.subscriptionOnly',
  'official-price-not-published': 'modelPricing.reasons.officialPriceNotPublished',
  'historical-price-unverified': 'modelPricing.reasons.historicalPriceUnverified',
  'unsupported-pricing-structure': 'modelPricing.reasons.unsupportedPricingStructure',
}

/**
 * ModelSpecifications Section
 *
 * Displays technical specifications for AI models including size,
 * context window, max output, and token pricing.
 */
export function ModelSpecifications({ model }: ModelSpecificationsProps) {
  const locale = useLocale()
  const tShared = useTranslations('shared')
  const { conversion } = useCurrency()
  const hasContent = model.size || model.contextWindow || model.maxOutput || model.tokenPricing
  const currencyNames = new Intl.DisplayNames(locale, { type: 'currency' })
  const formatCurrencyName = (currency: string) => currencyNames.of(currency) ?? currency

  const formatCondition = (condition: ManifestTokenPricingCondition | null): string | null => {
    if (!condition) return null
    const metric = tShared(`modelPricing.metrics.${condition.metric}`)
    if (condition.min === null && condition.max !== null) {
      return tShared('modelPricing.conditions.upTo', {
        metric,
        max: formatTokenCount(condition.max),
      })
    }
    if (condition.min !== null && condition.max === null) {
      return tShared('modelPricing.conditions.over', {
        metric,
        min: formatTokenCount(condition.min),
      })
    }
    if (condition.min !== null && condition.max !== null) {
      return tShared('modelPricing.conditions.range', {
        metric,
        min: formatTokenCount(condition.min),
        max: formatTokenCount(condition.max),
      })
    }
    return metric
  }

  const rateRows = [
    ['input', tShared('labels.input')],
    ['output', tShared('labels.output')],
    ['cacheRead', tShared('modelPricing.cacheRead')],
    ['cacheWrite', tShared('modelPricing.cacheWrite')],
  ] as const

  if (!hasContent) {
    return null
  }

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          {tShared('labels.specifications')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
          {model.size && (
            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {tShared('terms.modelSize')}
              </h3>
              <p className="text-lg font-semibold tracking-tight">{model.size}</p>
            </div>
          )}

          <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
            <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
              {tShared('labels.totalContext')}
            </h3>
            <p className="text-lg font-semibold tracking-tight">
              {formatTokenCount(model.contextWindow)}
            </p>
          </div>

          {model.maxOutput !== null && (
            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {tShared('terms.maxOutput')}
              </h3>
              <p className="text-lg font-semibold tracking-tight">
                {formatTokenCount(model.maxOutput)}
              </p>
            </div>
          )}

          {model.tokenPricing && (
            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {tShared('terms.pricing')}
              </h3>
              {isTokenPricingAvailable(model.tokenPricing) ? (
                <div className="space-y-[var(--spacing-md)]">
                  {model.tokenPricing.offers.map(offer => {
                    const historical =
                      model.lifecycle === 'deprecated' || offer.effectiveTo !== null
                    const displayCurrency = convertTokenRate(1, offer.currency, conversion).currency
                    return (
                      <div key={offer.id} className="space-y-[var(--spacing-sm)]">
                        <div className="flex flex-wrap gap-x-[var(--spacing-sm)] gap-y-1 text-xs text-[var(--color-text-muted)]">
                          <span>
                            {offer.region === 'global'
                              ? tShared('modelPricing.globalRegion')
                              : offer.region}
                          </span>
                          <span>
                            {offer.currency === displayCurrency
                              ? formatCurrencyName(displayCurrency)
                              : `${formatCurrencyName(offer.currency)} → ${formatCurrencyName(displayCurrency)}`}
                          </span>
                          {historical && <span>{tShared('modelPricing.historical')}</span>}
                          {offer.effectiveTo && (
                            <span>
                              {tShared('modelPricing.ended', {
                                date: new Intl.DateTimeFormat(locale).format(
                                  new Date(`${offer.effectiveTo}T00:00:00Z`)
                                ),
                              })}
                            </span>
                          )}
                        </div>
                        {offer.tiers.map((tier, index) => {
                          const condition = formatCondition(tier.condition)
                          return (
                            <div key={`${offer.id}-${index}`} className="space-y-1">
                              {condition && (
                                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                                  {condition}
                                </p>
                              )}
                              {rateRows.map(([rate, label]) => {
                                const value = tier.rates[rate]
                                if (value === null) return null
                                return (
                                  <p key={rate} className="text-sm">
                                    <span className="text-[var(--color-text-muted)] text-xs">
                                      {label}{' '}
                                    </span>
                                    <span className="font-semibold tracking-tight">
                                      {tShared('modelPricing.perMillionTokens', {
                                        price: formatTokenRate(
                                          value,
                                          offer.currency,
                                          locale,
                                          6,
                                          conversion
                                        ),
                                      })}
                                    </span>
                                  </p>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {tShared(reasonKeys[model.tokenPricing.reason])}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
