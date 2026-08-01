import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import VendorsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'vendors',
    translationNamespace: 'pages.vendors',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function VendorsPage({ params }: Props) {
  const { locale } = await params
  return <VendorsPageClient locale={locale} />
}
