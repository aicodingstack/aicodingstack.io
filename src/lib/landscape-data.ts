/**
 * AI Coding Landscape Data Aggregation Layer
 *
 * This module aggregates and transforms manifest data for the /ai-coding-landscape page.
 * It provides utilities for:
 * - Building vendor-to-product mappings
 * - Extension-IDE compatibility mappings
 */

import type {
  ManifestCLI,
  ManifestExtension,
  ManifestIDE,
  ManifestModel,
  ManifestProvider,
  ManifestVendor,
} from '@/types/manifests'
import {
  clisData,
  extensionsData,
  idesData,
  modelsData,
  providersData,
  vendorsData,
} from './generated'
import { getGithubStars } from './generated/github-stars'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ProductCategory = 'ide' | 'cli' | 'extension' | 'model' | 'provider'

export interface LandscapeProduct {
  id: string
  name: string
  vendor: string
  category: ProductCategory
  description: string
  websiteUrl?: string
  docsUrl?: string
  githubUrl?: string | null
  githubStars?: number | null
  license?: string
  latestVersion?: string
  path: string
}

export interface VendorEcosystem {
  vendor: ManifestVendor
  products: {
    ides: LandscapeProduct[]
    clis: LandscapeProduct[]
    extensions: LandscapeProduct[]
    models: LandscapeProduct[]
    providers: LandscapeProduct[]
  }
  totalProducts: number
  type: VendorType
}

export type VendorType =
  | 'full-stack' // Has IDE + CLI + Extension
  | 'ai-native' // Has Model + (IDE or CLI or Extension)
  | 'tool-only' // Only has IDE/CLI/Extension
  | 'model-only' // Only has Model, or has Model + Provider (no Tools)
  | 'provider-only' // Only has Provider (no Model, no Tools)

export interface ExtensionIDECompatibility {
  extensionId: string
  extensionName: string
  supportedIdes: Array<{
    ideId: string
    ideName: string
    marketplaceUrl?: string | null
    installUri?: string | null
  }>
}

// =============================================================================
// DATA TRANSFORMATION HELPERS
// =============================================================================

function ideToProduct(ide: ManifestIDE): LandscapeProduct {
  return {
    id: ide.id,
    name: ide.name,
    vendor: ide.vendor,
    category: 'ide',
    description: ide.description,
    websiteUrl: ide.websiteUrl,
    docsUrl: ide.docsUrl || undefined,
    githubUrl: ide.githubUrl,
    githubStars: getGithubStars('ides', ide.id),
    license: ide.license,
    latestVersion: ide.latestVersion,
    path: `/ides/${ide.id}`,
  }
}

function cliToProduct(cli: ManifestCLI): LandscapeProduct {
  return {
    id: cli.id,
    name: cli.name,
    vendor: cli.vendor,
    category: 'cli',
    description: cli.description,
    websiteUrl: cli.websiteUrl,
    docsUrl: cli.docsUrl || undefined,
    githubUrl: cli.githubUrl,
    githubStars: getGithubStars('clis', cli.id),
    license: cli.license,
    latestVersion: cli.latestVersion,
    path: `/clis/${cli.id}`,
  }
}

function extensionToProduct(ext: ManifestExtension): LandscapeProduct {
  return {
    id: ext.id,
    name: ext.name,
    vendor: ext.vendor,
    category: 'extension',
    description: ext.description,
    websiteUrl: ext.websiteUrl,
    docsUrl: ext.docsUrl || undefined,
    githubUrl: ext.githubUrl,
    githubStars: getGithubStars('extensions', ext.id),
    license: ext.license,
    latestVersion: ext.latestVersion,
    path: `/extensions/${ext.id}`,
  }
}

function modelToProduct(model: ManifestModel): LandscapeProduct {
  return {
    id: model.id,
    name: model.name,
    vendor: model.vendor,
    category: 'model',
    description: model.description,
    websiteUrl: model.websiteUrl || undefined,
    docsUrl: model.docsUrl || undefined,
    path: `/models/${model.id}`,
  }
}

function providerToProduct(provider: ManifestProvider): LandscapeProduct {
  return {
    id: provider.id,
    name: provider.name,
    vendor: provider.vendor,
    category: 'provider',
    description: provider.description,
    websiteUrl: provider.websiteUrl,
    docsUrl: provider.docsUrl || undefined,
    githubUrl: null, // Providers don't have githubUrl in schema
    githubStars: null, // Providers don't have GitHub stars tracking
    path: `/model-providers/${provider.id}`,
  }
}

// =============================================================================
// CORE DATA AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Get all products as a unified array
 */
export function getAllProducts(): LandscapeProduct[] {
  const products: LandscapeProduct[] = [
    ...idesData.map(ideToProduct),
    ...clisData.map(cliToProduct),
    ...extensionsData.map(extensionToProduct),
    ...modelsData.map(modelToProduct),
    ...providersData.map(providerToProduct),
  ]

  return products
}

