import {
  ArrowRight,
  Blocks,
  ChartNoAxesCombined,
  Clock3,
  GitCompareArrows,
  Github,
  Network,
  Scale,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { MarkdownContent } from '@/components/MarkdownContent'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { faqMetadata } from '@/lib/generated/metadata'
import { homepageActivities, homepageStats } from '@/lib/homepage-data'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import { generateFAQPageSchema } from '@/lib/metadata/schemas'
import {
  allModelIntelligencePoints,
  modelIntelligenceMeta,
  modelIntelligenceSeries,
} from '@/lib/model-intelligence-index'
import { modelPriceIntelligencePoints } from '@/lib/model-price-intelligence-index'
import type { LocalePageProps } from '@/types/locale'
import homepageData from '../../../data/homepage.json'
import { HomepageDataStage } from './page.client'

export const revalidate = 3600

const homepageIntelligenceSeries = homepageData.modelIntelligenceSeries.map(selection => {
  const series = modelIntelligenceSeries.find(
    candidate =>
      candidate.vendor === selection.vendor &&
      candidate.id === `${selection.vendor}:${selection.seriesId}`
  )

  if (!series || series.points.length < 2) {
    throw new Error(
      `Homepage Intelligence Index series is missing or has no timeline: ${selection.vendor}:${selection.seriesId}`
    )
  }

  const name = series.name.toLowerCase().startsWith(series.vendor.toLowerCase())
    ? series.name
    : `${series.vendor} ${series.name}`

  return {
    color: series.color,
    id: series.id,
    name,
    points: series.points.map(point => ({
      name: point.name,
      score: point.score,
      timestamp: point.timestamp,
    })),
  }
})

const homepagePricePoints = modelPriceIntelligencePoints.map(point => ({
  color: point.color,
  labelAnchor: point.labelAnchor,
  labelDx: point.labelDx,
  labelDy: point.labelDy,
  modelId: point.modelId,
  name: point.name,
  price: point.blendedPrice,
  score: point.score,
  vendor: point.vendor,
}))

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.home.meta' })

  const title = buildTitle({ title: tPage('title'), includeSiteName: true })
  const description = tPage('description')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: '',
    title,
    description,
    ogType: 'website',
    pageType: 'home',
  })
}

async function getFaqSchema(locale: string) {
  const faqItems = faqMetadata[locale] || faqMetadata.en || []

  return await generateFAQPageSchema(
    faqItems.map(faq => ({
      question: faq.title,
      answer: faq.content,
    }))
  )
}

