/**
 * Schema Generators
 * High-level functions for generating complete schemas for specific page types
 * Uses React cache() for request memoization
 */

import { getTranslations } from 'next-intl/server'
import { cache } from 'react'
import type { Locale } from '@/i18n/config'
import { getPrimaryTokenPricingOffer, hasCurrentSingleTierPricing } from '@/lib/model-pricing'
import type { ManifestTokenPricing, ModelLifecycle } from '@/types/manifests'
import { SITE_CONFIG } from '../config'
import {
  type ArticleSchemaOptions,
  buildArticleSchema,
  buildFAQPageSchema,
  buildItemListSchema,
  buildOrganizationSchema,
  buildProductSchema,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
  type FAQQuestionData,
  type ListItemData,
  type PricingTierData,
} from './builders'
import type {
  SchemaArticle,
  SchemaFAQPage,
  SchemaItemList,
  SchemaOrganization,
  SchemaProduct,
  SchemaSoftwareApplication,
  SchemaWebSite,
} from './types'

/**
 * Product data for schema generation
 */
export interface ProductData {
  name: string
  description: string
  vendor: string
  vendorUrl?: string
  websiteUrl?: string
  downloadUrl?: string
  version?: string
  platforms?: Array<{ os: string }> | string[]
  pricing?: PricingTierData[]
  license?: string
  screenshots?: string[]
}

/**
 * Options for generating software detail schema
 */
export interface SoftwareDetailSchemaOptions {
  product: ProductData
  category: string
  locale: Locale
  applicationSubCategory?: string
  compatibleWith?: string
}

/**
 * Generate SoftwareApplication Schema for detail pages (IDEs, CLIs, Extensions)
 * Cached to prevent duplicate data fetching
 */
export const generateSoftwareDetailSchema = cache(
  async (options: SoftwareDetailSchemaOptions): Promise<SchemaSoftwareApplication> => {
    const { product, applicationSubCategory, compatibleWith } = options

    // Format platforms
    const operatingSystem = product.platforms
      ?.map(p => (typeof p === 'string' ? p : p.os))
      .join(', ')

    return buildSoftwareApplicationSchema({
      name: product.name,
      description: product.description,
      url: product.websiteUrl || SITE_CONFIG.url,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory,
      operatingSystem,
      compatibleWith,
      downloadUrl: product.downloadUrl,
      version: product.version,
      vendorName: product.vendor,
      vendorUrl: product.vendorUrl,
      pricing: product.pricing,
      license: product.license,
      screenshots: product.screenshots,
    })
  }
)

/**
 * Model data for schema generation
 */
export interface ModelData {
  name: string
  description: string
  vendor: string
  vendorUrl?: string
  websiteUrl?: string
  lifecycle?: ModelLifecycle
  tokenPricing?: ManifestTokenPricing
}

/**
 * Options for generating model detail schema
 */
export interface ModelDetailSchemaOptions {
  model: ModelData
  locale: Locale
}

/**
 * Generate Product Schema for model detail pages
 * Cached to prevent duplicate data fetching
 */
export const generateModelDetailSchema = cache(
  async (options: ModelDetailSchemaOptions): Promise<SchemaProduct> => {
    const { model } = options

    // Only publish unambiguous current, single-tier prices as Schema.org offers.
    const pricing: PricingTierData[] = []
    const offer = model.tokenPricing ? getPrimaryTokenPricingOffer(model.tokenPricing) : null
    const rates =
      model.lifecycle !== 'deprecated' &&
      model.tokenPricing &&
      hasCurrentSingleTierPricing(model.tokenPricing)
        ? offer?.tiers[0]?.rates
        : null
    if (offer && rates?.input !== null && rates?.input !== undefined) {
      pricing.push({
        name: 'Input Tokens',
        value: rates.input,
        currency: offer.currency,
        per: 'million tokens',
      })
    }
    if (offer && rates?.output !== null && rates?.output !== undefined) {
      pricing.push({
        name: 'Output Tokens',
        value: rates.output,
        currency: offer.currency,
        per: 'million tokens',
      })
    }

    return buildProductSchema({
      name: model.name,
      description: model.description,
      brandName: model.vendor,
      brandUrl: model.vendorUrl,
      url: model.websiteUrl,
      pricing: pricing.length > 0 ? pricing : undefined,
    })
  }
)

/**
 * Vendor/Organization data
 */
export interface VendorData {
  name: string
  description: string
  websiteUrl: string
  foundingDate?: string
  sameAs?: string[]
}

/**
 * Options for generating vendor/organization schema
 */
export interface VendorSchemaOptions {
  vendor: VendorData
  locale: Locale
}

/**
 * Generate Organization Schema for vendor/provider detail pages
 * Cached to prevent duplicate data fetching
 */
