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
    translationNamespace: 'pages.stacks.modelDetail',
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

  const t = await getTranslations({ locale, namespace: 'pages.stacks.modelDetail' })
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

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tGlobal('shared.terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tGlobal('shared.categories.plural.models'), href: '/models' },
    { name: model.name, href: `models/${model.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
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
        />

        <PlatformLinks
          platformUrls={model.platformUrls}
          layout="horizontal"
          gridCols="grid-cols-1 md:grid-cols-3"
        />

        <ModelSpecifications model={model} />

        <ModelBenchmarks benchmarks={model.benchmarks} />

        <BackToNavigation href="/models" title={t('allModels')} />
      </main>
    </PageLayout>
  )
}
