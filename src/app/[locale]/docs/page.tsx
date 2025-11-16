import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocsSidebar from '@/components/sidebar/DocsSidebar';
import { getDocSections, getDocComponents } from '@/lib/generated/docs';
import { getTranslations } from 'next-intl/server';
import { buildCanonicalUrl, buildOpenGraph, buildTwitterCard, buildTitle } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.docs' });

  const canonicalPath = locale === 'en' ? '/docs' : `/${locale}/docs`;
  const title = buildTitle({ title: t('title') });
  const description = t('subtitle');

  return {
    title,
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: '/docs',
        'zh-Hans': '/zh-Hans/docs',
      },
    },
    openGraph: buildOpenGraph({
      title: t('title'),
      description,
      url: buildCanonicalUrl({ path: canonicalPath, locale }),
      locale,
      type: 'website',
    }),
    twitter: buildTwitterCard({
      title: t('title'),
      description,
    }),
  };
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  const docSections = getDocSections(locale);
  const docComponents = getDocComponents(locale);
  const WelcomeDoc = docComponents['welcome'];
  return (
    <>
      <Header />

      <div className="max-w-[1400px] mx-auto px-[var(--spacing-md)] py-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-lg)]">
          <DocsSidebar sections={docSections} activeSlug="welcome" />

          {/* Main Content */}
          <main className="flex-1 max-w-[800px]">
            <article className="space-y-[var(--spacing-lg)] text-base leading-[1.8] text-[var(--color-text-secondary)] font-light">
              {WelcomeDoc && <WelcomeDoc />}
            </article>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
