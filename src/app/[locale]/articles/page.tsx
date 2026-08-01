import { getTranslations } from 'next-intl/server'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { getArticles } from '@/lib/generated/articles'
import { buildTitle, generateStaticPageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.articles' })
  const tShared = await getTranslations({ locale, namespace: 'shared' })

  const title = buildTitle({
    title: `${tShared('terms.articles')} - AI Coding Insights & Tutorials`,
  })
  const description = tPage('subtitle')

  return generateStaticPageMetadata({
    locale: locale as Locale,
    basePath: 'articles',
    title,
    description,
    ogType: 'website',
  })
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.articles' })
  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const articles = getArticles(locale)
  return (
    <>
      <Header />

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <PageHeader title={tShared('terms.articles')} subtitle={tPage('subtitle')} />

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
          {articles.map(article => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex justify-between items-start mb-[var(--spacing-sm)]">
                <h2 className="text-xl font-semibold tracking-tight group-hover:text-[var(--color-text)]">
                  {article.title}
                </h2>
                <span className="text-xl text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all flex-shrink-0 ml-[var(--spacing-sm)]">
                  →
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light mb-[var(--spacing-sm)]">
                {article.description}
              </p>
              <time className="text-xs text-[var(--color-text-muted)]">
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
