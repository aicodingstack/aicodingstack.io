import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { ProductHero } from '@/components/product'
import type { Locale } from '@/i18n/config'
import { BENCHMARK_KEYS, formatBenchmarkValue, hasBenchmarks } from '@/lib/benchmarks'
import { getModel } from '@/lib/data/fetchers'
import { formatTokenCount } from '@/lib/format'
import { modelsData as models } from '@/lib/generated'
import { generateModelDetailMetadata } from '@/lib/metadata'

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

  // Schema.org structured data
  const pricingDisplayForSchema = model.tokenPricing?.input
    ? model.tokenPricing.input.toString()
    : model.tokenPricing?.output
      ? model.tokenPricing.output.toString()
      : null
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    description: `${model.name} by ${model.vendor}`,
    brand: {
      '@type': 'Organization',
      name: model.vendor,
    },
    offers: pricingDisplayForSchema
      ? {
          '@type': 'Offer',
          price: pricingDisplayForSchema,
          priceCurrency: 'USD',
        }
      : undefined,
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.models'), href: 'models' },
          { name: model.name, href: `models/${model.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={model.name}
        description={`by ${model.vendor}`}
        vendor={model.vendor}
        category="MODEL"
        categoryLabel={t('categoryLabel')}
        verified={model.verified ?? false}
        additionalInfo={
          [
            model.size && { label: t('labels.size'), value: model.size },
            {
              label: t('labels.context'),
              value: formatTokenCount(model.contextWindow),
            },
            {
              label: t('labels.maxOutput'),
              value: formatTokenCount(model.maxOutput),
            },
          ].filter(Boolean) as { label: string; value: string }[]
        }
        additionalUrls={
          [
            model.docsUrl && {
              label: t('labels.documentation'),
              url: model.docsUrl,
              icon: '→',
            },
            model.websiteUrl && { label: t('labels.website'), url: model.websiteUrl, icon: '↗' },
            model.platformUrls?.huggingface && {
              label: t('labels.huggingface'),
              url: model.platformUrls.huggingface,
              icon: '→',
            },
            model.platformUrls?.artificialAnalysis && {
              label: t('labels.artificialAnalysis'),
              url: model.platformUrls.artificialAnalysis,
              icon: '→',
            },
            model.platformUrls?.openrouter && {
              label: t('labels.openrouter'),
              url: model.platformUrls.openrouter,
              icon: '→',
            },
          ].filter(Boolean) as { label: string; url: string; icon?: string }[]
        }
        labels={{
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
        }}
      />

      {/* Specifications */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
            {t('specifications')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
            {model.size && (
              <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
                <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                  {t('modelSize')}
                </h3>
                <p className="text-lg font-semibold tracking-tight">{model.size}</p>
              </div>
            )}

            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {t('contextWindow')}
              </h3>
              <p className="text-lg font-semibold tracking-tight">
                {formatTokenCount(model.contextWindow)}
              </p>
            </div>

            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {t('maxOutput')}
              </h3>
              <p className="text-lg font-semibold tracking-tight">
                {formatTokenCount(model.maxOutput)}
              </p>
            </div>

            {model.tokenPricing && (
              <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
                <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                  {t('pricing')}
                </h3>
                <div className="space-y-1">
                  {model.tokenPricing.input !== null && model.tokenPricing.input !== undefined && (
                    <p className="text-sm">
                      <span className="text-[var(--color-text-muted)] text-xs">Input: </span>
                      <span className="font-semibold tracking-tight">
                        ${model.tokenPricing.input}/M
                      </span>
                    </p>
                  )}
                  {model.tokenPricing.output !== null &&
                    model.tokenPricing.output !== undefined && (
                      <p className="text-sm">
                        <span className="text-[var(--color-text-muted)] text-xs">Output: </span>
                        <span className="font-semibold tracking-tight">
                          ${model.tokenPricing.output}/M
                        </span>
                      </p>
                    )}
                  {model.tokenPricing.cache !== null && model.tokenPricing.cache !== undefined && (
                    <p className="text-sm">
                      <span className="text-[var(--color-text-muted)] text-xs">Cache: </span>
                      <span className="font-semibold tracking-tight">
                        ${model.tokenPricing.cache}/M
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Performance Benchmarks */}
      {model.benchmarks && hasBenchmarks(model.benchmarks) && (
        <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
          <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
              {t('benchmarks.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
              {BENCHMARK_KEYS.map(key => {
                const value = model.benchmarks?.[key]
                if (value === null || value === undefined) return null

                return (
                  <div
                    key={key}
                    className="border border-[var(--color-border)] p-[var(--spacing-md)]"
                  >
                    <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                      {t(`benchmarks.${key}`)}
                    </h3>
                    <p className="text-lg font-semibold tracking-tight mb-1">
                      {formatBenchmarkValue(key, value)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t(`benchmarks.${key}Desc`)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <BackToNavigation href="/models" title={t('allModels')} />

      <Footer />
    </>
  )
}
