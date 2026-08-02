import type { Locale } from '@/i18n/config'
import { generateComparisonMetadata } from '@/lib/metadata'
import DesktopComparisonPageClient from './page.client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  return await generateComparisonMetadata({
    locale: locale as Locale,
    category: 'desktops',
  })
}

export default async function DesktopComparisonPage({ params }: Props) {
  const { locale } = await params
  return <DesktopComparisonPageClient locale={locale} />
}
