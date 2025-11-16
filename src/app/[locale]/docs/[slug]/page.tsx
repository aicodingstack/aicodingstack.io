import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocsSidebar from '@/components/sidebar/DocsSidebar';
import { getDocSections, getDocBySlug, getDocComponents } from '@/lib/generated/docs';
import { generateDocsMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const { locales } = await import('@/i18n/config');
  const staticParams: Array<{ locale: string; slug: string }> = [];

  for (const locale of locales) {
    const docSections = getDocSections(locale);
    for (const doc of docSections) {
      staticParams.push({ locale, slug: doc.slug });
    }
  }

  return staticParams;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    return {
      title: 'Documentation Not Found | AI Coding Stack',
    };
  }

  return await generateDocsMetadata({
    locale: locale as 'en' | 'zh-Hans',
    slug,
    doc: {
      title: doc.title,
      description: `Learn about ${doc.title} in AI Coding Stack documentation.`,
    },
  });
}

export default async function DocPage({ params }: Props) {
  const { locale, slug } = await params;
  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    notFound();
  }

  const docSections = getDocSections(locale);
  const docComponents = getDocComponents(locale);
  const DocContent = docComponents[slug];

  if (!DocContent) {
    return (
      <>
        <Header />
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
          <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {doc.title}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            This documentation page is coming soon. Check back later!
          </p>
          <Link
            href={`/${locale}/docs`}
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mt-[var(--spacing-lg)]"
          >
            <span>←</span>
            Back to Documentation
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <DocsSidebar sections={docSections} activeSlug={slug} />

          {/* Main Content */}
          <main className="flex-1 max-w-[800px]">
            <article className="space-y-[var(--spacing-lg)] text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
              <DocContent />
            </article>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
