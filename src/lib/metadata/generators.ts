/**
 * Metadata Generator Functions
 * High-level functions for generating complete metadata for different page types
 * All generators return createPageMetadata(...) output with proper robots rules
 */

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { formatTokenCount } from '@/lib/format'
import {
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_EXAMPLES,
  CATEGORY_SEO_KEYWORDS,
  type Category,
  type Locale,
  METADATA_DEFAULTS,
} from './config'
import {
  buildAlternates,
  buildDetailPageTitle,
  buildKeywords,
  buildListPageTitle,
  buildOpenGraph,
  buildProductDescription,
  buildTwitterCard,
  formatPlatforms,
  formatPriceForDescription,
} from './helpers'
import { createPageMetadata, type PageType } from './templates'

/**
 * Internal helper: Build complete metadata with alternates, OpenGraph, and Twitter Card
 * Consolidates the common pattern across all generators
 */
interface CommonMetadataOptions {
  locale: Locale
  pageType: PageType
  canonicalPath: string
  languageBasePath?: string
  title: string
  description: string
  keywords?: string
  // OpenGraph specific
  ogTitle?: string
  ogDescription?: string
  ogType?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  // Twitter specific
  twitterTitle?: string
  twitterDescription?: string
  includeCreator?: boolean
}

/**
 * Build metadata with alternates, OpenGraph, and Twitter in one go
 * Internal function to reduce duplication across generators
 */
function buildMetadataWithSocial(options: CommonMetadataOptions): Metadata {
  // Build alternates (canonical + hreflang)
  const alternates = buildAlternates({
    canonicalPath: options.canonicalPath,
    locale: options.locale,
    languageBasePath: options.languageBasePath ?? options.canonicalPath,
  })

  // Build OpenGraph using canonical path
  const openGraph = buildOpenGraph({
    title: options.ogTitle ?? options.title,
    description: options.ogDescription ?? options.description,
    url: alternates.canonical!,
    locale: options.locale,
    type: options.ogType ?? 'website',
    publishedTime: options.publishedTime,
    modifiedTime: options.modifiedTime,
  })

  // Build Twitter Card
  const twitter = buildTwitterCard({
    title: options.twitterTitle ?? options.title,
    description: options.twitterDescription ?? options.description,
    includeCreator: options.includeCreator ?? false,
  })

  // Create page metadata
  return createPageMetadata({
    locale: options.locale,
    pageType: options.pageType,
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
  })
}

/**
 * Generate metadata for category list pages (IDEs, CLIs, etc.)
 * Returns complete metadata with robots rules via PageType 'list'
 */
export async function generateListPageMetadata(options: {
  locale: Locale
  category: Category
  translationNamespace: string
  additionalKeywords?: string[]
}): Promise<Metadata> {
  const { locale, category, translationNamespace, additionalKeywords = [] } = options

  const tPage = await getTranslations({ locale, namespace: translationNamespace })

  const translatedTitle = tPage('title')
  const description = tPage('subtitle')

  // Build SEO-optimized title
  const categoryExamples = CATEGORY_EXAMPLES[category as keyof typeof CATEGORY_EXAMPLES]
  const categoryKeywords = CATEGORY_SEO_KEYWORDS[category as keyof typeof CATEGORY_SEO_KEYWORDS]

  const title = buildListPageTitle({
    translatedTitle,
    categoryName:
      CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || translatedTitle,
    examples: categoryExamples ? [...categoryExamples] : [],
    year: METADATA_DEFAULTS.currentYear,
  })

  // Build keywords
  const keywords = buildKeywords([
    categoryKeywords ? [...categoryKeywords] : [],
    additionalKeywords,
  ])

  // Build social media titles
  const displayName =
    CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || translatedTitle
  const socialTitle = `${translatedTitle} - Best ${displayName} ${METADATA_DEFAULTS.currentYear}`

  // Use common metadata builder
  return buildMetadataWithSocial({
    locale,
    pageType: 'list',
    canonicalPath: category,
    title,
    description,
    keywords,
    ogTitle: socialTitle,
    ogDescription: description,
    ogType: 'website',
    twitterTitle: socialTitle,
    twitterDescription: description,
  })
}

