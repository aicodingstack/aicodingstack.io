/**
 * AI Coding Landscape Data Aggregation Layer
 *
 * This module aggregates and transforms manifest data for the /ai-coding-landscape page.
 * It provides utilities for:
 * - Building vendor-to-product mappings
 * - Calculating ecosystem statistics
 * - Creating relationship graphs between products
 * - Extension-IDE compatibility mappings
 */

import {
  idesData,
  clisData,
  extensionsData,
  modelsData,
  providersData,
  vendorsData,
} from './generated';
import { getGithubStars } from './generated/github-stars';
import type {
  ManifestIDE,
  ManifestCLI,
  ManifestExtension,
  ManifestModel,
  ManifestProvider,
  ManifestVendor,
} from '@/types/manifests';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ProductCategory = 'ide' | 'cli' | 'extension' | 'model' | 'provider';

export interface LandscapeProduct {
  id: string;
  name: string;
  vendor: string;
  category: ProductCategory;
  description: string;
  websiteUrl?: string;
  docsUrl?: string;
  githubUrl?: string | null;
  githubStars?: number | null;
  license?: string;
  latestVersion?: string;
  path: string;
}

export interface VendorEcosystem {
  vendor: ManifestVendor;
  products: {
    ides: LandscapeProduct[];
    clis: LandscapeProduct[];
    extensions: LandscapeProduct[];
    models: LandscapeProduct[];
    providers: LandscapeProduct[];
  };
  totalProducts: number;
  type: VendorType;
}

export type VendorType =
  | 'full-stack' // Has IDE + CLI + Extension
  | 'ai-native' // Has Model + (IDE or CLI or Extension)
  | 'tool-only' // Only has IDE/CLI/Extension
  | 'model-only' // Only has Model/Provider
  | 'provider-only'; // Only has Provider

export interface ExtensionIDECompatibility {
  extensionId: string;
  extensionName: string;
  supportedIdes: Array<{
    ideId: string;
    ideName: string;
    marketplaceUrl?: string | null;
    installUri?: string | null;
    installCommand?: string | null;
  }>;
}

export interface LandscapeStats {
  totalProducts: number;
  totalVendors: number;
  counts: {
    ides: number;
    clis: number;
    extensions: number;
    models: number;
    providers: number;
  };
  openSourceCount: number;
  proprietaryCount: number;
  platformSupport: {
    macOS: number;
    windows: number;
    linux: number;
  };
  topByStars: Array<{
    id: string;
    name: string;
    category: ProductCategory;
    stars: number;
  }>;
  vendorsByProductCount: Array<{
    vendorId: string;
    vendorName: string;
    productCount: number;
  }>;
}

export interface RelationshipNode {
  id: string;
  type: 'vendor' | ProductCategory;
  data: {
    label: string;
    description?: string;
    category?: ProductCategory;
    vendorId?: string;
  };
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  type: 'vendor-product' | 'extension-ide' | 'related-product';
  label?: string;
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
    docsUrl: ide.docsUrl,
    githubUrl: ide.githubUrl,
    githubStars: getGithubStars('ides', ide.id),
    license: ide.license,
    latestVersion: ide.latestVersion,
    path: `/ides/${ide.id}`,
  };
}

function cliToProduct(cli: ManifestCLI): LandscapeProduct {
  return {
    id: cli.id,
    name: cli.name,
    vendor: cli.vendor,
    category: 'cli',
    description: cli.description,
    websiteUrl: cli.websiteUrl,
    docsUrl: cli.docsUrl,
    githubUrl: cli.githubUrl,
    githubStars: getGithubStars('clis', cli.id),
    license: cli.license,
    latestVersion: cli.latestVersion,
    path: `/clis/${cli.id}`,
  };
}

function extensionToProduct(ext: ManifestExtension): LandscapeProduct {
  return {
    id: ext.id,
    name: ext.name,
    vendor: ext.vendor,
    category: 'extension',
    description: ext.description,
    websiteUrl: ext.websiteUrl,
    docsUrl: ext.docsUrl,
    githubUrl: ext.githubUrl,
    githubStars: getGithubStars('extensions', ext.id),
    license: ext.license,
    latestVersion: ext.latestVersion,
    path: `/extensions/${ext.id}`,
  };
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
  };
}

function providerToProduct(provider: ManifestProvider): LandscapeProduct {
  return {
    id: provider.id,
    name: provider.name,
    vendor: provider.vendor,
    category: 'provider',
    description: provider.description,
    websiteUrl: provider.websiteUrl,
    docsUrl: provider.docsUrl,
    githubUrl: provider.githubUrl,
    githubStars: null, // Providers don't have GitHub stars tracking
    path: `/model-providers/${provider.id}`,
  };
}

// =============================================================================
// CORE DATA AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Get all products as a unified array
 */
