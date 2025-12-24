import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'
import ModelProvidersPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'modelProviders',
    translationNamespace: 'pages.modelProviders',
    additionalKeywords: ['OpenAI', 'Anthropic', 'model API', 'AI provider comparison'],
  })
}

export default async function ModelProvidersPage({ params }: LocalePageProps) {
  const { locale } = await params
  return <ModelProvidersPageClient locale={locale} />
}
