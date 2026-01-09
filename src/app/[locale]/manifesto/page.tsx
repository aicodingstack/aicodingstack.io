import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { getManifestoComponent } from '@/lib/generated/manifesto'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.manifesto' })

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'manifesto',
    title: buildTitle({ title: t('title') }),
    description: t('subtitle'),
    keywords: 'AI Coding Manifesto, AI development philosophy, AI coding principles',
    ogType: 'website',
  })
}

export default async function ManifestoPage({ params }: LocalePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.manifesto' })
  const tStack = await getTranslations({ locale, namespace: 'pages.stacks.overview' })
  const ManifestoContent = await getManifestoComponent(locale)

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]">
        <PageHeader title={t('title')} subtitle={t('slogan')} />

        {/* Manifesto Content */}
        <section className="prose prose-neutral dark:prose-invert max-w-none mb-[var(--spacing-xl)]">
          <ManifestoContent />
        </section>

        {/* Explore AI Coding Stack Link */}
        <Link
          href="/ai-coding-stack"
          className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-1 group mb-[var(--spacing-xl)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-xs)]">
                {tStack('title')}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">{tStack('subtitle')}</p>
            </div>
            <span className="text-4xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-2 transition-all">
              →
            </span>
          </div>
        </Link>
      </main>

      <Footer />
    </>
  )
}
