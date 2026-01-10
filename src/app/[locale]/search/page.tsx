import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import SearchPageClient from './page.client'

export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const { q } = await searchParams
  const tPage = await getTranslations({ locale, namespace: 'pages.search' })

  const title = q ? tPage('resultsCountFor', { count: 0, query: q }) : tPage('title')
  const description = tPage('placeholder')

  // Generate base metadata using unified generator with 'search' pageType for noindex
  const baseMetadata = await generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'search',
    title: buildTitle({ title }),
    description,
    ogType: 'website',
    pageType: 'search',
  })

  // For search pages with query params, add query to language alternates
  // Canonical remains without query params (SEO best practice)
  if (q && baseMetadata.alternates?.languages) {
    const queryString = `?q=${encodeURIComponent(q)}`
    const languagesWithQuery: Record<string, string> = {}
    Object.entries(baseMetadata.alternates.languages).forEach(([lang, path]) => {
      languagesWithQuery[lang] = `${path}${queryString}`
    })
    baseMetadata.alternates.languages = languagesWithQuery
  }

  return baseMetadata
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q } = await searchParams

  return <SearchPageClient locale={locale} initialQuery={q || ''} />
}
