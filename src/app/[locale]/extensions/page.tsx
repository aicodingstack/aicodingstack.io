import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import ExtensionsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'extensions',
    translationNamespace: 'pages.extensions',
    additionalKeywords: ['AI code completion', 'VS Code extensions', 'JetBrains AI'],
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ExtensionsPage({ params }: Props) {
  const { locale } = await params
  return <ExtensionsPageClient locale={locale} />
}
