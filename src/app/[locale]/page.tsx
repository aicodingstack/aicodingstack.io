import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { MarkdownContent } from '@/components/MarkdownContent'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { faqMetadata } from '@/lib/generated/metadata'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import { generateFAQPageSchema } from '@/lib/metadata/schemas'
import type { LocalePageProps } from '@/types/locale'

export const revalidate = 3600

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.home.meta' })

  const title = buildTitle({ title: t('title'), includeSiteName: false })
  const description = t('description')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: '',
    title,
    description,
    keywords:
      'AI coding, AI IDE, AI CLI, AI extensions, LLM models, AI coding tools, Cursor, Claude Code, VS Code',
    ogType: 'website',
    pageType: 'home',
  })
}

async function getFaqSchema(locale: string) {
  const faqItems = faqMetadata[locale] || faqMetadata.en || []

  // Use the new schema generator
  return await generateFAQPageSchema(
    faqItems.map(faq => ({
      question: faq.title,
      answer: faq.content,
    }))
  )
}

export default async function Home({ params }: LocalePageProps) {
  const { locale } = await params
  const tHome = await getTranslations({ locale, namespace: 'pages.home' })
  const tFeatures = await getTranslations({ locale, namespace: 'pages.home.features' })
  const faqItems = faqMetadata[locale] || faqMetadata.en || []
  const faqSchema = await getFaqSchema(locale)

  return (
    <>
      <JsonLd data={faqSchema} />
      <Header />

      {/* Hero Section */}
      <section className="my-[var(--spacing-lg)]">
        <div className="max-w-6xl mx-auto px-[var(--spacing-md)]">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-[var(--spacing-md)] overflow-x-auto">
              <pre className="text-[0.3rem] md:text-[0.45rem] leading-[1.3] inline-block text-left bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                {`╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                   ║
║     █████╗ ██╗     ██████╗ ██████╗ ██████╗ ██╗███╗   ██╗ ██████╗     ███████╗████████╗ █████╗  ██████╗██╗  ██╗    ║
║    ██╔══██╗██║    ██╔════╝██╔═══██╗██╔══██╗██║████╗  ██║██╔════╝     ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ║
║    ███████║██║    ██║     ██║   ██║██║  ██║██║██╔██╗ ██║██║  ███╗    ███████╗   ██║   ███████║██║     █████╔╝     ║
║    ██╔══██║██║    ██║     ██║   ██║██║  ██║██║██║╚██╗██║██║   ██║    ╚════██║   ██║   ██╔══██║██║     ██╔═██╗     ║
║    ██║  ██║██║    ╚██████╗╚██████╔╝██████╔╝██║██║ ╚████║╚██████╔╝    ███████║   ██║   ██║  ██║╚██████╗██║  ██╗    ║
║    ╚═╝  ╚═╝╚═╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ║
║                                                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝`}
              </pre>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-[var(--spacing-md)] homepage-h1">
              {tHome('title')}
            </h1>

            <p className="text-base leading-[1.8] text-[var(--color-text-secondary)] mb-[var(--spacing-lg)] font-light">
              {tHome('subtitle')}
              <br />
              {tHome('description')}
            </p>

            {/* CTA Section */}
            <div className="flex gap-[var(--spacing-md)] justify-center flex-wrap mx-auto">
              <Link
                href="/ai-coding-stack"
                className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-[var(--color-text)] text-[var(--color-bg)] hover:bg-[var(--color-text-secondary)] transition-all"
              >
                {tHome('exploreTools')}
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-all"
              >
                {tHome('readDocs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="my-[var(--spacing-lg)] max-w-8xl mx-auto px-[var(--spacing-md)]"
      >
        <div className="border-y border-[var(--color-border)] pb-[var(--spacing-lg)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold homepage-h2 my-[var(--spacing-lg)]">
              {tFeatures('title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
              {(['directory', 'comparison', 'ecosystem', 'tracking'] as const).map(featureKey => {
                const iconMap: Record<string, string> = {
                  directory: 'DIR',
                  comparison: 'CMP',
                  ecosystem: 'ECO',
                  tracking: 'TRK',
                }

                return (
                  <div
                    key={featureKey}
                    className="border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5"
                  >
                    <pre className="text-xs leading-tight text-[var(--color-text-muted)] mb-[var(--spacing-md)]">
                      {`┌─────┐
│ ${iconMap[featureKey]} │
└─────┘`}
                    </pre>
                    <h3 className="text-base font-semibold tracking-tight mb-[var(--spacing-sm)]">
                      {tFeatures(`${featureKey}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
                      {tFeatures(`${featureKey}.description`)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="my-[var(--spacing-lg)] max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold homepage-h2 my-[var(--spacing-lg)]">
          {tHome('faq')}
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
                <summary className="text-base font-medium tracking-tight cursor-pointer list-none select-none flex items-center gap-[var(--spacing-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                  <span className="text-[var(--color-text-muted)] text-xs group-open:rotate-90 transition-transform">
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

      <Footer />
    </>
  )
}
