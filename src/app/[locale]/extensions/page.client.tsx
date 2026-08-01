'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import FilterSortBar from '@/components/controls/FilterSortBar'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import StackTabs from '@/components/navigation/StackTabs'
import PageHeader from '@/components/PageHeader'
import { ProductCardTitle } from '@/components/product/ProductCardTitle'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { extensionsData } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { localizeManifestItems } from '@/lib/manifest-i18n'

type Props = {
  locale: string
}

export default function ExtensionsPageClient({ locale }: Props) {
  const tPage = useTranslations('pages.extensions')
  const tShared = useTranslations('shared')
  const [sortOrder, setSortOrder] = useState<'default' | 'name-asc' | 'name-desc'>('default')
  const [licenseFilters, setLicenseFilters] = useState<string[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Localize Extensions
  const localizedExtensions = useMemo(() => {
    return localizeManifestItems(
      extensionsData as unknown as Record<string, unknown>[],
      locale as Locale
    ) as unknown as typeof extensionsData
  }, [locale])

  // Filter and sort Extensions
  const filteredAndSortedExtensions = useMemo(() => {
    let result = [...localizedExtensions]

    // Apply search filter (search in name and translations fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(extension => {
        // Search in main name
        if (extension.name.toLowerCase().includes(query)) return true
        // Search in translations names if available
        if (extension.translations) {
          return Object.values(extension.translations).some(
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
      result = result.filter(extension => {
        const isOpenSource = extension.license !== 'Proprietary'
        const isProprietary = extension.license === 'Proprietary'

        if (licenseFilters.includes('open-source') && isOpenSource) {
          return true
        }
        if (licenseFilters.includes('proprietary') && isProprietary) {
          return true
        }
        return false
      })
    }

    // Apply platform filter (IDE platform for extensions)
    if (platformFilters.length > 0) {
      result = result.filter(extension => {
        const ideList = extension.supportedIdes?.map(ideSupport => ideSupport.ideId) || []
        return platformFilters.some(ide =>
          ideList.includes(ide as 'vscode' | 'jetbrains' | 'cursor' | 'windsurf' | 'trae' | 'zed')
        )
      })
    }

    // Apply sorting
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    }
    // 'default' keeps the original order

    return result
  }, [localizedExtensions, sortOrder, licenseFilters, platformFilters, searchQuery])

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
                href="/extensions/comparison"
                className="text-sm px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                {tShared('actions.compareAll')} →
              </Link>
            }
          />

          <StackTabs activeStack="extensions" locale={locale} />

          <FilterSortBar
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            licenseFilters={licenseFilters}
            onLicenseFiltersChange={setLicenseFilters}
            platformFilters={platformFilters}
            onPlatformFiltersChange={setPlatformFilters}
            availablePlatforms={['vscode', 'jetbrains', 'cursor', 'windsurf']}
            platformLabel="IDE:"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {filteredAndSortedExtensions.length === 0 ? (
            <div className="text-center py-[var(--spacing-xl)] text-[var(--color-text-secondary)]">
              {tPage('noMatches')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
              {filteredAndSortedExtensions.map(extension => (
                <Link
                  key={extension.name}
                  href={`/extensions/${extension.id}`}
                  className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 flex flex-col"
                >
                  <ProductCardTitle
                    name={extension.name}
                    verified={extension.verified}
                    deprecated={extension.deprecated}
                  />
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mb-[var(--spacing-md)] font-light min-h-[4rem]">
                    {extension.description}
                  </p>
                  <div className="flex items-center gap-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)] mt-auto">
                    <span>{extension.vendor}</span>
                    {extension.license && (
                      <>
                        <span className="text-[var(--color-border)]">•</span>
                        <span>{translateLicenseText(extension.license, tShared)}</span>
                      </>
                    )}
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
