import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import ModelsPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'models',
    translationNamespace: 'pages.models',
    additionalKeywords: ['LLM for coding', 'Claude Sonnet', 'GPT-4', 'coding AI models 2025'],
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ModelsPage({ params }: Props) {
  const { locale } = await params
  return <ModelsPageClient locale={locale} />
}
