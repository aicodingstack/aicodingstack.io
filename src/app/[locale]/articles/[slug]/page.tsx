import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticles, getArticleBySlug, getArticleComponents } from '@/lib/generated/articles';
import { generateArticleMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  const { locales } = await import('@/i18n/config');
  const params: { slug: string; locale: string }[] = [];

  for (const locale of locales) {
    const articles = getArticles(locale);
    for (const article of articles) {
      params.push({
        slug: article.slug,
        locale,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const article = getArticleBySlug(slug, locale);

  if (!article) {
    return { title: 'Article Not Found | AI Coding Stack' };
  }

  return await generateArticleMetadata({
    locale: locale as 'en' | 'zh-Hans',
    slug,
    article: {
      title: article.title,
      description: article.description,
      date: article.date,
    },
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug, locale } = await params;
  const article = getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  const articleComponents = getArticleComponents(locale);
  const ArticleContent = articleComponents[slug];

  if (!ArticleContent) {
    return (
      <>
        <Header />
        <div className="max-w-[900px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
          <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {article.title}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            This article is coming soon. Check back later!
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mt-[var(--spacing-lg)]"
          >
            <span>←</span>
            Back to Articles
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <section className="py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)]">
        <div className="max-w-[900px] mx-auto px-[var(--spacing-md)]">
          <nav className="flex items-center gap-[var(--spacing-xs)] text-[0.8125rem]">
            <Link
              href="/articles"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Articles
            </Link>
            <span className="text-[var(--color-text-muted)]">/</span>
            <span className="text-[var(--color-text)] font-medium">{article.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-[900px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
        {/* Article Header */}
        <header className="mb-[var(--spacing-xl)]">
          <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)] leading-tight">
            {article.title}
          </h1>
          <time className="text-sm text-[var(--color-text-muted)]">
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        {/* Article Body */}
        <div className="space-y-[var(--spacing-lg)] text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
          <ArticleContent />
        </div>

        {/* Article Footer */}
        <footer className="mt-[var(--spacing-xl)] pt-[var(--spacing-lg)] border-t border-[var(--color-border)]">
          <Link
            href="/articles"
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <span>←</span>
            Back to Articles
          </Link>
        </footer>
      </article>

      <Footer />
    </>
  );
}
