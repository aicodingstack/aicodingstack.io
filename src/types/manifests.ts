/**
 * AI Coding Stack Manifest Type Definitions
 *
 * These TypeScript interfaces mirror the JSON schema definitions in /manifests/$schemas/
 * and follow the same inheritance hierarchy to ensure type safety and consistency.
 *
 * Schema references:
 * - Base schemas: /manifests/$schemas/ref/
 * - Product schemas: /manifests/$schemas/*.schema.json
 */

// =============================================================================
// SECTION 1: Base Ref Types (from /manifests/$schemas/ref/)
// =============================================================================

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
  websiteUrl: string
  docsUrl?: string | null
}

/**
 * Vendor Entity - Entity with vendor information
 * Based on: /manifests/$schemas/ref/vendor-entity.schema.json
 * Extends: ManifestEntity
 */
export interface ManifestVendorEntity extends ManifestEntity {
  vendor: string
  docsUrl: string | null // Override: required in vendor-entity schema
}

/**
 * App - Entity marked as verified
 * Based on: /manifests/$schemas/ref/app.schema.json
 * Extends: ManifestEntity
 */
export interface ManifestApp extends ManifestEntity {
  verified: boolean
}

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
 */
export interface ManifestCommunityUrls {
  linkedin?: string | null
  twitter?: string | null
  github?: string | null
  youtube?: string | null
  discord?: string | null
  reddit?: string | null
  blog?: string | null
  [key: string]: string | null | undefined
}

/**
 * Platform-specific URLs
 * Based on: /manifests/$schemas/ref/platform-urls.schema.json
 */
export interface ManifestPlatformUrls {
  macos?: string | null
  windows?: string | null
  linux?: string | null
}

/**
 * Pricing tier information
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/pricingTier
 */
export interface ManifestPricingTier {
  name: string
  value: number | null // null for custom pricing, 0 for free
  currency: string | null // ISO 4217 currency code (e.g., 'USD', 'CNY', 'EUR')
  per: string | null // e.g., 'month', 'year', 'user/month', 'custom'
  category: string // 'Individual', 'Business', 'Enterprise'
}

/**
 * Resource URLs for a product
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/resourceUrls
 */
export interface ManifestResourceUrls {
  download: string | null
  changelog: string | null
  pricing: string | null
  mcp: string | null
  issue: string | null
}

/**
 * Component-compatible resource URLs
 */
export interface ComponentResourceUrls {
  download?: string
  changelog?: string
  pricing?: string
  blog?: string
  mcp?: string
  issue?: string
}

/**
 * Component-compatible community URLs
 */
export interface ComponentCommunityUrls {
  linkedin?: string
  twitter?: string
  github?: string
  youtube?: string
  discord?: string
  reddit?: string
}

/**
 * Platform installation information
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/platformElement
 */
export interface ManifestPlatformElement {
  os: 'macOS' | 'Windows' | 'Linux'
  installCommand?: string | null
  launchCommand?: string | null
  installPath?: string | null
}

/**
 * Related products reference
 * Based on: /manifests/$schemas/ref/product.schema.json#$defs/relatedProducts
 */
export interface ManifestRelatedProduct {
  type: 'ide' | 'cli' | 'extension'
  productId: string
}

/**
 * GitHub metadata
 * Based on: /manifests/$schemas/ref/github.schema.json
 */
export interface ManifestGithub {
  data?: string | null
  commit?: string | null
  commitMessage?: string | null
  branch?: string | null
  isByAnthropic?: boolean | null
}

/**
 * Vendor information
 * Based on: /manifests/$schemas/ref/vendor.schema.json
 */
export interface ManifestVendorBase {
  id: string
  name: string
  description: string
  websiteUrl?: string
  docsUrl?: string
  location?: string | null
  foundingYear?: number | null
}

/**
 * Collection item reference
 * Based on: /manifests/$schemas/ref/collection-item.schema.json
 */
export interface ManifestCollectionItem {
  type: 'cli' | 'ide' | 'extension'
  productId: string
  description?: string
}

// =============================================================================
// SECTION 2: Product Types (CLI, IDE, etc.)
// =============================================================================

/**
 * Base Product - Common properties for all product types
 * Based on: /manifests/$schemas/ref/product.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestBaseProduct extends ManifestVendorEntity {
  latestVersion: string
  githubUrl: string | null
  license: string // SPDX License Identifier or 'Proprietary'
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
  platforms?: ManifestPlatformElement[]
  github?: ManifestGithub
}

/**
 * IDE (Integrated Development Environment)
 * Based on: /manifests/$schemas/ides.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestIDE extends ManifestVendorEntity {
  latestVersion: string
  githubUrl: string | null
  license: string
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
  platforms: ManifestPlatformElement[]
  // Legacy fields that may exist in data
  cli?: string | null
  install?: string | null
  launch?: string | null
}

/**
 * CLI (Command Line Interface)
 * Based on: /manifests/$schemas/clis.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestCLI extends ManifestVendorEntity {
  latestVersion: string
  githubUrl: string | null
  license: string
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
  platforms: ManifestPlatformElement[]
  // Legacy fields that may exist in data
  ide?: string | null
  install?: string | null
  launch?: string | null
}

/**
 * Extension
 * Based on: /manifests/$schemas/extensions.schema.json
 * Extends: ManifestApp
 */
