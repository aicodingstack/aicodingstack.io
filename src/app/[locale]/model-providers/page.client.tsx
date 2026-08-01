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
  const tPage = useTranslations('pages.modelProviders')
  const tShared = useTranslations('shared')
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
  const selectionCriteria = [
    {
      id: 'model-access',
      title: tPage('guide.criteria.modelAccess.title'),
      description: tPage('guide.criteria.modelAccess.description'),
    },
    {
      id: 'pricing-limits',
      title: tPage('guide.criteria.pricingLimits.title'),
      description: tPage('guide.criteria.pricingLimits.description'),
    },
    {
      id: 'production-fit',
      title: tPage('guide.criteria.productionFit.title'),
      description: tPage('guide.criteria.productionFit.description'),
    },
  ]
  const faqItems = [
    {
      id: 'provider-types',
      question: tPage('faq.providerTypes.question'),
      answer: tPage('faq.providerTypes.answer'),
    },
    {
      id: 'selection',
      question: tPage('faq.selection.question'),
      answer: tPage('faq.selection.answer'),
    },
    {
      id: 'first-party',
      question: tPage('faq.firstParty.question'),
      answer: tPage('faq.firstParty.answer'),
    },
  ]

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader title={tPage('title')} subtitle={tPage('subtitle')} />

          <StackTabs activeStack="model-providers" locale={locale} />

          <section
            aria-labelledby="provider-selection-guide"
            className="mb-[var(--spacing-lg)] max-w-6xl border-y border-[var(--color-border)] py-[var(--spacing-md)]"
          >
            <h2
              id="provider-selection-guide"
              className="mb-[var(--spacing-xs)] text-lg font-semibold tracking-tight"
            >
              {tPage('guide.title')}
            </h2>
            <p className="max-w-4xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {tPage('guide.description')}
            </p>
            <div className="mt-[var(--spacing-md)] grid grid-cols-1 gap-[var(--spacing-md)] md:grid-cols-3">
              {selectionCriteria.map(criterion => (
                <article key={criterion.id}>
                  <h3 className="mb-[var(--spacing-xs)] text-sm font-semibold">
                    {criterion.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {criterion.description}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-[var(--spacing-md)] flex flex-wrap gap-[var(--spacing-md)] text-sm">
              <Link
                href="/models"
                className="text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-text)] hover:underline"
              >
                {tPage('guide.browseModels')}
              </Link>
              <Link
                href="/models/compare"
                className="text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-text)] hover:underline"
              >
                {tPage('guide.compareModels')}
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

          <section className="mb-[var(--spacing-lg)]">
            <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
              {tShared('providerTypes.foundation-model-provider')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {foundationModelProviders.map(provider => (
                <Link
                  key={provider.name}
                  href={`/model-providers/${provider.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      {provider.verified && <VerifiedBadge size="sm" />}
                    </div>
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
              {tShared('providerTypes.model-service-provider')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {modelServiceProviders.map(provider => (
                <Link
                  key={provider.name}
                  href={`/model-providers/${provider.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{provider.name}</h3>
                      {provider.verified && <VerifiedBadge size="sm" />}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                    {provider.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="provider-faq"
            className="mt-[var(--spacing-xl)] max-w-6xl border-t border-[var(--color-border)] pt-[var(--spacing-lg)]"
          >
            <h2 id="provider-faq" className="mb-[var(--spacing-sm)] text-lg font-semibold">
              {tPage('faq.title')}
            </h2>
            <div className="divide-y divide-[var(--color-border)]">
              {faqItems.map(item => (
                <article
                  key={item.id}
                  className="grid gap-[var(--spacing-sm)] py-[var(--spacing-md)] md:grid-cols-3"
                >
                  <h3 className="text-sm font-semibold leading-relaxed">{item.question}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] md:col-span-2">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  )
}