/**
 * Generate metadata for software product detail pages (IDEs, CLIs, Extensions)
 * Returns complete metadata with robots rules via PageType 'detail'
 */
export async function generateSoftwareDetailMetadata(options: {
  locale: Locale
  category: Category
  slug: string
  product: {
    name: string
    description: string
    vendor: string
    platforms?: Array<{ os: string }> | string[]
    pricing?: Array<{ value: number | null; currency?: string | null; per?: string | null }>
    license?: string
  }
  typeDescription: string
}): Promise<Metadata> {
  const { locale, category, slug, product, typeDescription } = options

  // Build title
  const title = buildDetailPageTitle({
    productName: product.name,
    typeDescription,
    year: METADATA_DEFAULTS.currentYear,
  })

  // Build description with product specs
  const platformsStr = formatPlatforms(product.platforms)
  const pricingStr = formatPriceForDescription(product.pricing)

  const description = buildProductDescription({
    baseDescription: product.description,
    productName: product.name,
    platforms: platformsStr,
    pricing: pricingStr || undefined,
    license: product.license,
  })

  // Build keywords
  const keywords = buildKeywords([
    product.name,
    product.vendor,
    [...(CATEGORY_SEO_KEYWORDS[category as keyof typeof CATEGORY_SEO_KEYWORDS] || [])],
    platformsStr,
  ])

  // Social media titles
  const socialTitle = `${product.name} - ${typeDescription}`

  // Use common metadata builder
  // Note: OG and Twitter images are automatically detected from opengraph-image.tsx files
  return buildMetadataWithSocial({
    locale,
    pageType: 'detail',
    canonicalPath: `${category}/${slug}`,
    title,
    description,
    keywords,
    ogTitle: socialTitle,
    ogDescription: product.description,
    ogType: 'article',
    twitterTitle: socialTitle,
    twitterDescription: product.description,
  })
}

/**
 * Generate metadata for model detail pages
 * Returns complete metadata with robots rules via PageType 'detail'
 */
export async function generateModelDetailMetadata(options: {
  locale: Locale
  slug: string
  model: {
    name: string
    description: string
    vendor: string
    size?: string
    contextWindow?: number
    maxOutput?: number
    tokenPricing?: {
      input?: number
      output?: number
    }
  }
  translationNamespace: string
}): Promise<Metadata> {
  const { locale, slug, model, translationNamespace } = options

  const tPage = await getTranslations({ locale, namespace: translationNamespace })

  // Build title with model-specific translation
  const title = `${model.name} - ${tPage('metaTitle')}`

  // Build description with model specs
  const specs: string[] = []
  if (model.size) specs.push(`${tPage('modelSize')}: ${model.size}`)
  if (model.contextWindow)
    specs.push(`${tPage('contextWindow')}: ${formatTokenCount(model.contextWindow)} tokens`)
  if (model.maxOutput)
    specs.push(`${tPage('maxOutput')}: ${formatTokenCount(model.maxOutput)} tokens`)

  const pricingDisplay = model.tokenPricing?.input
    ? `$${model.tokenPricing.input}/M tokens`
    : model.tokenPricing?.output
      ? `$${model.tokenPricing.output}/M tokens`
      : null

  if (pricingDisplay) specs.push(`${tPage('pricing')}: ${pricingDisplay}`)

  const description = `${model.name} by ${model.vendor}. ${specs.join('. ')}. ${model.description}`

  // Build keywords
  const keywords = buildKeywords([
    model.name,
    model.vendor,
    model.size || '',
    [...CATEGORY_SEO_KEYWORDS.models],
  ])

  // Social media titles
  const socialTitle = `${model.name} - ${tPage('metaTitle')}`

  // Use common metadata builder
  // Note: OG and Twitter images are automatically detected from opengraph-image.tsx files
  return buildMetadataWithSocial({
    locale,
    pageType: 'detail',
    canonicalPath: `models/${slug}`,
    title,
    description,
    keywords,
    ogTitle: socialTitle,
    ogDescription: model.description,
    ogType: 'article',
    twitterTitle: socialTitle,
    twitterDescription: model.description,
  })
}

/**
 * Generate metadata for comparison pages
 * Returns complete metadata with robots rules via PageType 'comparison'
 */
