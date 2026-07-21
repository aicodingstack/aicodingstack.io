/**
 * Page Metadata Registry
 * Central registry mapping all pages to their metadata generation strategy
 */

import type { Category } from './config'
import type { PageType } from './templates'

/**
 * Generator type for each page
 */
export type GeneratorType =
  | 'static'
  | 'list'
  | 'software-detail'
  | 'model-detail'
  | 'comparison'
  | 'article'
  | 'docs'

/**
 * Page metadata configuration
 */
export interface PageMetadataConfig {
  generatorType: GeneratorType
  pageType: PageType
  category?: Category
  translationNamespace?: string
  requiresSlug?: boolean
  requiresProduct?: boolean
  requiresModel?: boolean
  specialConfig?: {
    noindex?: boolean
    includeSchema?: boolean
  }
}

/**
 * Complete page registry
 * Maps page routes to their metadata configuration
 */
export const PAGE_REGISTRY: Record<string, PageMetadataConfig> = {
  // ========== Static Pages (11) ==========
  '/': {
    generatorType: 'static',
    pageType: 'home',
    specialConfig: { includeSchema: true }, // FAQ Schema
  },
  '/manifesto': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/docs': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/articles': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/search': {
    generatorType: 'static',
    pageType: 'search',
    specialConfig: { noindex: true },
  },
  '/ai-coding-landscape': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/ai-coding-stack': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/open-source-rank': {
    generatorType: 'static',
    pageType: 'static',
  },
  '/curated-collections': {
    generatorType: 'static',
    pageType: 'static',
  },

  // ========== List Pages (6) ==========
  '/models': {
    generatorType: 'list',
    pageType: 'list',
    category: 'models',
    translationNamespace: 'pages.models',
  },
  '/ides': {
    generatorType: 'list',
    pageType: 'list',
    category: 'ides',
    translationNamespace: 'pages.ides',
  },
  '/clis': {
    generatorType: 'list',
    pageType: 'list',
    category: 'clis',
    translationNamespace: 'pages.clis',
  },
  '/desktops': {
    generatorType: 'list',
    pageType: 'list',
    category: 'desktops',
    translationNamespace: 'pages.desktops',
  },
  '/extensions': {
    generatorType: 'list',
    pageType: 'list',
    category: 'extensions',
    translationNamespace: 'pages.extensions',
  },
  '/model-providers': {
    generatorType: 'list',
    pageType: 'list',
    category: 'modelProviders',
    translationNamespace: 'pages.modelProviders',
  },
  '/vendors': {
    generatorType: 'list',
    pageType: 'list',
    category: 'vendors',
    translationNamespace: 'pages.vendors',
  },

  // ========== Detail Pages (8) ==========
  '/models/[slug]': {
    generatorType: 'model-detail',
    pageType: 'detail',
    category: 'models',
    translationNamespace: 'pages.modelDetail',
    requiresSlug: true,
    requiresModel: true,
  },
  '/ides/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'ides',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/clis/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'clis',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/desktops/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'desktops',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/extensions/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'extensions',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/model-providers/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'modelProviders',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/vendors/[slug]': {
    generatorType: 'software-detail',
    pageType: 'detail',
    category: 'vendors',
    requiresSlug: true,
    requiresProduct: true,
  },
  '/articles/[slug]': {
    generatorType: 'article',
    pageType: 'article',
    requiresSlug: true,
  },
  '/docs/[slug]': {
    generatorType: 'docs',
    pageType: 'docs',
    requiresSlug: true,
  },

  // ========== Comparison Pages (4) ==========
  '/models/compare': {
    generatorType: 'comparison',
    pageType: 'comparison',
    category: 'models',
  },
  '/ides/comparison': {
    generatorType: 'comparison',
    pageType: 'comparison',
    category: 'ides',
  },
  '/clis/comparison': {
    generatorType: 'comparison',
    pageType: 'comparison',
    category: 'clis',
  },
  '/extensions/comparison': {
    generatorType: 'comparison',
    pageType: 'comparison',
    category: 'extensions',
  },
}

// 总计: 29 个页面
// - 静态页面: 11 个（包括首页、manifesto、docs、articles、search 等）
// - 列表页面: 6 个
// - 详情页面: 8 个
// - 比较页面: 4 个

/**
 * Get page configuration by route
 */
export function getPageConfig(route: string): PageMetadataConfig | undefined {
  return PAGE_REGISTRY[route]
}

/**
 * Validate that a page exists in the registry
 */
export function isRegisteredPage(route: string): boolean {
  return route in PAGE_REGISTRY
}

/**
 * Get all pages by generator type
 */
export function getPagesByGeneratorType(generatorType: GeneratorType): string[] {
  return Object.entries(PAGE_REGISTRY)
    .filter(([, config]) => config.generatorType === generatorType)
    .map(([route]) => route)
}

/**
 * Get all pages by category
 */
export function getPagesByCategory(category: Category): string[] {
  return Object.entries(PAGE_REGISTRY)
    .filter(([, config]) => config.category === category)
    .map(([route]) => route)
}

/**
 * Type guard: check if a page requires a slug parameter
 */
export function pageRequiresSlug(route: string): boolean {
  const config = getPageConfig(route)
  return config?.requiresSlug ?? false
}

/**
 * Get total page count
 */
export function getTotalPageCount(): number {
  return Object.keys(PAGE_REGISTRY).length
}

/**
 * Get statistics about the registry
 */
export function getRegistryStats() {
  const stats = {
    total: getTotalPageCount(),
    byGeneratorType: {} as Record<GeneratorType, number>,
    byPageType: {} as Record<PageType, number>,
    byCategory: {} as Record<Category, number>,
  }

  Object.values(PAGE_REGISTRY).forEach(config => {
    // Count by generator type
    stats.byGeneratorType[config.generatorType] =
      (stats.byGeneratorType[config.generatorType] || 0) + 1

    // Count by page type
    stats.byPageType[config.pageType] = (stats.byPageType[config.pageType] || 0) + 1

    // Count by category
    if (config.category) {
      stats.byCategory[config.category] = (stats.byCategory[config.category] || 0) + 1
    }
  })

  return stats
}
