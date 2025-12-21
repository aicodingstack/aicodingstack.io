import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getModel } from '@/lib/data/fetchers'
import { modelsData as models } from '@/lib/generated'
import { generateModelDetailMetadata } from '@/lib/metadata'
import { ModelDetailTemplate } from '@/templates'

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

  return (
    <ModelDetailTemplate
      model={model}
      locale={locale}
      breadcrumbs={[
        { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
        { name: tGlobal('shared.stacks.models'), href: '/models' },
        { name: model.name, href: `models/${model.id}` },
      ]}
      backToHref="/models"
      backToTitle={t('allModels')}
      translations={{
        categoryLabel: t('categoryLabel'),
        vendor: t('vendor'),
        visitWebsite: t('visitWebsite'),
        documentation: t('labels.documentation'),
        platformLinksTitle: t('findOnAiPlatforms'),
        huggingfaceTitle: t('aiPlatforms.huggingface.title'),
        huggingfaceDesc: t('aiPlatforms.huggingface.description'),
        artificialAnalysisTitle: t('aiPlatforms.artificialAnalysis.title'),
        artificialAnalysisDesc: t('aiPlatforms.artificialAnalysis.description'),
        openrouterTitle: t('aiPlatforms.openrouter.title'),
        openrouterDesc: t('aiPlatforms.openrouter.description'),
        title: t('specifications'),
        modelSize: t('modelSize'),
        contextWindow: t('contextWindow'),
        maxOutput: t('maxOutput'),
        pricing: t('pricing'),
        input: 'Input',
        output: 'Output',
        cache: 'Cache',
        benchmarks: {
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
        },
      }}
    />
  )
}
