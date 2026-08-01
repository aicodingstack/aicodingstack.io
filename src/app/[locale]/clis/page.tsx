import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import CLIsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'clis',
    translationNamespace: 'pages.clis',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CLIsPage({ params }: Props) {
  const { locale } = await params
  return <CLIsPageClient locale={locale} />
}
