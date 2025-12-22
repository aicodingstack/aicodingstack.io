import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CommunityLinks } from '@/components/CommunityLinks'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { PlatformLinks } from '@/components/PlatformLinks'
import { ProductHero } from '@/components/product/ProductHero'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getModelProvider } from '@/lib/data/fetchers'
import { providersData as providers } from '@/lib/generated'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateVendorSchema } from '@/lib/metadata/schemas'

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

  // Generate JSON-LD schema
  const schema = await generateVendorSchema({
    vendor: {
      name: provider.name,
      description: provider.description,
      websiteUrl: provider.websiteUrl || '',
    },
    locale: locale as 'en' | 'zh-Hans' | 'de' | 'ko',
  })

  // Build platform links configuration
  const platformLinks = [
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

  // Build community links configuration
  const communityLinks = [
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

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tGlobal('shared.stacks.modelProviders'), href: '/model-providers' },
    { name: provider.name, href: `model-providers/${provider.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <ProductHero
        name={provider.name}
        description={provider.description}
        category="PROVIDER"
        categoryLabel={t('categoryLabel')}
        verified={provider.verified ?? false}
        type={provider.type}
        websiteUrl={provider.websiteUrl}
        docsUrl={provider.docsUrl ?? null}
        applyKeyUrl={provider.applyKeyUrl}
        labels={{
          type: t('type'),
          typeValue: provider.type ? t(`providerTypes.${provider.type}`) : undefined,
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          getApiKey: t('getApiKey'),
        }}
      />

      {provider.platformUrls && (
        <PlatformLinks
          platformUrls={provider.platformUrls}
          title={t('findOnAiPlatforms')}
          links={platformLinks}
          layout="horizontal"
          gridCols="grid-cols-1 md:grid-cols-3"
        />
      )}

      {provider.communityUrls && (
        <CommunityLinks
          communityUrls={provider.communityUrls}
          title={t('communityLinks')}
          links={communityLinks}
          layout="vertical"
          gridCols="grid-cols-2 md:grid-cols-4"
        />
      )}

      <BackToNavigation href="/model-providers" title={t('allModelProviders')} />
    </PageLayout>
  )
}
