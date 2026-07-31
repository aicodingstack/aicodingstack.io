import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import CollectionSection from '@/components/product/CollectionSection'
import CollectionScrollbar from '@/components/sidebar/CollectionScrollbar'
import type { Locale } from '@/i18n/config'
import { getCollectionSectionIds, getCollections } from '@/lib/collections'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.curatedCollections' })

  const title = buildTitle({
    title: tPage('meta.title'),
  })
  const description = tPage('meta.description')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'curated-collections',
    title,
    description,
    keywords:
      'AI coding resources, MCP protocol, Agent2Agent, development standards, AI coding articles, semantic versioning, conventional commits',
    ogType: 'website',
  })
}

export default async function CuratedCollectionsPage({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.curatedCollections' })
  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const collections = getCollections(locale)
  const sectionIds = getCollectionSectionIds()

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <PageHeader title={tShared('terms.curatedCollections')} subtitle={tPage('subtitle')} />

        {/* Main Content with Sidebar */}
        <div className="flex flex-col gap-[var(--spacing-lg)] lg:flex-row">
          <CollectionScrollbar
            sectionIds={sectionIds}
            collections={collections}
            label={tPage('sectionNavigation')}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {sectionIds
              .filter(sectionId => collections[sectionId])
              .map(sectionId => (
                <CollectionSection
                  key={sectionId}
                  id={sectionId}
                  locale={locale}
                  section={collections[sectionId]!}
                  labels={{
                    opensInNewTab: tPage('opensInNewTab'),
                    published: tPage('published'),
                    verified: tPage('verified'),
                    publicPreview: tPage('status.publicPreview'),
                  }}
                />
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
