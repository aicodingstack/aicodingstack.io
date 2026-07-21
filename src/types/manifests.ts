/**
 * AI Coding Stack Manifest Type Definitions
 *
 * These TypeScript interfaces mirror the JSON schema definitions in /manifests/$schemas/
 * and follow the same inheritance hierarchy to ensure type safety and consistency.
 *
 * Schema structure:
 * - Base schemas: /manifests/$schemas/ref/
 * - Product schemas: /manifests/$schemas/*.schema.json
 */

import type { ModelCapability, ModelInputModality, ModelOutputModality } from './model-enums'

// =============================================================================
// SECTION 1: Base Ref Types (from /manifests/$schemas/ref/)
// =============================================================================

/**
 * Internationalization translations
 * Based on: /manifests/$schemas/ref/translations.schema.json
 */
export interface ManifestTranslations {
  [locale: string]: {
    name?: string
    title?: string
    description?: string
  }
}

/**
 * Community/Social URLs
 * Based on: /manifests/$schemas/ref/community-urls.schema.json
 *
 * Note: All properties are REQUIRED according to the schema
 * (use null if not applicable)
 */
export interface ManifestCommunityUrls {
  linkedin: string | null
  twitter: string | null
  github: string | null
  youtube: string | null
  discord: string | null
  reddit: string | null
  blog: string | null
}

/**
 * Platform-specific URLs (HuggingFace, Artificial Analysis, OpenRouter)
 * Based on: /manifests/$schemas/ref/platform-urls.schema.json
 *
 * Note: All properties are REQUIRED according to the schema
 * (use null if not applicable)
 */
export interface ManifestPlatformUrls {
  huggingface: string | null
  artificialAnalysis: string | null
  openrouter: string | null
}

/**
 * Source used to verify a manifest record or selected fields.
 * Based on: /manifests/$schemas/ref/entity.schema.json#$defs/source
 */
export interface ManifestSource {
  url: string
  title?: string
  fields?: string[]
}

/**
 * Base Entity - Fundamental properties all manifests share
 * Based on: /manifests/$schemas/ref/entity.schema.json
 */
export interface ManifestEntity {
  id: string
  name: string
  description: string
  translations: ManifestTranslations
  verified: boolean
  sources?: ManifestSource[]
  lastVerifiedAt?: string
  verifiedBy?: string | null
  confidence?: 'high' | 'medium' | 'low'
  websiteUrl: string
}

/**
 * Vendor Entity - Entity with vendor information
 * Based on: /manifests/$schemas/ref/vendor-entity.schema.json
 * Extends: ManifestEntity
 */
export interface ManifestVendorEntity extends ManifestEntity {
  docsUrl: string | null
  vendor: string
}

/**
 * Resource URLs for a product
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/resourceUrls
 *
 * Note: All properties are REQUIRED according to the schema
 * (use null if not applicable)
 */
export interface ManifestResourceUrls {
  download: string | null
  changelog: string | null
  pricing: string | null
  mcp: string | null
  issue: string | null
}

/**
 * Pricing tier information
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/pricingTier
 */
export interface ManifestPricingTier {
  name: string
  value: number | null
  currency?: 'USD' | 'CNY' | 'EUR' | null
  per?: string | null
  category: string
}

/**
 * Related products reference
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/relatedProducts
 */
export interface ManifestRelatedProduct {
  type: 'ide' | 'cli' | 'extension' | 'desktop'
  productId: string
}

/**
 * Platform installation information
 * Based on: /manifests/$schemas/ref/app.schema.json
 */
export interface ManifestPlatformElement {
  os: 'macOS' | 'Windows' | 'Linux'
  installPath: string | null
  installCommand?: string | null
  launchCommand?: string | null
}

