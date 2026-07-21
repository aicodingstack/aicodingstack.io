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
import { desktopsData } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { localizeManifestItems } from '@/lib/manifest-i18n'

type Props = { locale: string }

export default function DesktopsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.desktops')
  const tShared = useTranslations('shared')
  const [sortOrder, setSortOrder] = useState<'default' | 'name-asc' | 'name-desc'>('default')
  const [licenseFilters, setLicenseFilters] = useState<string[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const localizedDesktops = useMemo(
    () =>
      localizeManifestItems(
        desktopsData as unknown as Record<string, unknown>[],
        locale as Locale
      ) as unknown as typeof desktopsData,
    [locale]
  )

  const filteredDesktops = useMemo(() => {
    let result = [...localizedDesktops]
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter(desktop =>
        [desktop.name, desktop.description, desktop.vendor].some(value =>
          value.toLowerCase().includes(query)
        )
      )
    }
    if (licenseFilters.length > 0) {
      result = result.filter(desktop =>
        licenseFilters.includes(desktop.license === 'Proprietary' ? 'proprietary' : 'open-source')
      )
    }
    if (platformFilters.length > 0) {
      result = result.filter(desktop =>
        platformFilters.some(platform => desktop.platforms.some(item => item.os === platform))
      )
    }
    if (sortOrder === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name))
    if (sortOrder === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name))
    return result
  }, [licenseFilters, localizedDesktops, platformFilters, searchQuery, sortOrder])

  return (
    <>
      <Header />
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <main className="w-full">
          <PageHeader title={tPage('title')} subtitle={tPage('subtitle')} />
          <StackTabs activeStack="desktops" locale={locale} />
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
          {filteredDesktops.length === 0 ? (
            <div className="text-center py-[var(--spacing-xl)] text-[var(--color-text-secondary)]">
              {tPage('noMatches')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {filteredDesktops.map(desktop => (
                <Link
                  key={desktop.id}
                  href={`/desktops/${desktop.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                    <div className="flex items-center gap-[var(--spacing-xs)]">
                      <h3 className="text-lg font-semibold tracking-tight">{desktop.name}</h3>
                      {desktop.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mb-[var(--spacing-md)] font-light min-h-[4rem]">
                    {desktop.description}
                  </p>
                  <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)] mt-auto">
                    <span>{desktop.vendor}</span>
                    <span className="text-[var(--color-border)]">•</span>
                    <span>{translateLicenseText(desktop.license, tShared)}</span>
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
