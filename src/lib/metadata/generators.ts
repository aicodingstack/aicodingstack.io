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
import { createPageMetadata } from './templates'

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

  const t = await getTranslations({ locale, namespace: translationNamespace })

  const translatedTitle = t('title')
  const description = t('subtitle')

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

  // Build alternates (canonical + hreflang)
  const basePath = category
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  const displayName =
    CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || translatedTitle
  const openGraph = buildOpenGraph({
    title: `${translatedTitle} - Best ${displayName} ${METADATA_DEFAULTS.currentYear}`,
    description,
    url: alternates.canonical!,
    locale,
    type: 'website',
  })

  // Build Twitter Card
  const twitter = buildTwitterCard({
    title: `${translatedTitle} - Best ${displayName} ${METADATA_DEFAULTS.currentYear}`,
    description,
  })

  return createPageMetadata({
    locale,
    pageType: 'list',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
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
    pricing?: Array<{ value: number | null; currency: string | null; per: string | null }>
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

  // Build alternates (canonical + hreflang)
  const basePath = `${category}/${slug}`
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  // Note: OG images are automatically detected from opengraph-image.tsx files
  const openGraph = buildOpenGraph({
    title: `${product.name} - ${typeDescription}`,
    description: product.description,
    url: alternates.canonical!,
    locale,
    type: 'article',
  })

  // Build Twitter Card
  // Note: Twitter images are automatically detected from opengraph-image.tsx files
  const twitter = buildTwitterCard({
    title: `${product.name} - ${typeDescription}`,
    description: product.description,
  })

  return createPageMetadata({
    locale,
    pageType: 'detail',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
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

  const t = await getTranslations({ locale, namespace: translationNamespace })

  // Build title with model-specific translation
  const title = `${model.name} - ${t('metaTitle')}`

  // Build description with model specs
  const specs: string[] = []
  if (model.size) specs.push(`${t('modelSize')}: ${model.size}`)
  if (model.contextWindow)
    specs.push(`${t('contextWindow')}: ${formatTokenCount(model.contextWindow)} tokens`)
  if (model.maxOutput) specs.push(`${t('maxOutput')}: ${formatTokenCount(model.maxOutput)} tokens`)

  const pricingDisplay = model.tokenPricing?.input
    ? `$${model.tokenPricing.input}/M tokens`
    : model.tokenPricing?.output
      ? `$${model.tokenPricing.output}/M tokens`
      : null

  if (pricingDisplay) specs.push(`${t('pricing')}: ${pricingDisplay}`)

  const description = `${model.name} by ${model.vendor}. ${specs.join('. ')}. ${model.description}`

  // Build keywords
  const keywords = buildKeywords([
    model.name,
    model.vendor,
    model.size || '',
    [...CATEGORY_SEO_KEYWORDS.models],
  ])

  // Build alternates (canonical + hreflang)
  const basePath = `models/${slug}`
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  // Note: OG images are automatically detected from opengraph-image.tsx files
  const openGraph = buildOpenGraph({
    title: `${model.name} - ${t('metaTitle')}`,
    description: model.description,
    url: alternates.canonical!,
    locale,
    type: 'article',
  })

  // Build Twitter Card
  // Note: Twitter images are automatically detected from opengraph-image.tsx files
  const twitter = buildTwitterCard({
    title: `${model.name} - ${t('metaTitle')}`,
    description: model.description,
  })

  return createPageMetadata({
    locale,
    pageType: 'detail',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
  })
}

/**
 * Generate metadata for comparison pages
 * Returns complete metadata with robots rules via PageType 'comparison'
 */
export async function generateComparisonMetadata(options: {
  locale: Locale
  category: Category
  translationNamespace?: string
}): Promise<Metadata> {
  const { locale, category, translationNamespace } = options

  const categoryExamples = CATEGORY_EXAMPLES[category as keyof typeof CATEGORY_EXAMPLES]
  const categoryName = CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || ''
  const examples = categoryExamples ? [...categoryExamples] : []

  // Build title and description
  // Use translations if available, otherwise use default English text
  let title: string
  let description: string

  if (translationNamespace) {
    try {
      const t = await getTranslations({ locale, namespace: translationNamespace })
      title = `${t('title')} - ${categoryName} Comparison | ${METADATA_DEFAULTS.siteName}`
      description = t('description')
    } catch {
      // Fallback to default English text if translations not available
      title = `Compare ${categoryName} - Side-by-Side Comparison | ${METADATA_DEFAULTS.siteName}`
      description = `Compare specifications, features, and pricing of popular ${categoryName.toLowerCase()}. ${examples.length > 0 ? `${examples.join(', ')}, and more.` : ''}`
    }
  } else {
    // Use default English text
    title = `Compare ${categoryName} - Side-by-Side Comparison | ${METADATA_DEFAULTS.siteName}`
    description = `Compare specifications, features, and pricing of popular ${categoryName.toLowerCase()}. ${examples.length > 0 ? `${examples.join(', ')}, and more.` : ''}`
  }

  // Build keywords
  const keywords = buildKeywords([
    `${category} comparison`,
    'compare',
    'specifications',
    'pricing',
    'side-by-side',
    [...(CATEGORY_SEO_KEYWORDS[category as keyof typeof CATEGORY_SEO_KEYWORDS] || [])],
  ])

  // Build alternates (canonical + hreflang)
  const basePath = `${category}/comparison`
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  const openGraph = buildOpenGraph({
    title: `${categoryName} Comparison`,
    description,
    url: alternates.canonical!,
    locale,
    type: 'website',
  })

  // Build Twitter Card
  const twitter = buildTwitterCard({
    title: `${categoryName} Comparison`,
    description,
  })

  return createPageMetadata({
    locale,
    pageType: 'comparison',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
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

  // Build alternates (canonical + hreflang)
  const basePath = `articles/${slug}`
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph with article metadata, using canonical path
  // Note: OG images are automatically detected from opengraph-image.tsx files
  const openGraph = buildOpenGraph({
    title: article.title,
    description,
    url: alternates.canonical!,
    locale,
    type: 'article',
    publishedTime: article.date,
  })

  // Build Twitter Card with creator
  // Note: Twitter images are automatically detected from opengraph-image.tsx files
  const twitter = buildTwitterCard({
    title: article.title,
    description,
    includeCreator: true,
  })

  return createPageMetadata({
    locale,
    pageType: 'article',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
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

  // Build alternates (canonical + hreflang)
  const basePath = `docs/${slug}`
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  const openGraph = buildOpenGraph({
    title: doc.title,
    description,
    url: alternates.canonical!,
    locale,
    type: 'article',
  })

  // Build Twitter Card
  const twitter = buildTwitterCard({
    title: doc.title,
    description,
  })

  return createPageMetadata({
    locale,
    pageType: 'docs',
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
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

  // Build alternates (canonical + hreflang)
  const alternates = buildAlternates({
    canonicalPath: basePath,
    locale,
    languageBasePath: basePath,
  })

  // Build OpenGraph using canonical path
  const openGraph = buildOpenGraph({
    title,
    description,
    url: alternates.canonical!,
    locale,
    type: ogType,
  })

  // Build Twitter Card
  const twitter = buildTwitterCard({
    title,
    description,
  })

  return createPageMetadata({
    locale,
    pageType,
    title,
    description,
    keywords,
    canonical: alternates.canonical!,
    languageAlternates: alternates.languages,
    openGraph,
    twitter,
  })
}