/**
 * Base Product - Common properties for CLI, IDE, and Extension
 * Based on: /manifests/$schemas/ref/product.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestBaseProduct extends ManifestVendorEntity {
  /** Stable identifier shared by every surface in the same product family */
  familyId?: string
  latestVersion: string
  githubUrl: string | null
  license: string
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
}

/**
 * Base App - Common properties for CLI and IDE
 * Based on: /manifests/$schemas/ref/app.schema.json
 * Extends: ManifestBaseProduct
 */
export interface ManifestBaseApp extends ManifestBaseProduct {
  platforms: ManifestPlatformElement[]
  installCommand?: string | null
  launchCommand?: string | null
}

// =============================================================================
// SECTION 2: Product Types (CLI, IDE, Extension)
// =============================================================================

/**
 * CLI (Command Line Interface)
 * Based on: /manifests/$schemas/cli.schema.json
 * Extends: ManifestBaseApp
 */
export interface ManifestCLI extends ManifestBaseApp {}

/**
 * IDE (Integrated Development Environment)
 * Based on: /manifests/$schemas/ide.schema.json
 * Extends: ManifestBaseApp
 */
export interface ManifestIDE extends ManifestBaseApp {}

/**
 * Standalone desktop coding-agent application
 * Based on: /manifests/$schemas/desktop.schema.json
 */
export interface ManifestDesktop extends ManifestBaseApp {}

/**
 * IDE Support information for extensions
 * Based on: /manifests/$schemas/extension.schema.json#$defs/ideSupport
 */
export interface ManifestIDESupport {
  ideId: 'vscode' | 'jetbrains' | 'cursor' | 'windsurf' | 'trae' | 'zed'
  marketplaceUrl: string | null
  installUri: string | null
}

/**
 * Extension
 * Based on: /manifests/$schemas/extension.schema.json
 * Extends: ManifestBaseProduct
 */
export interface ManifestExtension extends ManifestBaseProduct {
  supportedIdes: ManifestIDESupport[]
}

// =============================================================================
// SECTION 3: Standalone Entity Types
// =============================================================================

/**
 * Token-based pricing information for API usage
 * Based on: /manifests/$schemas/model.schema.json
 */
export type ManifestTokenPricingReason =
  | 'open-weights-only'
  | 'subscription-only'
  | 'official-price-not-published'
  | 'historical-price-unverified'
  | 'unsupported-pricing-structure'

export type ManifestTokenPricingRate = 'input' | 'output' | 'cacheRead' | 'cacheWrite'

export interface ManifestTokenPricingRates {
  input: number | null
  output: number | null
  cacheRead: number | null
  cacheWrite: number | null
}

export interface ManifestTokenPricingCondition {
  metric: 'inputTokens' | 'contextTokens'
  min: number | null
  max: number | null
}

export interface ManifestTokenPricingTier {
  condition: ManifestTokenPricingCondition | null
  rates: ManifestTokenPricingRates
}

export interface ManifestTokenPricingOffer {
  id: string
  currency: string
  region: 'global' | string
  serviceTier: 'standard'
  effectiveFrom: string | null
  effectiveTo: string | null
  tiers: ManifestTokenPricingTier[]
}

export interface ManifestAvailableTokenPricing {
  status: 'available'
  primaryOffer: string
  offers: ManifestTokenPricingOffer[]
}

export interface ManifestUnavailableTokenPricing {
  status: 'not-applicable' | 'unavailable'
  reason: ManifestTokenPricingReason
  primaryOffer: null
  offers: []
}

export type ManifestTokenPricing = ManifestAvailableTokenPricing | ManifestUnavailableTokenPricing

/**
 * Benchmark scores
 * Based on: /manifests/$schemas/model.schema.json
 */
export interface ManifestBenchmarks {
  sweBench: number | null
  terminalBench: number | null
  mmmu: number | null
  mmmuPro: number | null
  webDevArena: number | null
  sciCode: number | null
  liveCodeBench: number | null
}

/**
 * Lifecycle stage of a model
 */
