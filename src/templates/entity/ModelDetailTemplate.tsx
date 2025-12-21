import { ProductHero } from '@/components/product'
import { generateModelDetailSchema } from '@/lib/metadata/schemas'
import type { ManifestModel } from '@/types/manifests'
import { EntityBenchmarks, EntityPlatformLinks, EntitySpecifications } from '../sections'
import { EntityDetailTemplate } from './EntityDetailTemplate'

export interface ModelDetailTemplateProps {
  model: ManifestModel
  locale: string
  schema?: ReturnType<typeof generateModelDetailSchema> extends Promise<infer T> ? T : never
  breadcrumbs: Array<{ name: string; href: string }>
  backToHref: string
  backToTitle: string
  translations: {
    // ProductHero
    categoryLabel: string
    vendor?: string
    visitWebsite?: string
    documentation?: string
    // Platform links
    platformLinksTitle?: string
    huggingfaceTitle?: string
    huggingfaceDesc?: string
    artificialAnalysisTitle?: string
    artificialAnalysisDesc?: string
    openrouterTitle?: string
    openrouterDesc?: string
    // Specifications
    title: string
    modelSize: string
    contextWindow: string
    maxOutput: string
    pricing: string
    input: string
    output: string
    cache: string
    // Benchmarks
    benchmarks: {
      title: string
      sweBench: string
      sweBenchDesc: string
      terminalBench: string
      terminalBenchDesc: string
      mmmu: string
      mmmuDesc: string
      mmmuPro: string
      mmmuProDesc: string
      webDevArena: string
      webDevArenaDesc: string
      sciCode: string
      sciCodeDesc: string
      liveCodeBench: string
      liveCodeBenchDesc: string
    }
  }
}

/**
 * ModelDetailTemplate - Extends EntityDetailTemplate
 *
 * Mirrors: ManifestModel (independent structure)
 *
 * Specialized template for AI model detail pages.
 * Uses base template + model-specific sections (Specifications, Benchmarks).
 *
 * @example Usage
 * ```tsx
 * <ModelDetailTemplate
 *   model={model}
 *   locale={locale}
 *   schema={modelSchema}
 *   breadcrumbs={breadcrumbItems}
 *   backToHref="/models"
 *   backToTitle="All Models"
 *   translations={translations}
 * />
 * ```
 */
export async function ModelDetailTemplate({
  model,
  locale,
  schema,
  breadcrumbs,
  backToHref,
  backToTitle,
  translations,
}: ModelDetailTemplateProps) {
  // Generate schema if not provided
  const modelSchema =
    schema ||
    (await generateModelDetailSchema({
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
    }))

  // Build additional info for ProductHero
  const additionalInfo = [
    model.size && { label: translations.modelSize, value: model.size },
    { label: translations.contextWindow, value: `${model.contextWindow.toLocaleString()} tokens` },
    { label: translations.maxOutput, value: `${model.maxOutput.toLocaleString()} tokens` },
  ].filter(Boolean) as { label: string; value: string }[]

  // Build platform links configuration
  const platformLinks = [
    {
      key: 'huggingface',
      title: translations.huggingfaceTitle || 'Hugging Face',
      description: translations.huggingfaceDesc || 'View on Hugging Face',
    },
    {
      key: 'artificialAnalysis',
      title: translations.artificialAnalysisTitle || 'Artificial Analysis',
      description: translations.artificialAnalysisDesc || 'View benchmarks',
    },
    {
      key: 'openrouter',
      title: translations.openrouterTitle || 'OpenRouter',
      description: translations.openrouterDesc || 'View on OpenRouter',
    },
  ]

  return (
    <EntityDetailTemplate
      entity={{
        id: model.id,
        name: model.name,
        description: model.description,
        translations: model.translations,
        verified: model.verified ?? false,
        websiteUrl: model.websiteUrl ?? '',
        docsUrl: model.docsUrl ?? undefined,
      }}
      locale={locale}
      schema={modelSchema}
      breadcrumbs={breadcrumbs}
      backToHref={backToHref}
      backToTitle={backToTitle}
    >
      {/* ProductHero */}
      <ProductHero
        name={model.name}
        description={`by ${model.vendor}`}
        vendor={model.vendor}
        category="MODEL"
        categoryLabel={translations.categoryLabel}
        verified={model.verified ?? false}
        additionalInfo={additionalInfo}
        websiteUrl={model.websiteUrl || undefined}
        docsUrl={model.docsUrl || undefined}
        labels={{
          vendor: translations.vendor,
          visitWebsite: translations.visitWebsite,
          documentation: translations.documentation,
        }}
      />

      {/* Platform Links */}
      {model.platformUrls && (
        <EntityPlatformLinks
          platformUrls={model.platformUrls}
          title={translations.platformLinksTitle || 'Find on AI Platforms'}
          links={platformLinks}
          layout="horizontal"
          gridCols="grid-cols-1 md:grid-cols-3"
        />
      )}

      {/* Specifications */}
      <EntitySpecifications
        model={model}
        translations={{
          title: translations.title,
          modelSize: translations.modelSize,
          contextWindow: translations.contextWindow,
          maxOutput: translations.maxOutput,
          pricing: translations.pricing,
          input: translations.input,
          output: translations.output,
          cache: translations.cache,
        }}
      />

      {/* Benchmarks */}
      <EntityBenchmarks benchmarks={model.benchmarks} translations={translations.benchmarks} />
    </EntityDetailTemplate>
  )
}
