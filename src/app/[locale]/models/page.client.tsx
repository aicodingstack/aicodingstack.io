'use client'

import { Check, Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'
import { useModelComparison } from '@/components/controls/useModelComparison'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import StackTabs from '@/components/navigation/StackTabs'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { formatTokenCount } from '@/lib/format'
import { modelsData } from '@/lib/generated'
import { localizeManifestItems } from '@/lib/manifest-i18n'
import { buildModelComparisonPath } from '@/lib/model-comparison'
import { groupModelsByLifecycle } from '@/lib/model-list'
import { formatModelTokenRate } from '@/lib/model-pricing'
import type { ManifestModel } from '@/types/manifests'

type Props = {
  locale: string
}

export default function ModelsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.models')
  const tShared = useTranslations('shared')
  const [searchQuery, setSearchQuery] = useState('')
  const { conversion } = useCurrency()
  const { selectedIds, toggleModel } = useModelComparison()

  // Localize models
  const localizedModels = useMemo(() => {
    return localizeManifestItems(
      modelsData as unknown as Record<string, unknown>[],
      locale as Locale
    ) as unknown as ManifestModel[]
  }, [locale])

  // Filter models
  const filteredModels = useMemo(() => {
    let result = [...localizedModels]

    // Apply search filter (search in name and i18n fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(model => {
        // Search in main name
        if (model.name.toLowerCase().includes(query)) return true
        // Search in translations names if available
        if (model.translations) {
          return Object.values(model.translations).some(
            translation =>
              typeof translation === 'object' &&
              translation !== null &&
              'name' in translation &&
              typeof translation.name === 'string' &&
              translation.name.toLowerCase().includes(query)
          )
        }
        return false
      })
    }

    return result
  }, [localizedModels, searchQuery])

  // Group filtered models by lifecycle
  const modelsByLifecycle = useMemo(() => groupModelsByLifecycle(filteredModels), [filteredModels])

  const formatListPrice = (model: ManifestModel): string => {
    const price = formatModelTokenRate(model, 'input', locale, conversion)
    return price
      ? tShared('modelPricing.perMillionTokens', { price })
      : tShared('modelPricing.notAvailable')
  }

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader
            title={tPage('title')}
            subtitle={tPage('subtitle')}
            action={
              <Link
                href={buildModelComparisonPath(selectedIds)}
                className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                {tShared('actions.compare')} ({selectedIds.length}/2) →
              </Link>
            }
          />

          <StackTabs activeStack="models" locale={locale} />

          <section className="mb-[var(--spacing-lg)] border-y border-[var(--color-border)] py-[var(--spacing-md)]">
            <h2 className="mb-[var(--spacing-xs)] text-lg font-semibold tracking-tight">
              {tPage('guide.title')}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {tPage('guide.description')}
            </p>
            <div className="mt-[var(--spacing-sm)] flex flex-wrap gap-[var(--spacing-md)] text-sm">
              <Link
                href={buildModelComparisonPath(selectedIds)}
                className="text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-text)] hover:underline"
              >
                {tPage('guide.compareModels')} →
              </Link>
              <Link
                href="/model-providers"
                className="text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-text)] hover:underline"
              >
                {tPage('guide.exploreProviders')} →
              </Link>
            </div>
          </section>

          {/* Search Box */}
          <div className="mb-[var(--spacing-md)]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tShared('labels.searchByName')}
              className="w-full max-w-2xs px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>

          {/* Models grouped by lifecycle */}
          {(['latest', 'maintained', 'deprecated'] as const).map(lifecycle => (
            <section key={lifecycle} className="mb-[var(--spacing-lg)]">
              <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
                {tShared(`lifecycle.${lifecycle}`)}
              </h2>
              {modelsByLifecycle[lifecycle].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[var(--spacing-md)]">
                  {modelsByLifecycle[lifecycle].map(model => (
                    <article
                      key={model.name}
                      className={`group flex flex-col border p-[var(--spacing-md)] transition-all hover:-translate-y-0.5 ${
                        selectedIds.includes(model.id)
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <Link href={`/models/${model.id}`} className="block flex-1">
                        <div className="flex items-start mb-[var(--spacing-sm)]">
                          <div className="inline-flex items-center gap-[var(--spacing-xs)] whitespace-nowrap">
                            <h3 className="text-lg font-semibold tracking-tight whitespace-nowrap">
                              {model.name}
                            </h3>
                            {model.verified && <VerifiedBadge size="sm" />}
                          </div>
                        </div>
                        <div className="mb-[var(--spacing-sm)] space-y-[var(--spacing-xs)]">
                          <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                            <span className="text-[var(--color-text-muted)]">{tPage('size')}</span>
                            <span className="text-[var(--color-text-secondary)]">
                              {model.size && model.activeParameters
                                ? tShared('modelParameters.totalAndActive', {
                                    total: model.size,
                                    active: model.activeParameters,
                                  })
                                : (model.size ?? '—')}
                            </span>
                          </div>
                          <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                            <span className="text-[var(--color-text-muted)]">
                              {tPage('context')}
                            </span>
                            <span className="text-[var(--color-text-secondary)]">
                              {formatTokenCount(model.contextWindow)}
                            </span>
                          </div>
                          <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                            <span className="text-[var(--color-text-muted)]">
                              {tPage('pricing')}
                            </span>
                            <span className="text-[var(--color-text-secondary)]">
                              {formatListPrice(model)}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="mt-[var(--spacing-xs)] flex items-center justify-between gap-[var(--spacing-sm)] border-t border-[var(--color-border)] pt-[var(--spacing-sm)]">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {model.vendor}
                        </span>
                        <button
                          type="button"
                          aria-pressed={selectedIds.includes(model.id)}
                          title={`${tShared('actions.compare')}: ${model.name}`}
                          onClick={() => toggleModel(model.id)}
                          className="inline-flex items-center gap-[var(--spacing-xs)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                        >
                          {selectedIds.includes(model.id) ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {tShared('actions.compare')}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {tPage('lifecycle.noResults', {
                    lifecycle: tShared(`lifecycle.${lifecycle}`),
                  })}
                </p>
              )}
            </section>
          ))}
        </main>
      </div>

      <Footer />
    </>
  )
}
