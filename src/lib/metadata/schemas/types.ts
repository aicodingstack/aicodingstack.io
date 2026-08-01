/**
 * Schema.org Type Definitions
 * Strict TypeScript definitions following Schema.org specification
 * @see https://schema.org
 */

/**
 * Base Schema.org type
 */
export interface SchemaBase {
  '@context': 'https://schema.org'
  '@type': string
}

/**
 * Organization Schema
 * @see https://schema.org/Organization
 */
export interface SchemaOrganization extends SchemaBase {
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  sameAs?: string[]
  contactPoint?: SchemaContactPoint
}

/**
 * Person Schema
 * @see https://schema.org/Person
 */
export interface SchemaPerson extends SchemaBase {
  '@type': 'Person'
  name: string
  url?: string
  sameAs?: string[]
}

/**
 * ContactPoint Schema
 * @see https://schema.org/ContactPoint
 */
export interface SchemaContactPoint {
  '@type': 'ContactPoint'
  contactType: string
  url?: string
  email?: string
}

/**
 * Offer Schema
 * @see https://schema.org/Offer
 */
export interface SchemaOffer {
  '@type': 'Offer'
  name?: string
  price: string | number
  priceCurrency: string
  category?: string
  priceValidUntil?: string
  availability?: string
  url?: string
}

/**
 * AggregateRating Schema
 * @see https://schema.org/AggregateRating
 */
export interface SchemaAggregateRating {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}

/**
 * Review Schema
 * @see https://schema.org/Review
 */
export interface SchemaReview {
  '@type': 'Review'
  author: SchemaOrganization | SchemaPerson
  datePublished: string
  reviewBody: string
  reviewRating: {
    '@type': 'Rating'
    ratingValue: number
    bestRating?: number
    worstRating?: number
  }
}

/**
 * SoftwareApplication Schema
 * @see https://schema.org/SoftwareApplication
 */
export interface SchemaSoftwareApplication extends SchemaBase {
  '@type': 'SoftwareApplication'
  name: string
  applicationCategory: string
  applicationSubCategory?: string
  operatingSystem?: string
  compatibleWith?: string
  description: string
  url: string
  downloadUrl?: string
  installUrl?: string
  softwareVersion?: string
  author: SchemaOrganization
  offers?: SchemaOffer | SchemaOffer[]
  license?: string
  screenshot?: string | string[]
  aggregateRating?: SchemaAggregateRating
  review?: SchemaReview[]
}

/**
 * Product Schema
 * @see https://schema.org/Product
 */
export interface SchemaProduct extends SchemaBase {
  '@type': 'Product'
  name: string
  description: string
  brand: SchemaOrganization
  offers?: SchemaOffer | SchemaOffer[]
  aggregateRating?: SchemaAggregateRating
  review?: SchemaReview[]
  image?: string | string[]
  url?: string
}

/**
 * ListItem Schema
 * @see https://schema.org/ListItem
 */
export interface SchemaListItem {
  '@type': 'ListItem'
  position: number
  item: {
    '@type': string
    name: string
    url: string
    description?: string
    image?: string
  }
}

/**
 * ItemList Schema
 * @see https://schema.org/ItemList
 */
export interface SchemaItemList extends SchemaBase {
  '@type': 'ItemList'
  name: string
  description?: string
  numberOfItems: number
  itemListElement: SchemaListItem[]
}

/**
 * BreadcrumbList Schema
 * @see https://schema.org/BreadcrumbList
 */
export interface SchemaBreadcrumbList extends SchemaBase {
  '@type': 'BreadcrumbList'
  itemListElement: SchemaBreadcrumbListItem[]
}

export interface SchemaBreadcrumbListItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

/**
 * Article Schema
 * @see https://schema.org/Article
 */
export interface SchemaArticle extends SchemaBase {
  '@type': 'Article' | 'TechArticle' | 'BlogPosting'
  headline: string
  description: string
  author: SchemaOrganization | SchemaPerson
  datePublished: string
  dateModified?: string
  publisher: SchemaOrganization
  mainEntityOfPage?: string
  image?: string | string[]
  articleBody?: string
  keywords?: string
}

/**
 * WebSite Schema
 * @see https://schema.org/WebSite
 */
export interface SchemaWebSite extends SchemaBase {
  '@type': 'WebSite'
  name: string
  alternateName?: string | string[]
  url: string
  description?: string
  potentialAction?: SchemaSearchAction
}

/**
 * SearchAction Schema
 * @see https://schema.org/SearchAction
 */
export interface SchemaSearchAction {
  '@type': 'SearchAction'
  target: string | { '@type': 'EntryPoint'; urlTemplate: string }
  'query-input'?: string
}

/**
 * FAQPage Schema
 * @see https://schema.org/FAQPage
 */
export interface SchemaFAQPage extends SchemaBase {
  '@type': 'FAQPage'
  mainEntity: SchemaQuestion[]
}

/**
 * Question Schema
 * @see https://schema.org/Question
 */
export interface SchemaQuestion {
  '@type': 'Question'
  name: string
  acceptedAnswer: SchemaAnswer
}

/**
 * Answer Schema
 * @see https://schema.org/Answer
 */
export interface SchemaAnswer {
  '@type': 'Answer'
  text: string
}

/**
 * Type aliases for common schema combinations
 */
export type SchemaAuthor = SchemaOrganization | SchemaPerson
export type SchemaPublisher = SchemaOrganization
export type AnySchema =
  | SchemaOrganization
  | SchemaPerson
  | SchemaSoftwareApplication
  | SchemaProduct
  | SchemaItemList
  | SchemaBreadcrumbList
  | SchemaArticle
  | SchemaWebSite
  | SchemaFAQPage