export type ModelLifecycle = 'latest' | 'maintained' | 'deprecated'

/**
 * Large Language Model for Coding
 * Based on: /manifests/$schemas/model.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestModel extends ManifestVendorEntity {
  size: string | null
  contextWindow: number
  maxOutput: number | null
  tokenPricing: ManifestTokenPricing
  releaseDate: string | null
  lifecycle: ModelLifecycle
  knowledgeCutoff: string | null
  inputModalities: ModelInputModality[]
  outputModalities: ModelOutputModality[]
  capabilities: ModelCapability[]
  benchmarks: ManifestBenchmarks
  platformUrls: ManifestPlatformUrls
}

/**
 * LLM API Provider
 * Based on: /manifests/$schemas/provider.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestProvider extends ManifestVendorEntity {
  type: 'foundation-model-provider' | 'model-service-provider'
  applyKeyUrl: string | null
  platformUrls: ManifestPlatformUrls
  communityUrls: ManifestCommunityUrls
}

/**
 * Vendor
 * Based on: /manifests/$schemas/vendor.schema.json
 * Extends: ManifestEntity
 */
export interface ManifestVendor extends ManifestEntity {
  aliases?: string[]
  communityUrls: ManifestCommunityUrls
}

// =============================================================================
// SECTION 4: Collection Types
// =============================================================================

/**
 * Collection item (name, URL, description with translations)
 * Based on: /manifests/$schemas/collections.schema.json#$defs/collectionItem
 */
export interface ManifestCollectionItem {
  name: string
  url: string
  description: string
  translations: ManifestTranslations
}

/**
 * Collection subsection (title, translations, items)
 * Based on: /manifests/$schemas/collections.schema.json#$defs/collectionSubSection
 */
export interface ManifestCollectionSubSection {
  title: string
  translations: ManifestTranslations
  items: ManifestCollectionItem[]
}

/**
 * Collection section (title, description, translations, subsections)
 * Based on: /manifests/$schemas/collections.schema.json#$defs/collectionSection
 */
export interface ManifestCollectionSection {
  title: string
  description: string
  translations: ManifestTranslations
  sections: ManifestCollectionSubSection[]
}

/**
 * Collections - curated collections of resources
 * Based on: /manifests/$schemas/collections.schema.json
 */
export interface ManifestCollections {
  specifications: ManifestCollectionSection
  articles: ManifestCollectionSection
  tools: ManifestCollectionSection
  features: ManifestCollectionSection
}

// =============================================================================
// SECTION 5: GitHub Stars Data
// =============================================================================

/**
 * GitHub stars data for products
 * Based on: /manifests/$schemas/github-stars.schema.json
 */
export interface ManifestGitHubStars {
  desktops: { [productId: string]: number | null }
  extensions: { [productId: string]: number | null }
  clis: { [productId: string]: number | null }
  ides: { [productId: string]: number | null }
}

// =============================================================================
// SECTION 6: Manifest Array Types (for JSON file imports)
// =============================================================================

/**
 * Manifest file imports return arrays of these types
 */
export type ManifestCLIArray = ManifestCLI[]
export type ManifestDesktopArray = ManifestDesktop[]
export type ManifestIDEArray = ManifestIDE[]
export type ManifestExtensionArray = ManifestExtension[]
export type ManifestModelArray = ManifestModel[]
export type ManifestProviderArray = ManifestProvider[]
export type ManifestVendorArray = ManifestVendor[]

// =============================================================================
// SECTION 7: Utility Types
// =============================================================================

/**
 * Union type of all product types
 */
export type ManifestProductType = ManifestIDE | ManifestCLI | ManifestExtension | ManifestDesktop

/**
 * Union type of all manifest entity types
 */
export type ManifestEntityType =
  | ManifestEntity
  | ManifestVendorEntity
  | ManifestVendor
  | ManifestProductType
  | ManifestModel
  | ManifestProvider
