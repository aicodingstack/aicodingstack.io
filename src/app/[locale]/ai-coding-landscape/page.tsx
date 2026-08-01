import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import PageHeader from '@/components/PageHeader'
import VendorMatrix from '@/components/product/VendorMatrix'
import type { Locale } from '@/i18n/config'
import { buildVendorMatrix } from '@/lib/landscape-data'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tShared = await getTranslations({ locale, namespace: 'shared' })

  const title = buildTitle({ title: tShared('terms.landscapeTitle') })
  const description = tShared('terms.landscapeDescription')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'ai-coding-landscape',
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
  const tShared = await getTranslations({ locale, namespace: 'shared' })

  // Build vendor matrix data
  const matrixData = buildVendorMatrix()

  return (
    <>
      <Header />
      <main className="max-w-8xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]">
        <PageHeader
          title={tShared('terms.landscapeTitle')}
          subtitle={tShared('terms.landscapeDescription')}
        />

        {/* Vendor Matrix */}
        <VendorMatrix matrixData={matrixData} />

        {/* Back to Overview */}
        <BackToNavigation href="/ai-coding-stack" title={tShared('terms.aiCodingStack')} />
      </main>
      <Footer />
    </>
  )
}
