import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import {
  modelPriceIntelligenceMeta,
  modelPriceIntelligencePoints,
} from '@/lib/model-price-intelligence-index'
import { ModelPriceIntelligenceIndexPage } from './page.client'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tPage = await getTranslations({
    locale,
    namespace: 'pages.modelPriceIntelligenceIndex.meta',
  })

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'model-price-intelligence-index',
    title: buildTitle({ title: tPage('title') }),
    description: tPage('description'),
    keywords: tPage('keywords'),
    ogType: 'website',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  const tPage = await getTranslations({
    locale,
    namespace: 'pages.modelPriceIntelligenceIndex',
  })

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
          <PageHeader title={tPage('title')} subtitle={tPage('description')} />
          <ModelPriceIntelligenceIndexPage
            locale={locale}
            meta={modelPriceIntelligenceMeta}
            points={modelPriceIntelligencePoints}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
