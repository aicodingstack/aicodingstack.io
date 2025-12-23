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
import { providersData } from '@/lib/generated'
import { localizeManifestItems } from '@/lib/manifest-i18n'
import type { ManifestProvider } from '@/types/manifests'

type Props = {
  locale: string
}

export default function ModelProvidersPageClient({ locale }: Props) {
  const t = useTranslations('pages.modelProviders')
  const [searchQuery, setSearchQuery] = useState('')

  // Localize providers
  const localizedProviders = useMemo(() => {
    return localizeManifestItems(
      providersData as unknown as Record<string, unknown>[],
      locale as Locale
    ) as unknown as ManifestProvider[]
  }, [locale])

  // Filter providers
  const filteredProviders = useMemo(() => {
    let result = [...localizedProviders]

    // Apply search filter (search in name and translations fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(provider => {
        // Search in main name
        if (provider.name.toLowerCase().includes(query)) return true
        // Search in translations names if available
        if (provider.translations) {
          return Object.values(provider.translations).some(
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
  }, [localizedProviders, searchQuery])

  const foundationModelProviders = filteredProviders.filter(
    p => p.type === 'foundation-model-provider'
  )
  const modelServiceProviders = filteredProviders.filter(p => p.type === 'model-service-provider')

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader title={t('title')} subtitle={t('subtitle')} />

          <StackTabs activeStack="model-providers" locale={locale} />

          {/* Search Box */}
          <div className="mb-[var(--spacing-md)]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search') || 'Search by name...'}
              className="w-full max-w-2xs px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>

          <section className="mb-[var(--spacing-lg)]">
            <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
              {t('foundationProviders')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {foundationModelProviders.map(provider => (
                <Link
                  key={provider.name}
                  href={`/model-providers/${provider.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      {provider.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                    {provider.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
              {t('serviceProviders')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {modelServiceProviders.map(provider => (
                <Link
                  key={provider.name}
                  href={`/model-providers/${provider.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      {provider.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                    {provider.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  )
}