export interface ManifestExtension extends ManifestApp {
  vendor: string
  type: 'cli' | 'ide'
  extends: string // Type of extension
  latestVersion: string
  license: string
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
  platforms?: ManifestPlatformElement[]
  // Legacy fields
  install?: string | null
  launch?: string | null
  // Extension-specific fields
  supportedIdes?: Array<{
    ideId: string
    marketplaceUrl?: string | null
    installUri?: string | null
    installCommand?: string | null
  }>
  githubUrl?: string | null
}

// =============================================================================
// SECTION 3: Standalone Entity Types
// =============================================================================

/**
 * Large Language Model for Coding
 * Based on: /manifests/$schemas/models.schema.json
 */
export interface ManifestModel {
  name: string
  vendor: string
  id: string
  description: string
  translations: ManifestTranslations
  websiteUrl: string | null
  docsUrl?: string | null
  verified?: boolean
  size: string | null
  contextWindow: number
  maxOutput: number
  tokenPricing?: {
    input?: number | null
    output?: number | null
    cache?: number | null
  } | null
  platformUrls?: {
    huggingface?: string | null
    artificialAnalysis?: string | null
    openrouter?: string | null
  }
  releaseDate?: string | null
  inputModalities?: ('image' | 'text' | 'file')[]
  capabilities?: ('function-calling' | 'tool-choice' | 'structured-outputs' | 'reasoning')[]
  benchmarks?: {
    sweBench?: number | null
    terminalBench?: number | null
    mmmu?: number | null
    mmmuPro?: number | null
    webDevArena?: number | null
    sciCode?: number | null
    liveCodeBench?: number | null
  }
  pricing?: ManifestPricingTier[]
  [key: string]: unknown
}

/**
 * LLM API Provider
 * Based on: /manifests/$schemas/providers.schema.json
 * Extends: ManifestVendorEntity
 */
export interface ManifestProvider extends ManifestVendorEntity {
  // verified is inherited from ManifestVendorEntity -> ManifestEntity (required boolean)
  type?: string
  applyKeyUrl?: string
  platformUrls?: {
    huggingface?: string | null
    artificialAnalysis?: string | null
    openrouter?: string | null
  }
  communityUrls?: ManifestCommunityUrls
  githubUrl?: string | null
  pricing?: ManifestPricingTier[]
  [key: string]: unknown
}

/**
 * Complete Vendor Information
 * Based on: /manifests/$schemas/vendors.schema.json
 * Extends: ManifestVendorBase
 */
export interface ManifestVendor extends ManifestVendorBase {
  verified?: boolean
  communityUrls?: ManifestCommunityUrls
  products?: {
    type: 'cli' | 'ide' | 'extension'
    productId: string
  }[]
  [key: string]: unknown
}

/**
 * Collection of Related Products
 * Based on: /manifests/$schemas/collections.schema.json
 */
export interface ManifestCollection {
  title: string
  description: string
  extractedDate: string
  translations?: {
    [locale: string]: {
      title?: string
      description?: string
    }
  }
  items: ManifestCollectionItem[]
}

// =============================================================================
// SECTION 4: Manifest Array Types (for JSON file imports)
// =============================================================================

/**
 * Manifest file imports return arrays of these types
 */
export type ManifestIDEArray = ManifestIDE[]
export type ManifestCLIArray = ManifestCLI[]
export type ManifestExtensionArray = ManifestExtension[]
export type ManifestModelArray = ManifestModel[]
export type ManifestProviderArray = ManifestProvider[]
export type ManifestVendorArray = ManifestVendor[]
export type ManifestCollectionArray = ManifestCollection[]

// =============================================================================
// SECTION 5: Utility Types
// =============================================================================

/**
 * Union type of all product types
 */
export type ManifestProductType = ManifestIDE | ManifestCLI | ManifestExtension

/**
 * Union type of all manifest entity types
 */
export type ManifestEntityType =
  | ManifestEntity
  | ManifestVendorEntity
  | ManifestVendor
  | ManifestProductType

/**
 * Type guard to check if an object is a ManifestEntity
 */
export function isManifestEntity(obj: unknown): obj is ManifestEntity {
  return (
    typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'description' in obj
  )
}

/**
 * Type guard to check if an object is a ManifestVendorEntity
 */
export function isManifestVendorEntity(obj: unknown): obj is ManifestVendorEntity {
  return isManifestEntity(obj) && 'vendor' in obj
}

/**
 * Type guard to check if an object is a ManifestBaseProduct
 */
export function isManifestBaseProduct(obj: unknown): obj is ManifestBaseProduct {
  return (
    isManifestVendorEntity(obj) &&
    'latestVersion' in obj &&
    'githubUrl' in obj &&
    'license' in obj &&
    'pricing' in obj &&
    'resourceUrls' in obj &&
    'communityUrls' in obj
  )
}
