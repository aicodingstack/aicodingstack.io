import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getModelProvider } from '@/lib/data/fetchers'
import { providersData as providers } from '@/lib/generated'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { OrganizationDetailTemplate } from '@/templates'

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

  return (
    <OrganizationDetailTemplate
      organization={{
        ...provider,
        type: provider.type,
        applyKeyUrl: provider.applyKeyUrl,
        platformUrls: provider.platformUrls,
        communityUrls: provider.communityUrls,
      }}
      locale={locale}
      breadcrumbs={[
        { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
        { name: tGlobal('shared.stacks.modelProviders'), href: '/model-providers' },
        { name: provider.name, href: `model-providers/${provider.id}` },
      ]}
      backToHref="/model-providers"
      backToTitle={t('allModelProviders')}
      categoryLabel={t('categoryLabel')}
      translations={{
        type: t('type'),
        typeValue: provider.type ? t(`providerTypes.${provider.type}`) : undefined,
        visitWebsite: t('visitWebsite'),
        documentation: t('documentation'),
        getApiKey: t('getApiKey'),
        platformLinksTitle: t('findOnAiPlatforms'),
        huggingfaceTitle: t('aiPlatforms.huggingface.title'),
        huggingfaceDesc: t('aiPlatforms.huggingface.description'),
        artificialAnalysisTitle: t('aiPlatforms.artificialAnalysis.title'),
        artificialAnalysisDesc: t('aiPlatforms.artificialAnalysis.description'),
        openrouterTitle: t('aiPlatforms.openrouter.title'),
        openrouterDesc: t('aiPlatforms.openrouter.description'),
        communityLinksTitle: t('communityLinks'),
        linkedinTitle: t('community.linkedin.title'),
        linkedinDesc: t('community.linkedin.description'),
        twitterTitle: t('community.twitter.title'),
        twitterDesc: t('community.twitter.description'),
        githubTitle: t('community.github.title'),
        githubDesc: t('community.github.description'),
        youtubeTitle: t('community.youtube.title'),
        youtubeDesc: t('community.youtube.description'),
        discordTitle: t('community.discord.title'),
        discordDesc: t('community.discord.description'),
        redditTitle: t('community.reddit.title'),
        redditDesc: t('community.reddit.description'),
      }}
      showPlatformLinks={true}
      showCommunityLinks={true}
    />
  )
}
