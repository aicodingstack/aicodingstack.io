import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import { OpenSourceRankPage } from './page.client'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.openSourceRank.meta' })

  const title = buildTitle({ title: tPage('title') })
  const description = tPage('description')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'open-source-rank',
    title,
    description,
    ogType: 'website',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.openSourceRank' })

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
          <PageHeader title={tPage('title')} subtitle={tPage('description')} />

          <OpenSourceRankPage />
        </div>
      </main>
      <Footer />
    </>
  )
}
