'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
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
import type { ManifestModel } from '@/types/manifests'

type Props = {
  locale: string
}

export default function ModelsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.models')
  const tShared = useTranslations('shared')
  const [searchQuery, setSearchQuery] = useState('')

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
  const modelsByLifecycle = useMemo(() => {
    const groups = {
      latest: [] as ManifestModel[],
      maintained: [] as ManifestModel[],
      deprecated: [] as ManifestModel[],
    }
    filteredModels.forEach(model => {
      const lifecycle = model.lifecycle || 'maintained'
      groups[lifecycle].push(model)
    })
    return groups
  }, [filteredModels])

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
                href="/models/comparison"
                className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                {tShared('actions.compareAll')} →
              </Link>
            }
          />

          <StackTabs activeStack="models" locale={locale} />

          {/* Search Box */}
          <div className="mb-[var(--spacing-md)]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tPage('search') || 'Search by name...'}
              className="w-full max-w-2xs px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>

          {/* Models grouped by lifecycle */}
          {(['latest', 'maintained', 'deprecated'] as const).map(lifecycle => (
            <section key={lifecycle} className="mb-[var(--spacing-lg)]">
              <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
                {tPage(`lifecycle.${lifecycle}`)}
              </h2>
              {modelsByLifecycle[lifecycle].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
                  {modelsByLifecycle[lifecycle].map(model => (
                    <Link
                      key={model.name}
                      href={`/models/${model.id}`}
                      className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                    >
                      <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                        <div className="flex items-center gap-[var(--spacing-xs)]">
                          <h3 className="text-lg font-semibold tracking-tight">{model.name}</h3>
                          {model.verified && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                          →
                        </span>
                      </div>
                      <div className="space-y-[var(--spacing-xs)] mb-[var(--spacing-md)]">
                        <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                          <span className="text-[var(--color-text-muted)]">{tPage('size')}</span>
                          <span className="text-[var(--color-text-secondary)]">{model.size}</span>
                        </div>
                        <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                          <span className="text-[var(--color-text-muted)]">{tPage('context')}</span>
                          <span className="text-[var(--color-text-secondary)]">
                            {formatTokenCount(model.contextWindow)}
                          </span>
                        </div>
                        <div className="flex items-center gap-[var(--spacing-sm)] text-xs">
                          <span className="text-[var(--color-text-muted)]">{tPage('pricing')}</span>
                          <span className="text-[var(--color-text-secondary)]">
                            {model.tokenPricing?.input !== null &&
                            model.tokenPricing?.input !== undefined
                              ? `$${model.tokenPricing.input}/M`
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)]">
                        <span>{model.vendor}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {tPage('lifecycle.noResults', {
                    lifecycle: tPage(`lifecycle.${lifecycle}`),
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
