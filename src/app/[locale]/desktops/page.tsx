import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'
import DesktopsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'desktops',
    translationNamespace: 'pages.desktops',
  })
}

export default async function DesktopsPage({ params }: LocalePageProps) {
  const { locale } = await params
  return <DesktopsPageClient locale={locale} />
}
