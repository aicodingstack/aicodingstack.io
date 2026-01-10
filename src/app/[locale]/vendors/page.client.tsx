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
import type { ManifestVendor } from '@/types/manifests'

type Props = {
  locale: string
}

export default function VendorsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.stacks')
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

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader title={tPage('vendors.title')} subtitle={tPage('vendors.subtitle')} />

          <StackTabs activeStack="vendors" locale={locale} />

          {/* Search Box */}
          <div className="mb-[var(--spacing-md)]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tPage('vendors.search') || 'Search by name...'}
              className="w-full max-w-2xs px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
            {filteredVendors.map(vendor => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                  <div className="flex items-center gap-[var(--spacing-xs)]">
                    <h3 className="text-lg font-semibold tracking-tight">{vendor.name}</h3>
                    {vendor.verified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem]">
                  {vendor.description}
                </p>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