export default async function Home({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.home' })
  const tIntelligence = await getTranslations({
    locale,
    namespace: 'pages.modelIntelligenceIndex',
  })
  const tPrice = await getTranslations({
    locale,
    namespace: 'pages.modelPriceIntelligenceIndex',
  })
  const tOpenSource = await getTranslations({ locale, namespace: 'pages.openSourceRank' })
  const faqItems = faqMetadata[locale] || faqMetadata.en || []
  const faqSchema = await getFaqSchema(locale)

  const topics = [
    {
      description: tIntelligence('description'),
      href: '/model-intelligence-index' as const,
      icon: ChartNoAxesCombined,
      metric: tPage('topics.indexedModels', { count: allModelIntelligencePoints.length }),
      title: tIntelligence('title'),
    },
    {
      description: tPrice('description'),
      href: '/model-price-intelligence-index' as const,
      icon: Scale,
      metric: tPage('topics.comparableModels', { count: modelPriceIntelligencePoints.length }),
      title: tPrice('title'),
    },
    {
      description: tOpenSource('description'),
      href: '/open-source-rank' as const,
      icon: Github,
      metric: tPage('topics.openSourceRepositories', {
        count: homepageStats.openSourceRepositories,
      }),
      title: tOpenSource('title'),
    },
  ]

  const featureLinks = {
    comparison: { href: '/clis/comparison' as const, icon: GitCompareArrows },
    directory: { href: '/ai-coding-stack' as const, icon: Blocks },
    ecosystem: { href: '/ai-coding-landscape' as const, icon: Network },
    tracking: { href: '/open-source-rank' as const, icon: Clock3 },
  }

  return (
    <>
      <JsonLd data={faqSchema} />
      <Header />

      <main>
        <section className="max-w-8xl mx-auto px-[var(--spacing-md)] pb-[var(--spacing-md)] pt-[var(--spacing-lg)]">
          <div>
            <p className="mb-[var(--spacing-sm)] text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              {tPage('subtitle')}
            </p>
            <h1 className="homepage-h1 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
              {tPage('title')}
            </h1>
            <p className="mt-[var(--spacing-sm)] max-w-5xl text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {tPage('description')}
            </p>
          </div>
        </section>

        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <HomepageDataStage
            activities={homepageActivities}
            intelligenceAxisHint={tIntelligence('chart.axisHint')}
            intelligenceSeries={homepageIntelligenceSeries}
            intelligenceTitle={tIntelligence('title')}
            locale={locale}
            observedAt={modelIntelligenceMeta.observedAt}
            priceAxisHint={tPrice('chart.axisHint')}
            priceBlendedLabel={tPrice('list.blended')}
            priceIndexLabel={tPrice('list.index')}
            pricePoints={homepagePricePoints}
            priceTitle={tPrice('title')}
            stats={homepageStats}
          />
        </div>

        <section className="max-w-8xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]">
          <div className="mb-[var(--spacing-md)] flex items-end justify-between gap-[var(--spacing-md)]">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {tPage('topics.eyebrow')}
              </p>
              <h2 className="homepage-h2 mt-[var(--spacing-xs)] text-2xl font-semibold">
                {tPage('topics.title')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[var(--spacing-lg)] md:grid-cols-3">
            {topics.map(topic => {
              const Icon = topic.icon

              return (
                <article
                  key={topic.href}
                  className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]"
                >
                  <div className="mb-[var(--spacing-md)] flex items-start justify-between gap-[var(--spacing-sm)]">
                    <p className="text-lg font-semibold tabular-nums">{topic.metric}</p>
                    <Icon aria-hidden="true" className="h-5 w-5 text-[var(--color-text-muted)]" />
                  </div>
                  <h3 className="text-base font-semibold">{topic.title}</h3>
                  <p className="mt-[var(--spacing-xs)] text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
                    {topic.description}
                  </p>
                  <Link
                    href={topic.href}
                    className="mt-[var(--spacing-sm)] inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    {tPage('topics.view')}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        <section
          id="features"
          className="max-w-8xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]"
        >
          <div className="border-y border-[var(--color-border)] py-[var(--spacing-lg)]">
            <h2 className="homepage-h2 mb-[var(--spacing-md)] text-2xl font-semibold">
              {tPage('features.title')}
            </h2>
            <div className="grid grid-cols-1 gap-[var(--spacing-md)] md:grid-cols-2 xl:grid-cols-4">
              {(['directory', 'comparison', 'ecosystem', 'tracking'] as const).map(featureKey => {
                const feature = featureLinks[featureKey]
                const Icon = feature.icon

                return (
                  <Link
                    key={featureKey}
                    href={feature.href}
                    className="group flex min-h-52 flex-col border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-[var(--spacing-sm)]">
                      <Icon aria-hidden="true" className="h-5 w-5 text-[var(--color-text-muted)]" />
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h3 className="mt-[var(--spacing-md)] text-base font-semibold tracking-tight">
                      {tPage(`features.${featureKey}.title`)}
                    </h3>
                    <p className="mt-[var(--spacing-xs)] text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
                      {tPage(`features.${featureKey}.description`)}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="max-w-6xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]"
        >
          <h2 className="homepage-h2 mb-[var(--spacing-md)] text-2xl font-semibold">
            {tPage('faq')}
          </h2>
          <div className="space-y-[var(--spacing-md)]">
            {faqItems.map(faq => (
              <article
                key={faq.title}
                className="border border-[var(--color-border)] p-[var(--spacing-md)]"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none select-none items-center gap-[var(--spacing-xs)] text-base font-medium tracking-tight text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                    <span className="text-xs text-[var(--color-text-muted)] group-open:rotate-90 transition-transform">
                      ▶
                    </span>
                    <h3 itemProp="name" className="font-medium">
                      {faq.title}
                    </h3>
                  </summary>
                  <div
                    className="mt-[var(--spacing-sm)] pl-[var(--spacing-md)]"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div
                      className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light"
                      itemProp="text"
                    >
                      <MarkdownContent content={faq.content} />
                    </div>
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
