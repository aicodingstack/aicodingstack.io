import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'
import IDEsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'ides',
    translationNamespace: 'pages.ides',
  })
}

export default async function IDEsPage({ params }: LocalePageProps) {
  const { locale } = await params
  return <IDEsPageClient locale={locale} />
}
