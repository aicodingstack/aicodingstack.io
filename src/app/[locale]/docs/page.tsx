import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import DocsSidebar from '@/components/sidebar/DocsSidebar'
import type { Locale } from '@/i18n/config'
import { getDocComponent, getDocSections } from '@/lib/generated/docs'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.docs' })

  const title = buildTitle({ title: tPage('title') })
  const description = tPage('subtitle')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'docs',
    title,
    description,
    keywords: tPage('keywords'),
    ogType: 'website',
  })
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params
  const docSections = getDocSections(locale)
  const WelcomeDoc = await getDocComponent(locale, 'welcome')
  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <DocsSidebar sections={docSections} activeSlug="welcome" />

          {/* Main Content */}
          <main className="flex-1 max-w-8xl">
            <article className="space-y-[var(--spacing-lg)] text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {WelcomeDoc && <WelcomeDoc />}
            </article>
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
