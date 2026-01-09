'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import SearchInput from '@/components/controls/SearchInput'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Link, useRouter } from '@/i18n/navigation'
import type { SearchResult } from '@/lib/search'
import { search } from '@/lib/search'

type Props = {
  locale: string
  initialQuery: string
}

export default function SearchPageClient({ locale, initialQuery }: Props) {
  const t = useTranslations('pages.search')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)

  // Perform search
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    return search(query, locale)
  }, [query, locale])

  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== query) {
      setQuery(urlQuery)
    }
  }, [searchParams, query])

  // Handle search from input
  const handleSearch = (searchQuery: string) => {
    setIsSearching(true)
    setQuery(searchQuery)
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    // Use i18n router which automatically handles locale prefix
    router.push(`/search?${params.toString()}`)
    setTimeout(() => setIsSearching(false), 300)
  }

  // Get category route
  const getCategoryRoute = (category: string, id: string) => {
    return `/${category}/${id}`
  }

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <main className="w-full">
          {/* Page Header */}
          <div className="mb-[var(--spacing-lg)]">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
              {t('title')}
            </h1>
          </div>

          {/* Search Input */}
          <div className="mb-[var(--spacing-md)] max-w-xl">
            <SearchInput initialQuery={query} onSearch={handleSearch} />
          </div>

          {/* Results Section */}
          {query.trim() ? (
            <div>
              {/* Results Count */}
              <div className="mb-[var(--spacing-md)] text-sm text-[var(--color-text-secondary)]">
                {isSearching ? (
                  <span>{t('searching')}</span>
                ) : results.length > 0 ? (
                  <span>{t('resultsCountFor', { count: results.length, query })}</span>
                ) : (
                  <span className="text-[var(--color-text-muted)]">
                    {t('noResultsFor', { query })}
                  </span>
                )}
              </div>

              {/* Results Grid */}
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
                  {results.map(result => (
                    <Link
                      key={`${result.category}-${result.id}`}
                      href={getCategoryRoute(result.category, result.id)}
                      className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group flex flex-col"
                    >
                      {/* Header with category badge */}
                      <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold tracking-tight truncate">
                            {result.name}
                          </h3>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 text-xs border border-[var(--color-border)] text-[var(--color-text-muted)]">
                              {t(
                                `stacks.${result.category === 'providers' ? 'modelProviders' : result.category}`
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all ml-2">
                          →
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light min-h-[4rem] line-clamp-3">
                        {result.description}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                !isSearching && (
                  <div className="text-center py-[var(--spacing-xl)]">
                    <div className="text-[var(--color-text-muted)] mb-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="text-base">{t('noResults')}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-[var(--spacing-xl)]">
              <div className="text-[var(--color-text-muted)]">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-base">{t('placeholder')}</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  )
}
