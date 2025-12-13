import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { LinkCardGrid, ProductHero } from '@/components/product'
import type { Locale } from '@/i18n/config'
import { getModelProvider } from '@/lib/data/fetchers'
import { providersData as providers } from '@/lib/generated'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'

export const revalidate = 3600

export async function generateStaticParams() {
  return providers.map(provider => ({
    slug: provider.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const provider = await getModelProvider(slug, locale as Locale)

  if (!provider) {
    return { title: 'Provider Not Found | AI Coding Stack' }
  }

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'modelProviders',
    slug,
    product: {
      name: provider.name,
      description: provider.description,
      vendor: provider.name,
    },
    typeDescription: 'AI Model Provider',
  })
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const provider = await getModelProvider(slug, locale as Locale)

  if (!provider) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.modelProviderDetail' })
  const tGlobal = await getTranslations({ locale })

  const websiteUrl = provider.websiteUrl
  const docsUrl = provider.docsUrl || undefined

  // Configuration for AI platform links
  const AI_PLATFORM_LINKS = [
    {
      key: 'huggingface',
      title: t('aiPlatforms.huggingface.title'),
      description: t('aiPlatforms.huggingface.description'),
    },
    {
      key: 'artificialAnalysis',
      title: t('aiPlatforms.artificialAnalysis.title'),
      description: t('aiPlatforms.artificialAnalysis.description'),
    },
    {
      key: 'openrouter',
      title: t('aiPlatforms.openrouter.title'),
      description: t('aiPlatforms.openrouter.description'),
    },
  ]

  // Configuration for community links
  const COMMUNITY_LINKS = [
    {
      key: 'linkedin',
      title: t('community.linkedin.title'),
      description: t('community.linkedin.description'),
    },
    {
      key: 'twitter',
      title: t('community.twitter.title'),
      description: t('community.twitter.description'),
    },
    {
      key: 'github',
      title: t('community.github.title'),
      description: t('community.github.description'),
    },
    {
      key: 'youtube',
      title: t('community.youtube.title'),
      description: t('community.youtube.description'),
    },
    {
      key: 'discord',
      title: t('community.discord.title'),
      description: t('community.discord.description'),
    },
    {
      key: 'reddit',
      title: t('community.reddit.title'),
      description: t('community.reddit.description'),
    },
  ]

  // Schema.org structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: provider.name,
    description: provider.description,
    url: provider.websiteUrl,
  }

  return (
    <>
      <JsonLd data={organizationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.modelProviders'), href: 'model-providers' },
          { name: provider.name, href: `model-providers/${provider.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={provider.name}
        description={provider.description}
        category="PROVIDER"
        categoryLabel={t('categoryLabel')}
        verified={provider.verified ?? false}
        type={provider.type}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        applyKeyUrl={provider.applyKeyUrl}
        labels={{
          type: t('type'),
          typeValue: provider.type ? t(`providerTypes.${provider.type}`) : undefined,
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          getApiKey: t('getApiKey'),
        }}
      />

      {/* Find on AI Platforms */}
      <LinkCardGrid
        title={t('findOnAiPlatforms')}
        links={AI_PLATFORM_LINKS}
        urls={provider.platformUrls || {}}
        layout="horizontal"
        gridCols="grid-cols-1 md:grid-cols-3"
      />

      {/* Community Links */}
      <LinkCardGrid
        title={t('communityLinks')}
        links={COMMUNITY_LINKS}
        urls={provider.communityUrls || {}}
        layout="vertical"
        gridCols="grid-cols-2 md:grid-cols-4"
      />

      {/* Navigation */}
      <BackToNavigation href="model-providers" title={t('allModelProviders')} />

      <Footer />
    </>
  )
}