export const generateVendorSchema = cache(
  async (options: VendorSchemaOptions): Promise<SchemaOrganization> => {
    const { vendor } = options

    return buildOrganizationSchema({
      name: vendor.name,
      url: vendor.websiteUrl,
      description: vendor.description,
      foundingDate: vendor.foundingDate,
      sameAs: vendor.sameAs,
    })
  }
)

/**
 * Options for generating list page schema
 */
export interface ListPageSchemaOptions {
  items: Array<{
    id: string
    name: string
    description: string
  }>
  category: string
  locale: Locale
  translationNamespace: string
}

/**
 * Generate ItemList Schema for category list pages
 * Cached to prevent duplicate data fetching
 */
export const generateListPageSchema = cache(
  async (options: ListPageSchemaOptions): Promise<SchemaItemList> => {
    const { items, category, locale, translationNamespace } = options

    const tPage = await getTranslations({ locale, namespace: translationNamespace })

    const listItems: ListItemData[] = items.map(item => ({
      name: item.name,
      url: `${SITE_CONFIG.url}/${category}/${item.id}`,
      description: item.description,
    }))

    return buildItemListSchema({
      name: tPage('title'),
      description: tPage('subtitle'),
      itemType: 'SoftwareApplication',
      items: listItems,
    })
  }
)

/**
 * Article data
 */
export interface ArticleData {
  title: string
  description: string
  slug: string
  date: string
  modifiedDate?: string
  author?: string
  content?: string
  keywords?: string
  image?: string
}

/**
 * Options for generating article schema
 */
export interface ArticleSchemaOptionsInput {
  article: ArticleData
  locale: Locale
  type?: 'Article' | 'TechArticle' | 'BlogPosting'
}

/**
 * Generate Article Schema for article pages
 * Cached to prevent duplicate data fetching
 */
export const generateArticleSchema = cache(
  async (options: ArticleSchemaOptionsInput): Promise<SchemaArticle> => {
    const { article, type = 'Article' } = options

    const schemaOptions: ArticleSchemaOptions = {
      type,
      headline: article.title,
      description: article.description,
      authorName: article.author || SITE_CONFIG.name,
      datePublished: article.date,
      dateModified: article.modifiedDate || article.date,
      publisherName: SITE_CONFIG.name,
      publisherUrl: SITE_CONFIG.url,
      publisherLogo: `${SITE_CONFIG.url}/logo.png`,
      mainEntityOfPage: `${SITE_CONFIG.url}/articles/${article.slug}`,
      articleBody: article.content,
      keywords: article.keywords,
      image: article.image,
    }

    return buildArticleSchema(schemaOptions)
  }
)

/**
 * Doc data
 */
export interface DocData {
  title: string
  description: string
  slug: string
  content?: string
}

/**
 * Options for generating docs schema
 */
export interface DocsSchemaOptions {
  doc: DocData
  locale: Locale
}

/**
 * Generate TechArticle Schema for documentation pages
 * Cached to prevent duplicate data fetching
 */
export const generateDocsSchema = cache(
  async (options: DocsSchemaOptions): Promise<SchemaArticle> => {
    const { doc } = options

    const schemaOptions: ArticleSchemaOptions = {
      type: 'TechArticle',
      headline: doc.title,
      description: doc.description,
      authorName: SITE_CONFIG.name,
      authorUrl: SITE_CONFIG.url,
      datePublished: new Date().toISOString(),
      publisherName: SITE_CONFIG.name,
      publisherUrl: SITE_CONFIG.url,
      publisherLogo: `${SITE_CONFIG.url}/logo.png`,
      mainEntityOfPage: `${SITE_CONFIG.url}/docs/${doc.slug}`,
      articleBody: doc.content,
    }

    return buildArticleSchema(schemaOptions)
  }
)

/**
 * Generate WebSite Schema for root layout
 * Cached to prevent duplicate generation
 */
export const generateWebSiteSchema = cache(async (): Promise<SchemaWebSite> => {
  return buildWebSiteSchema({
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.domain,
    url: SITE_CONFIG.url,
    description:
      'Comprehensive directory for AI coding tools across IDEs, CLIs, MCP servers, models and providers.',
    enableSearch: true,
  })
})

/**
 * Generate Organization Schema for root layout
 * Cached to prevent duplicate generation
 */
export const generateRootOrganizationSchema = cache(async (): Promise<SchemaOrganization> => {
  return buildOrganizationSchema({
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description:
      'Comprehensive directory and community-maintained metadata repository for AI-powered coding tools, models, and platforms.',
    foundingDate: '2025',
    sameAs: ['https://github.com/aicodingstack/aicodingstack.io'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://github.com/aicodingstack/aicodingstack.io/issues',
    },
  })
})

/**
 * Generate FAQPage Schema for homepage
 * Cached to prevent duplicate generation
 */
export const generateFAQPageSchema = cache(
  async (questions: FAQQuestionData[]): Promise<SchemaFAQPage> => {
    return buildFAQPageSchema(questions)
  }
)
