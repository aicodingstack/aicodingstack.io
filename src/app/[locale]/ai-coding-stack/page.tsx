import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'
import type { LocalePageProps } from '@/types/locale'

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.stacks.overview' })

  const title = buildTitle({ title: tPage('title') })
  const description = tPage('subtitle')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'ai-coding-stack',
    title,
    description,
    keywords:
      'AI Coding Stack, AI development tools, AI IDE, AI CLI, LLM models, AI coding ecosystem',
    ogType: 'website',
  })
}

export default async function AICodingStackPage({ params }: LocalePageProps) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.stacks.overview' })

  return (
    <>
      <Header />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <PageHeader title={tPage('title')} subtitle={tPage('subtitle')} />

        {/* Stacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)]">
          {[
            { key: 'ides', path: 'ides' },
            { key: 'clis', path: 'clis' },
            { key: 'extensions', path: 'extensions' },
            { key: 'models', path: 'models' },
            { key: 'modelProviders', path: 'model-providers' },
            { key: 'vendors', path: 'vendors' },
          ].map(stack => (
            <Link
              key={stack.key}
              href={`/${stack.path}`}
              className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex justify-between items-start mb-[var(--spacing-md)]">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {tPage(`${stack.key}.title`)}
                </h3>
                <span className="text-2xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
                {tPage(`${stack.key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
