import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/JsonLd'
import type { Locale } from '@/i18n/config'
import { generateListPageMetadata } from '@/lib/metadata'
import { generateFAQPageSchema } from '@/lib/metadata/schemas'
import type { LocalePageProps } from '@/types/locale'
import ModelProvidersPageClient from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params

  return await generateListPageMetadata({
    locale: locale as Locale,
    category: 'modelProviders',
    translationNamespace: 'pages.modelProviders',
  })
}

export default async function ModelProvidersPage({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.modelProviders' })
  const faqSchema = await generateFAQPageSchema([
    {
      question: tPage('faq.providerTypes.question'),
      answer: tPage('faq.providerTypes.answer'),
    },
    {
      question: tPage('faq.selection.question'),
      answer: tPage('faq.selection.answer'),
    },
    {
      question: tPage('faq.firstParty.question'),
      answer: tPage('faq.firstParty.answer'),
    },
  ])

  return (
    <>
      <JsonLd data={faqSchema} />
      <ModelProvidersPageClient locale={locale} />
    </>
  )
}