/**
 * Get products by a specific vendor
 */
export function getProductsByVendor(vendorName: string): LandscapeProduct[] {
  const normalizedVendorName = vendorName.toLowerCase()
  const products: LandscapeProduct[] = []

  idesData.forEach(ide => {
    if (ide.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(ideToProduct(ide))
    }
  })

  clisData.forEach(cli => {
    if (cli.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(cliToProduct(cli))
    }
  })

  extensionsData.forEach(ext => {
    if (ext.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(extensionToProduct(ext))
    }
  })

  modelsData.forEach(model => {
    if (model.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(modelToProduct(model))
    }
  })

  providersData.forEach(provider => {
    const matchesVendor = provider.vendor?.toLowerCase() === normalizedVendorName
    const matchesName = provider.name?.toLowerCase() === normalizedVendorName

    if (matchesVendor || matchesName) {
      products.push(providerToProduct(provider))
    }
  })

  return products
}

/**
 * Determine vendor type based on products
 */
function determineVendorType(products: {
  ides: LandscapeProduct[]
  clis: LandscapeProduct[]
  extensions: LandscapeProduct[]
  models: LandscapeProduct[]
  providers: LandscapeProduct[]
}): VendorType {
  const hasIDE = products.ides.length > 0
  const hasCLI = products.clis.length > 0
  const hasExtension = products.extensions.length > 0
  const hasModel = products.models.length > 0
  const hasProvider = products.providers.length > 0

  const hasTools = hasIDE || hasCLI || hasExtension
  const hasAI = hasModel || hasProvider

  if (hasIDE && hasCLI && hasExtension) {
    return 'full-stack'
  }

  if (hasAI && hasTools) {
    return 'ai-native'
  }

  if (hasTools && !hasAI) {
    return 'tool-only'
  }

  // Only has Provider (no Model, no Tools) -> Provider Only
  if (hasProvider && !hasModel && !hasTools) {
    return 'provider-only'
  }

  // Has Model (with or without Provider, but no Tools) -> Model Only
  if (hasModel && !hasTools) {
    return 'model-only'
  }

  // Fallback (should not reach here in normal cases)
  return 'provider-only'
}

/**
 * Build vendor ecosystem map
 */
export function buildVendorEcosystems(): VendorEcosystem[] {
  const ecosystems: VendorEcosystem[] = []

  vendorsData.forEach(vendor => {
    const allProducts = getProductsByVendor(vendor.name)

    const products = {
      ides: allProducts.filter(p => p.category === 'ide'),
      clis: allProducts.filter(p => p.category === 'cli'),
      extensions: allProducts.filter(p => p.category === 'extension'),
      models: allProducts.filter(p => p.category === 'model'),
      providers: allProducts.filter(p => p.category === 'provider'),
    }

    const totalProducts = allProducts.length

    if (totalProducts > 0) {
      ecosystems.push({
        vendor,
        products,
        totalProducts,
        type: determineVendorType(products),
      })
    }
  })

  return ecosystems.sort((a, b) => b.totalProducts - a.totalProducts)
}

/**
 * Build Extension-IDE compatibility mappings
 */
export function buildExtensionIDECompatibility(): ExtensionIDECompatibility[] {
  const compatibilities: ExtensionIDECompatibility[] = []

  extensionsData.forEach(ext => {
    if (ext.supportedIdes && ext.supportedIdes.length > 0) {
      const supportedIdes = ext.supportedIdes
        .map(supported => {
          const ide = idesData.find(i => i.id === supported.ideId)
          if (!ide) return null

          return {
            ideId: ide.id,
            ideName: ide.name,
            marketplaceUrl: supported.marketplaceUrl,
            installUri: supported.installUri,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      compatibilities.push({
        extensionId: ext.id,
        extensionName: ext.name,
        supportedIdes,
      })
    }
  })

  return compatibilities
}

// =============================================================================
// MATRIX DATA BUILDER
// =============================================================================

export interface VendorMatrixRow {
  vendorId: string
  vendorName: string
  vendorType: VendorType
  cells: {
    ide: LandscapeProduct[]
    cli: LandscapeProduct[]
    extension: LandscapeProduct[]
    model: LandscapeProduct[]
    provider: LandscapeProduct[]
  }
}

/**
 * Build vendor-product matrix data
 */
export function buildVendorMatrix(): VendorMatrixRow[] {
  const ecosystems = buildVendorEcosystems()

  return ecosystems.map(eco => ({
    vendorId: eco.vendor.id,
    vendorName: eco.vendor.name,
    vendorType: eco.type,
    cells: {
      ide: eco.products.ides,
      cli: eco.products.clis,
      extension: eco.products.extensions,
      model: eco.products.models,
      provider: eco.products.providers,
    },
  }))
}
