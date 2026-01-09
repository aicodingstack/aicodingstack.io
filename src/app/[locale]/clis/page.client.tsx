'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import FilterSortBar from '@/components/controls/FilterSortBar'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import StackTabs from '@/components/navigation/StackTabs'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { clisData } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { localizeManifestItems } from '@/lib/manifest-i18n'

type Props = {
  locale: string
}

export default function CLIsPageClient({ locale }: Props) {
  const t = useTranslations('pages.stacks.clis')
  const tGlobal = useTranslations()
  const [sortOrder, setSortOrder] = useState<'default' | 'name-asc' | 'name-desc'>('default')
  const [licenseFilters, setLicenseFilters] = useState<string[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Localize CLIs
  const localizedClis = useMemo(() => {
    return localizeManifestItems(
      clisData as unknown as Record<string, unknown>[],
      locale as Locale
    ) as unknown as typeof clisData
  }, [locale])

  // Filter and sort CLIs
  const filteredAndSortedClis = useMemo(() => {
    let result = [...localizedClis]

    // Apply search filter (search in name and translations fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(cli => {
        // Search in main name
        if (cli.name.toLowerCase().includes(query)) return true
        // Search in translations names if available
        if (cli.translations) {
          return Object.values(cli.translations).some(
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

    // Apply license filter
    if (licenseFilters.length > 0) {
      result = result.filter(cli => {
        const isOpenSource = cli.license !== 'Proprietary'
        const isProprietary = cli.license === 'Proprietary'

        if (licenseFilters.includes('open-source') && isOpenSource) {
          return true
        }
        if (licenseFilters.includes('proprietary') && isProprietary) {
          return true
        }
        return false
      })
    }

    // Apply platform filter
    if (platformFilters.length > 0) {
      result = result.filter(cli =>
        platformFilters.some(platform => cli.platforms.some(p => p.os === platform))
      )
    }

    // Apply sorting
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    }
    // 'default' keeps the original order

    return result
  }, [localizedClis, sortOrder, licenseFilters, platformFilters, searchQuery])

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        {/* Main Content */}
        <main className="w-full">
          <PageHeader
            title={t('title')}
            subtitle={t('subtitle')}
            action={
              <Link
                href="/clis/comparison"
                className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                {t('compareAll')} →
              </Link>
            }
          />

          <StackTabs activeStack="clis" locale={locale} />

          <FilterSortBar
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            licenseFilters={licenseFilters}
            onLicenseFiltersChange={setLicenseFilters}
            platformFilters={platformFilters}
            onPlatformFiltersChange={setPlatformFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {filteredAndSortedClis.length === 0 ? (
            <div className="text-center py-[var(--spacing-xl)] text-[var(--color-text-secondary)]">
              {t('noMatches')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {filteredAndSortedClis.map(cli => (
                <Link
                  key={cli.name}
                  href={`/clis/${cli.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{cli.name}</h3>
                      {cli.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mb-[var(--spacing-md)] font-light min-h-[4rem]">
                    {cli.description}
                  </p>
                  <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)] mt-auto">
                    <span>{cli.vendor}</span>
                    <span className="text-[var(--color-border)]">•</span>
                    <span>{translateLicenseText(cli.license, tGlobal)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  )
}
