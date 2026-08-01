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
import { vendorsData } from '@/lib/generated'
import { localizeManifestItems } from '@/lib/manifest-i18n'
import { groupVendorsByCompanyStage } from '@/lib/vendor-list'
import type { ManifestVendor } from '@/types/manifests'

type Props = {
  locale: string
}

export default function VendorsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.vendors')
  const tShared = useTranslations('shared')
  const [searchQuery, setSearchQuery] = useState('')

  // Localize vendors
  const localizedVendors = useMemo(() => {
    return localizeManifestItems(
      vendorsData as unknown as Record<string, unknown>[],
      locale as Locale
    ) as unknown as ManifestVendor[]
  }, [locale])

  // Filter vendors
  const filteredVendors = useMemo(() => {
    let result = [...localizedVendors]

    // Apply search filter (search in name and i18n fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(vendor => {
        // Search in main name
        if (vendor.name.toLowerCase().includes(query)) return true
        if (vendor.aliases?.some(alias => alias.toLowerCase().includes(query))) return true
        // Search in translations names if available
        if (vendor.translations) {
          return Object.values(vendor.translations).some(
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
  }, [localizedVendors, searchQuery])

  const vendorGroups = useMemo(
    () => groupVendorsByCompanyStage(filteredVendors, locale),
    [filteredVendors, locale]
  )

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader title={tPage('title')} subtitle={tPage('subtitle')} />

          <StackTabs activeStack="vendors" locale={locale} />

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

          {vendorGroups.map(group => (
            <section key={group.id} className="mb-[var(--spacing-lg)]">
              <h2 className="text-base uppercase tracking-wide text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
                {tPage(`companyStages.${group.translationKey}`)}
              </h2>
              {group.vendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
                  {group.vendors.map(vendor => (
                    <Link
                      key={vendor.id}
                      href={`/vendors/${vendor.id}`}
                      className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-start mb-[var(--spacing-sm)]">
                        <div className="flex items-center gap-[var(--spacing-xs)]">
                          <h3 className="text-lg font-semibold tracking-tight">{vendor.name}</h3>
                          {vendor.verified && <VerifiedBadge size="sm" />}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                        {vendor.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">{tPage('noResults')}</p>
              )}
            </section>
          ))}
        </main>
      </div>

      <Footer />
    </>
  )
}
