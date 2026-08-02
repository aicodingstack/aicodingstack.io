/**
 * Schema Builders
 * Reusable functions for building Schema.org objects
 * Following DRY principle and type safety
 */

import { SITE_CONFIG } from '../config'
import type {
  SchemaAggregateRating,
  SchemaAnswer,
  SchemaArticle,
  SchemaBreadcrumbList,
  SchemaBreadcrumbListItem,
  SchemaContactPoint,
  SchemaFAQPage,
  SchemaItemList,
  SchemaListItem,
  SchemaOffer,
  SchemaOrganization,
  SchemaPerson,
  SchemaProduct,
  SchemaQuestion,
  SchemaSearchAction,
  SchemaSoftwareApplication,
  SchemaWebSite,
} from './types'

/**
 * Options for building Organization schema
 */
export interface OrganizationSchemaOptions {
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  sameAs?: string[]
  contactPoint?: SchemaContactPoint
}

/**
 * Build Organization Schema
 */
export function buildOrganizationSchema(options: OrganizationSchemaOptions): SchemaOrganization {
  const schema: SchemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
  }

  // Add optional fields only if provided
  if (options.logo) schema.logo = options.logo
  if (options.description) schema.description = options.description
  if (options.foundingDate) schema.foundingDate = options.foundingDate
  if (options.sameAs && options.sameAs.length > 0) schema.sameAs = options.sameAs
  if (options.contactPoint) schema.contactPoint = options.contactPoint

  return schema
}

/**
 * Options for building Person schema
 */
export interface PersonSchemaOptions {
  name: string
  url?: string
  sameAs?: string[]
}

/**
 * Build Person Schema
 */
export function buildPersonSchema(options: PersonSchemaOptions): SchemaPerson {
  const schema: SchemaPerson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: options.name,
  }

  if (options.url) schema.url = options.url
  if (options.sameAs && options.sameAs.length > 0) schema.sameAs = options.sameAs

  return schema
}

/**
 * Pricing tier data for building offers
 */
export interface PricingTierData {
  name?: string
  value: number | null
  currency?: string | null
  per?: string | null
  category?: string
}

/**
 * Build single or multiple Offer schemas from pricing data
 */
export function buildOffersSchema(
  pricing: PricingTierData[]
): SchemaOffer | SchemaOffer[] | undefined {
  if (!pricing || pricing.length === 0) return undefined

  const offers = pricing
    .filter(tier => tier.value !== null)
    .map(tier => {
      const offer: SchemaOffer = {
        '@type': 'Offer',
        price: tier.value?.toString() ?? '0',
        priceCurrency: tier.currency || 'USD',
      }

      if (tier.name) offer.name = tier.name
      if (tier.category) offer.category = tier.category
      if (tier.value === 0) {
        offer.price = '0'
        offer.availability = 'https://schema.org/InStock'
      }

      return offer
    })

  if (offers.length === 0) return undefined
  return offers.length === 1 ? offers[0] : offers
}

/**
 * Rating data for aggregate rating
 */
export interface RatingData {
  value: number
  count: number
  best?: number
  worst?: number
}

/**
 * Build AggregateRating Schema
 */
export function buildAggregateRatingSchema(rating: RatingData): SchemaAggregateRating {
  return {
    '@type': 'AggregateRating',
    ratingValue: rating.value,
    reviewCount: rating.count,
    bestRating: rating.best || 5,
    worstRating: rating.worst || 1,
  }
}

/**
 * Options for building SoftwareApplication schema
 */
export interface SoftwareApplicationSchemaOptions {
  name: string
  description: string
  url: string
  applicationCategory?: string
  applicationSubCategory?: string
  operatingSystem?: string
  compatibleWith?: string
  downloadUrl?: string
  installUrl?: string
  version?: string
  vendorName: string
  vendorUrl?: string
  pricing?: PricingTierData[]
  license?: string
  screenshots?: string | string[]
  rating?: RatingData
}

/**
 * Build SoftwareApplication Schema
 */
export function buildSoftwareApplicationSchema(
  options: SoftwareApplicationSchemaOptions
): SchemaSoftwareApplication {
  const schema: SchemaSoftwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    applicationCategory: options.applicationCategory || 'DeveloperApplication',
    description: options.description,
    url: options.url,
    author: buildOrganizationSchema({
      name: options.vendorName,
      url: options.vendorUrl || options.url,
    }),
  }

  // Add optional fields
  if (options.applicationSubCategory) schema.applicationSubCategory = options.applicationSubCategory
  if (options.operatingSystem) schema.operatingSystem = options.operatingSystem
  if (options.compatibleWith) schema.compatibleWith = options.compatibleWith
  if (options.downloadUrl) schema.downloadUrl = options.downloadUrl
  if (options.installUrl) schema.installUrl = options.installUrl
  else if (options.downloadUrl) schema.installUrl = options.downloadUrl
  if (options.version) schema.softwareVersion = options.version
  if (options.pricing) schema.offers = buildOffersSchema(options.pricing)
  if (options.license) schema.license = options.license
  if (options.screenshots) schema.screenshot = options.screenshots
  if (options.rating) schema.aggregateRating = buildAggregateRatingSchema(options.rating)

  return schema
}

