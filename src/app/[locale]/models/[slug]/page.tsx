import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ModelCompareSelector } from '@/components/controls/ModelCompareSelector'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { ModelBenchmarks } from '@/components/product/ModelBenchmarks'
import { ModelSpecifications } from '@/components/product/ModelSpecifications'
import { PlatformLinks } from '@/components/product/PlatformLinks'
import { ProductHero } from '@/components/product/ProductHero'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { PageLayout } from '@/layouts/PageLayout'
import { getModel } from '@/lib/data/fetchers'
import { modelsData as models, vendorsData } from '@/lib/generated'
import { generateModelDetailMetadata } from '@/lib/metadata'
import { generateModelDetailSchema } from '@/lib/metadata/schemas'
import { findVendorByName } from '@/lib/vendor-identity'

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
      maxOutput: model.maxOutput ?? undefined,
      lifecycle: model.lifecycle,
      tokenPricing: model.tokenPricing,
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

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const vendorRecord = findVendorByName(vendorsData, model.vendor)
  const vendorHref = vendorRecord ? `/vendors/${vendorRecord.id}` : undefined

  // Generate JSON-LD schema
  const schema = await generateModelDetailSchema({
    model: {
      name: model.name,
      description: model.description,
      vendor: model.vendor,
      websiteUrl: model.websiteUrl || undefined,
      lifecycle: model.lifecycle,
      tokenPricing: model.tokenPricing,
    },
    locale: locale as Locale,
  })

  // Build additional info for ProductHero
  const additionalInfo = [
    model.size && { label: tShared('terms.modelSize'), value: model.size },
    {
      label: tShared('terms.contextWindow'),
      value: `${model.contextWindow.toLocaleString()} tokens`,
    },
    model.maxOutput !== null && {
      label: tShared('terms.maxOutput'),
      value: `${model.maxOutput.toLocaleString()} tokens`,
    },
  ].filter(Boolean) as { label: string; value: string }[]

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.models'), href: '/models' },
    { name: model.name, href: `models/${model.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={model.name}
          description={
            <>
              {tShared('terms.by')}{' '}
              {vendorHref ? (
                <Link
                  href={vendorHref}
                  className="font-medium underline-offset-4 hover:underline hover:text-[var(--color-text)] transition-colors"
                >
                  {model.vendor}
                </Link>
              ) : (
                model.vendor
              )}
            </>
          }
          vendor={model.vendor}
          vendorHref={vendorHref}
          category="MODEL"
          categoryLabel={tShared('categories.singular.model')}
          verified={model.verified ?? false}
          additionalInfo={additionalInfo}
          websiteUrl={model.websiteUrl || undefined}
          docsUrl={model.docsUrl || undefined}
        />

        <div className="flex justify-end py-[var(--spacing-sm)] border-b border-[var(--color-border)]">
          <ModelCompareSelector currentModelId={model.id} />
        </div>

        <PlatformLinks platformUrls={model.platformUrls} />

        <ModelSpecifications model={model} />

        <ModelBenchmarks benchmarks={model.benchmarks} />

        <BackToNavigation href="/models" title={tShared('categories.all.models')} />
      </main>
    </PageLayout>
  )
}