export function getAllProducts(): LandscapeProduct[] {
  const products: LandscapeProduct[] = [];

  idesData.forEach((ide) => products.push(ideToProduct(ide)));
  clisData.forEach((cli) => products.push(cliToProduct(cli)));
  extensionsData.forEach((ext) => products.push(extensionToProduct(ext)));
  modelsData.forEach((model) => products.push(modelToProduct(model)));
  providersData.forEach((provider) => products.push(providerToProduct(provider)));

  return products;
}

/**
 * Get products grouped by category
 */
export function getProductsByCategory() {
  return {
    ides: idesData.map(ideToProduct),
    clis: clisData.map(cliToProduct),
    extensions: extensionsData.map(extensionToProduct),
    models: modelsData.map(modelToProduct),
    providers: providersData.map(providerToProduct),
  };
}

/**
 * Get products by a specific vendor
 */
export function getProductsByVendor(vendorName: string): LandscapeProduct[] {
  const normalizedVendorName = vendorName.toLowerCase();
  const products: LandscapeProduct[] = [];

  idesData.forEach((ide) => {
    if (ide.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(ideToProduct(ide));
    }
  });

  clisData.forEach((cli) => {
    if (cli.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(cliToProduct(cli));
    }
  });

  extensionsData.forEach((ext) => {
    if (ext.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(extensionToProduct(ext));
    }
  });

  modelsData.forEach((model) => {
    if (model.vendor?.toLowerCase() === normalizedVendorName) {
      products.push(modelToProduct(model));
    }
  });

  providersData.forEach((provider) => {
    const matchesVendor = provider.vendor?.toLowerCase() === normalizedVendorName;
    const matchesName = provider.name?.toLowerCase() === normalizedVendorName;

    if (matchesVendor || matchesName) {
      products.push(providerToProduct(provider));
    }
  });

  return products;
}

/**
 * Determine vendor type based on products
 */
function determineVendorType(products: {
  ides: LandscapeProduct[];
  clis: LandscapeProduct[];
  extensions: LandscapeProduct[];
  models: LandscapeProduct[];
  providers: LandscapeProduct[];
}): VendorType {
  const hasIDE = products.ides.length > 0;
  const hasCLI = products.clis.length > 0;
  const hasExtension = products.extensions.length > 0;
  const hasModel = products.models.length > 0;
  const hasProvider = products.providers.length > 0;

  const hasTools = hasIDE || hasCLI || hasExtension;
  const hasAI = hasModel || hasProvider;

  if (hasIDE && hasCLI && hasExtension) {
    return 'full-stack';
  }

  if (hasAI && hasTools) {
    return 'ai-native';
  }

  if (hasTools && !hasAI) {
    return 'tool-only';
  }

  if (hasModel && !hasProvider && !hasTools) {
    return 'model-only';
  }

  return 'provider-only';
}

/**
 * Build vendor ecosystem map
 */
export function buildVendorEcosystems(): VendorEcosystem[] {
  const ecosystems: VendorEcosystem[] = [];

  vendorsData.forEach((vendor) => {
    const allProducts = getProductsByVendor(vendor.name);

    const products = {
      ides: allProducts.filter((p) => p.category === 'ide'),
      clis: allProducts.filter((p) => p.category === 'cli'),
      extensions: allProducts.filter((p) => p.category === 'extension'),
      models: allProducts.filter((p) => p.category === 'model'),
      providers: allProducts.filter((p) => p.category === 'provider'),
    };

    const totalProducts = allProducts.length;

    if (totalProducts > 0) {
      ecosystems.push({
        vendor,
        products,
        totalProducts,
        type: determineVendorType(products),
      });
    }
  });

  return ecosystems.sort((a, b) => b.totalProducts - a.totalProducts);
}

/**
 * Build Extension-IDE compatibility mappings
 */
