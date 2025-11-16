import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticles } from '@/lib/generated/articles';
import { getTranslations } from 'next-intl/server';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, buildTitle } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.articles' });

  const canonicalPath = locale === 'en' ? '/articles' : `/${locale}/articles`;
  const title = buildTitle({ title: `${t('title')} - AI Coding Insights & Tutorials` });
  const description = t('subtitle');

  return {
    title,
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/articles',
        'zh-Hans': '/zh-Hans/articles',
      },
    },
    openGraph: buildOpenGraph({
      title: `${t('title')} - AI Coding Insights & Tutorials`,
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: `${t('title')} - AI Coding Insights & Tutorials`,
      description,
    }),
  };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  const articles = getArticles(locale);
  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
        {/* Page Header */}
        <div className="text-center mb-[var(--spacing-xl)]">
          <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
            Articles
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            Insights, tutorials, and deep dives into the AI coding ecosystem
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
          {articles.map((article) => (
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
  );
}
