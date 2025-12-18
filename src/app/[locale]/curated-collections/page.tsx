import { getTranslations } from 'next-intl/server'
import CollectionScrollbar from '@/components/CollectionScrollbar'
import CollectionSection from '@/components/CollectionSection'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import { getCollectionSectionIds, getCollections } from '@/lib/collections'
import { buildCanonicalUrl, buildOpenGraph, buildTitle, buildTwitterCard } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.curatedCollections' })

  const canonicalPath = locale === 'en' ? '/curated-collections' : `/${locale}/curated-collections`
  const title = buildTitle({ title: `${t('title')} - AI Coding Specs, Protocols & Tools` })
  const description = t('subtitle')

  return {
    title,
    description,
    keywords:
      'AI coding resources, MCP protocol, Agent2Agent, development standards, AI coding articles, semantic versioning, conventional commits',
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/curated-collections',
        'zh-Hans': '/zh-Hans/curated-collections',
      },
    },
    openGraph: buildOpenGraph({
      title: `${t('title')} - AI Coding Specs, Protocols & Tools`,
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: `${t('title')} - AI Coding Specs, Protocols & Tools`,
      description,
    }),
  }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CuratedCollectionsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.curatedCollections' })
  const collections = getCollections(locale)
  const sectionIds = getCollectionSectionIds()

  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />

        {/* Main Content with Sidebar */}
        <div className="flex gap-[var(--spacing-lg)]">
          <CollectionScrollbar sectionIds={sectionIds} collections={collections} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {sectionIds
              .filter(sectionId => collections[sectionId])
              .map(sectionId => (
                <CollectionSection
                  key={sectionId}
                  id={sectionId}
                  section={collections[sectionId]!}
                />
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