export function buildExtensionIDECompatibility(): ExtensionIDECompatibility[] {
  const compatibilities: ExtensionIDECompatibility[] = [];

  extensionsData.forEach((ext) => {
    if (ext.supportedIdes && ext.supportedIdes.length > 0) {
      const supportedIdes = ext.supportedIdes
        .map((supported) => {
          const ide = idesData.find((i) => i.id === supported.ideId);
          if (!ide) return null;

          return {
            ideId: ide.id,
            ideName: ide.name,
            marketplaceUrl: supported.marketplaceUrl,
            installUri: supported.installUri,
            installCommand: supported.installCommand,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      compatibilities.push({
        extensionId: ext.id,
        extensionName: ext.name,
        supportedIdes,
      });
    }
  });

  return compatibilities;
}

/**
 * Calculate ecosystem statistics
 */
export function calculateLandscapeStats(): LandscapeStats {
  const allProducts = getAllProducts();

  // Count by category
  const counts = {
    ides: idesData.length,
    clis: clisData.length,
    extensions: extensionsData.length,
    models: modelsData.length,
    providers: providersData.length,
  };

  // License statistics
  let openSourceCount = 0;
  let proprietaryCount = 0;

  [...idesData, ...clisData, ...extensionsData].forEach((product) => {
    if (product.license && product.license.toLowerCase() !== 'proprietary') {
      openSourceCount++;
    } else {
      proprietaryCount++;
    }
  });

  // Platform support
  const platformSupport = {
    macOS: 0,
    windows: 0,
    linux: 0,
  };

  [...idesData, ...clisData].forEach((product) => {
    if (product.platforms) {
      product.platforms.forEach((platform) => {
        if (platform.os === 'macOS') platformSupport.macOS++;
        if (platform.os === 'Windows') platformSupport.windows++;
        if (platform.os === 'Linux') platformSupport.linux++;
      });
    }
  });

  // Top by GitHub stars
  const productsWithStars = allProducts
    .filter((p) => p.githubStars && p.githubStars > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      stars: p.githubStars!,
    }))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10);

  // Vendors by product count
  const vendorProductCounts = new Map<string, { name: string; count: number }>();

  allProducts.forEach((product) => {
    const existing = vendorProductCounts.get(product.vendor);
    if (existing) {
      existing.count++;
    } else {
      vendorProductCounts.set(product.vendor, {
        name: product.vendor,
        count: 1,
      });
    }
  });

  const vendorsByProductCount = Array.from(vendorProductCounts.entries())
    .map(([id, data]) => ({
      vendorId: id.toLowerCase().replace(/\s+/g, '-'),
      vendorName: data.name,
      productCount: data.count,
    }))
    .sort((a, b) => b.productCount - a.productCount);

  return {
    totalProducts: allProducts.length,
    totalVendors: vendorsData.length,
    counts,
    openSourceCount,
    proprietaryCount,
    platformSupport,
    topByStars: productsWithStars,
    vendorsByProductCount,
  };
}

/**
 * Build relationship graph data for visualization
 */
export function buildRelationshipGraph(): {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
} {
  const nodes: RelationshipNode[] = [];
  const edges: RelationshipEdge[] = [];
  const nodeIds = new Set<string>();

  // Add vendor nodes
  vendorsData.forEach((vendor) => {
    const vendorNodeId = `vendor-${vendor.id}`;
    nodes.push({
      id: vendorNodeId,
      type: 'vendor',
      data: {
        label: vendor.name,
        description: vendor.description,
      },
    });
    nodeIds.add(vendorNodeId);
  });

  // Add product nodes and vendor-product edges
  const allProducts = getAllProducts();

  allProducts.forEach((product) => {
    const productNodeId = `${product.category}-${product.id}`;

    // Add product node
    if (!nodeIds.has(productNodeId)) {
      nodes.push({
        id: productNodeId,
        type: product.category,
        data: {
          label: product.name,
          description: product.description,
          category: product.category,
          vendorId: product.vendor.toLowerCase().replace(/\s+/g, '-'),
        },
      });
      nodeIds.add(productNodeId);
    }

    // Add vendor-product edge
    const vendorNodeId = `vendor-${product.vendor.toLowerCase().replace(/\s+/g, '-')}`;
    if (nodeIds.has(vendorNodeId)) {
      edges.push({
        id: `edge-${vendorNodeId}-${productNodeId}`,
        source: vendorNodeId,
        target: productNodeId,
        type: 'vendor-product',
      });
    }
  });

  // Add extension-IDE compatibility edges
  const compatibilities = buildExtensionIDECompatibility();

  compatibilities.forEach((compat) => {
    const extensionNodeId = `extension-${compat.extensionId}`;

    compat.supportedIdes.forEach((ide) => {
      const ideNodeId = `ide-${ide.ideId}`;

      if (nodeIds.has(extensionNodeId) && nodeIds.has(ideNodeId)) {
        edges.push({
          id: `edge-${extensionNodeId}-${ideNodeId}`,
          source: extensionNodeId,
          target: ideNodeId,
          type: 'extension-ide',
          label: 'supports',
        });
      }
    });
  });

  // Add related product edges
  [...idesData, ...clisData, ...extensionsData].forEach((product) => {
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const sourceNodeId = `${product.id.includes('ide') ? 'ide' : product.id.includes('cli') ? 'cli' : 'extension'}-${product.id}`;

      product.relatedProducts.forEach((related) => {
        const targetNodeId = `${related.type}-${related.productId}`;

        if (nodeIds.has(sourceNodeId) && nodeIds.has(targetNodeId)) {
          edges.push({
            id: `edge-${sourceNodeId}-${targetNodeId}`,
            source: sourceNodeId,
            target: targetNodeId,
            type: 'related-product',
            label: 'related to',
          });
        }
      });
    }
  });

  return { nodes, edges };
}

// =============================================================================
// MATRIX DATA BUILDER
// =============================================================================

export interface VendorMatrixRow {
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  cells: {
    ide: LandscapeProduct[];
    cli: LandscapeProduct[];
    extension: LandscapeProduct[];
    model: LandscapeProduct[];
    provider: LandscapeProduct[];
  };
}

/**
 * Build vendor-product matrix data
 */
export function buildVendorMatrix(): VendorMatrixRow[] {
  const ecosystems = buildVendorEcosystems();

  return ecosystems.map((eco) => ({
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
  }));
}