export async function generateComparisonMetadata(options: {
  locale: Locale
  category: Category
}): Promise<Metadata> {
  const { locale, category } = options

  const categoryName = CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || ''

  // Get translations for comparison page
  const tPage = await getTranslations({ locale, namespace: 'pages.comparison' })

  // Build title and description using category-specific translations
  const title = `${tPage(`${category}.title`)} - ${categoryName} Comparison | ${METADATA_DEFAULTS.siteName}`
  const description = tPage(`${category}.subtitle`)

  // Build keywords
  const keywords = buildKeywords([
    `${category} comparison`,
    'compare',
    'specifications',
    'pricing',
    'side-by-side',
    [...(CATEGORY_SEO_KEYWORDS[category as keyof typeof CATEGORY_SEO_KEYWORDS] || [])],
  ])

  // Social media titles
  const socialTitle = `${categoryName} Comparison`

  // Use common metadata builder
  return buildMetadataWithSocial({
    locale,
    pageType: 'comparison',
    canonicalPath: `${category}/comparison`,
    title,
    description,
    keywords,
    ogTitle: socialTitle,
    ogDescription: description,
    ogType: 'website',
    twitterTitle: socialTitle,
    twitterDescription: description,
  })
}

/**
 * Generate metadata for article pages
 * Returns complete metadata with robots rules via PageType 'article'
 */
export async function generateArticleMetadata(options: {
  locale: Locale
  slug: string
  article: {
    title: string
    description: string
    date: string
    author?: string
  }
}): Promise<Metadata> {
  const { locale, slug, article } = options

  // Build title
  const title = `${article.title} | ${METADATA_DEFAULTS.siteName} Articles`

  // Build description
  const description = article.description

  // Build keywords
  const keywords = buildKeywords([article.title, [...CATEGORY_SEO_KEYWORDS.articles]])

  // Use common metadata builder
  // Note: OG and Twitter images are automatically detected from opengraph-image.tsx files
  return buildMetadataWithSocial({
    locale,
    pageType: 'article',
    canonicalPath: `articles/${slug}`,
    title,
    description,
    keywords,
    ogTitle: article.title,
    ogDescription: description,
    ogType: 'article',
    publishedTime: article.date,
    twitterTitle: article.title,
    twitterDescription: description,
    includeCreator: true,
  })
}

/**
 * Generate metadata for documentation pages
 * Returns complete metadata with robots rules via PageType 'docs'
 */
export async function generateDocsMetadata(options: {
  locale: Locale
  slug: string
  doc: {
    title: string
    description: string
  }
}): Promise<Metadata> {
  const { locale, slug, doc } = options

  // Build title
  const title = `${doc.title} | ${METADATA_DEFAULTS.siteName} Documentation`

  // Build description
  const description = doc.description

  // Build keywords
  const keywords = buildKeywords([doc.title, [...CATEGORY_SEO_KEYWORDS.docs]])

  // Use common metadata builder
  return buildMetadataWithSocial({
    locale,
    pageType: 'docs',
    canonicalPath: `docs/${slug}`,
    title,
    description,
    keywords,
    ogTitle: doc.title,
    ogDescription: description,
    ogType: 'article',
    twitterTitle: doc.title,
    twitterDescription: description,
  })
}

/**
 * Generate metadata for static/simple pages (home, manifesto, etc.)
 * Returns complete metadata with robots rules via PageType 'static', 'home', or 'search'
 *
 * This is a generic generator for pages that don't fit other specialized categories.
 * Use this for marketing pages, info pages, etc. to avoid hand-rolling metadata.
 */
export async function generateStaticPageMetadata(options: {
  locale: Locale
  basePath: string
  title: string
  description: string
  keywords?: string
  ogType?: 'website' | 'article'
  pageType?: 'home' | 'static' | 'search'
}): Promise<Metadata> {
  const {
    locale,
    basePath,
    title,
    description,
    keywords,
    ogType = 'website',
    pageType = 'static',
  } = options

  // Use common metadata builder
  return buildMetadataWithSocial({
    locale,
    pageType,
    canonicalPath: basePath,
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogType,
    twitterTitle: title,
    twitterDescription: description,
  })
}
