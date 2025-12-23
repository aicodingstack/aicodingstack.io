import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { ModelBenchmarks } from '@/components/product/ModelBenchmarks'
import { ModelSpecifications } from '@/components/product/ModelSpecifications'
import { PlatformLinks } from '@/components/product/PlatformLinks'
import { ProductHero } from '@/components/product/ProductHero'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getModel } from '@/lib/data/fetchers'
import { modelsData as models } from '@/lib/generated'
import { generateModelDetailMetadata } from '@/lib/metadata'
import { generateModelDetailSchema } from '@/lib/metadata/schemas'

export const revalidate = 3600

export async function generateStaticParams() {
  return models.map(model => ({
    slug: model.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const model = await getModel(slug)

  if (!model) {
    return { title: 'Model Not Found | AI Coding Stack' }
  }

  return await generateModelDetailMetadata({
    locale: locale as Locale,
    slug,
    model: {
      name: model.name,
      description: model.description || '',
      vendor: model.vendor,
      size: model.size ?? undefined,
      contextWindow: model.contextWindow,
      maxOutput: model.maxOutput,
      tokenPricing: model.tokenPricing
        ? {
            input: model.tokenPricing.input ?? undefined,
            output: model.tokenPricing.output ?? undefined,
          }
        : undefined,
    },
    translationNamespace: 'pages.modelDetail',
  })
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const model = await getModel(slug)

  if (!model) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.modelDetail' })
  const tGlobal = await getTranslations({ locale })

  // Generate JSON-LD schema
  const schema = await generateModelDetailSchema({
    model: {
      name: model.name,
      description: model.description,
      vendor: model.vendor,
      websiteUrl: model.websiteUrl || undefined,
      tokenPricing: model.tokenPricing
        ? {
            input: model.tokenPricing.input ?? undefined,
            output: model.tokenPricing.output ?? undefined,
            cache: model.tokenPricing.cache ?? undefined,
          }
        : undefined,
    },
    locale: locale as 'en' | 'zh-Hans' | 'de' | 'ko',
  })

  // Build additional info for ProductHero
  const additionalInfo = [
    model.size && { label: t('modelSize'), value: model.size },
    { label: t('contextWindow'), value: `${model.contextWindow.toLocaleString()} tokens` },
    { label: t('maxOutput'), value: `${model.maxOutput.toLocaleString()} tokens` },
  ].filter(Boolean) as { label: string; value: string }[]

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

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tGlobal('shared.stacks.models'), href: '/models' },
    { name: model.name, href: `models/${model.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <ProductHero
        name={model.name}
        description={`by ${model.vendor}`}
        vendor={model.vendor}
        category="MODEL"
        categoryLabel={t('categoryLabel')}
        verified={model.verified ?? false}
        additionalInfo={additionalInfo}
        websiteUrl={model.websiteUrl || undefined}
        docsUrl={model.docsUrl || undefined}
        labels={{
          vendor: t('vendor'),
          visitWebsite: t('visitWebsite'),
          documentation: t('labels.documentation'),
        }}
      />

      {model.platformUrls && (
        <PlatformLinks
          platformUrls={model.platformUrls}
          title={t('findOnAiPlatforms')}
          links={platformLinks}
          layout="horizontal"
          gridCols="grid-cols-1 md:grid-cols-3"
        />
      )}

      <ModelSpecifications
        model={model}
        translations={{
          title: t('specifications'),
          modelSize: t('modelSize'),
          contextWindow: t('contextWindow'),
          maxOutput: t('maxOutput'),
          pricing: t('pricing'),
          input: t('input'),
          output: t('output'),
          cache: t('cache'),
        }}
      />

      <ModelBenchmarks
        benchmarks={model.benchmarks}
        translations={{
          title: t('benchmarks.title'),
          sweBench: t('benchmarks.sweBench'),
          sweBenchDesc: t('benchmarks.sweBenchDesc'),
          terminalBench: t('benchmarks.terminalBench'),
          terminalBenchDesc: t('benchmarks.terminalBenchDesc'),
          mmmu: t('benchmarks.mmmu'),
          mmmuDesc: t('benchmarks.mmmuDesc'),
          mmmuPro: t('benchmarks.mmmuPro'),
          mmmuProDesc: t('benchmarks.mmmuProDesc'),
          webDevArena: t('benchmarks.webDevArena'),
          webDevArenaDesc: t('benchmarks.webDevArenaDesc'),
          sciCode: t('benchmarks.sciCode'),
          sciCodeDesc: t('benchmarks.sciCodeDesc'),
          liveCodeBench: t('benchmarks.liveCodeBench'),
          liveCodeBenchDesc: t('benchmarks.liveCodeBenchDesc'),
        }}
      />

      <BackToNavigation href="/models" title={t('allModels')} />
    </PageLayout>
  )
}