/**
 * Options for building Product schema
 */
export interface ProductSchemaOptions {
  name: string
  description: string
  brandName: string
  brandUrl?: string
  pricing?: PricingTierData[]
  rating?: RatingData
  image?: string | string[]
  url?: string
}

/**
 * Build Product Schema
 */
export function buildProductSchema(options: ProductSchemaOptions): SchemaProduct {
  const schema: SchemaProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    brand: buildOrganizationSchema({
      name: options.brandName,
      url: options.brandUrl || SITE_CONFIG.url,
    }),
  }

  if (options.pricing) schema.offers = buildOffersSchema(options.pricing)
  if (options.rating) schema.aggregateRating = buildAggregateRatingSchema(options.rating)
  if (options.image) schema.image = options.image
  if (options.url) schema.url = options.url

  return schema
}

/**
 * List item data
 */
export interface ListItemData {
  name: string
  url: string
  description?: string
  image?: string
}

/**
 * Options for building ItemList schema
 */
export interface ItemListSchemaOptions {
  name: string
  description?: string
  itemType?: string
  items: ListItemData[]
}

/**
 * Build ItemList Schema
 */
export function buildItemListSchema(options: ItemListSchemaOptions): SchemaItemList {
  const itemListElement: SchemaListItem[] = options.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': options.itemType || 'Thing',
      name: item.name,
      url: item.url,
      description: item.description,
      image: item.image,
    },
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: options.name,
    description: options.description,
    numberOfItems: options.items.length,
    itemListElement,
  }
}

/**
 * Breadcrumb item data
 */
export interface BreadcrumbItemData {
  name: string
  url: string
}

/**
 * Build BreadcrumbList Schema
 */
export function buildBreadcrumbListSchema(items: BreadcrumbItemData[]): SchemaBreadcrumbList {
  const itemListElement: SchemaBreadcrumbListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

/**
 * Options for building Article schema
 */
export interface ArticleSchemaOptions {
  type?: 'Article' | 'TechArticle' | 'BlogPosting'
  headline: string
  description: string
  authorName: string
  authorUrl?: string
  datePublished: string
  dateModified?: string
  publisherName?: string
  publisherUrl?: string
  publisherLogo?: string
  mainEntityOfPage?: string
  image?: string | string[]
  articleBody?: string
  keywords?: string
}

/**
 * Build Article Schema
 */
export function buildArticleSchema(options: ArticleSchemaOptions): SchemaArticle {
  const schema: SchemaArticle = {
    '@context': 'https://schema.org',
    '@type': options.type || 'Article',
    headline: options.headline,
    description: options.description,
    author: buildOrganizationSchema({
      name: options.authorName,
      url: options.authorUrl || SITE_CONFIG.url,
    }),
    datePublished: options.datePublished,
    publisher: buildOrganizationSchema({
      name: options.publisherName || SITE_CONFIG.name,
      url: options.publisherUrl || SITE_CONFIG.url,
      logo: options.publisherLogo || `${SITE_CONFIG.url}/logo.png`,
    }),
  }

  if (options.dateModified) schema.dateModified = options.dateModified
  if (options.mainEntityOfPage) schema.mainEntityOfPage = options.mainEntityOfPage
  if (options.image) schema.image = options.image
  if (options.articleBody) schema.articleBody = options.articleBody
  if (options.keywords) schema.keywords = options.keywords

  return schema
}

/**
 * Build WebSite Schema with search functionality
 */
export function buildWebSiteSchema(options?: {
  name?: string
  alternateName?: string | string[]
  url?: string
  description?: string
  enableSearch?: boolean
  searchUrlTemplate?: string
}): SchemaWebSite {
  const schema: SchemaWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options?.name || SITE_CONFIG.name,
    url: options?.url || SITE_CONFIG.url,
  }

  if (options?.alternateName) schema.alternateName = options.alternateName
  if (options?.description) schema.description = options.description

  if (options?.enableSearch !== false) {
    const searchAction: SchemaSearchAction = {
      '@type': 'SearchAction',
      target: options?.searchUrlTemplate || `${SITE_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    }
    schema.potentialAction = searchAction
  }

  return schema
}

/**
 * FAQ question data
 */
export interface FAQQuestionData {
  question: string
  answer: string
}

/**
 * Build FAQPage Schema
 */
export function buildFAQPageSchema(questions: FAQQuestionData[]): SchemaFAQPage {
  const mainEntity: SchemaQuestion[] = questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    } as SchemaAnswer,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}
