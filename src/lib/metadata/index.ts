/**
 * Metadata Library
 * Centralized metadata generation utilities for AI Coding Stack
 *
 * @example
 * // Import generators for specific page types
 * import { generateListPageMetadata, generateSoftwareDetailMetadata } from '@/lib/metadata';
 *
 * // Use in page components
 * export async function generateMetadata({ params }) {
 *   return await generateListPageMetadata({
 *     locale: params.locale,
 *     category: 'ides',
 *     translationNamespace: 'pages.ides',
 *   });
 * }
 */

// Export configuration
export {
  type Category,
  type Locale,
  METADATA_CATEGORIES,
  METADATA_DEFAULTS,
  OG_IMAGE_CONFIG,
  SEO_CONFIG,
  SITE_CONFIG,
} from './config'
// Export generator parameter types
export type {
  ArticleMetadataParams,
  ComparisonMetadataParams,
  DocsMetadataParams,
  ListPageMetadataParams,
  ModelDetailMetadataParams,
  SoftwareDetailMetadataParams,
  StaticPageMetadataParams,
} from './generators'
// Export all generators
export {
  generateArticleMetadata,
  generateComparisonMetadata,
  generateDocsMetadata,
  generateListPageMetadata,
  generateModelDetailMetadata,
  generateSoftwareDetailMetadata,
  generateStaticPageMetadata,
} from './generators'
// Export all helpers
export {
  buildAlternates,
  buildCanonicalUrl,
  buildDetailPageTitle,
  buildFullUrl,
  buildLanguageAlternates,
  buildListPageTitle,
  buildOGImage,
  buildOpenGraph,
  buildProductDescription,
  buildTitle,
  buildTwitterCard,
  formatPlatforms,
  formatPriceForDescription,
  getAlternateOGLocale,
  getCategoryRoutePath,
  mapLocaleToOG,
} from './helpers'
export type { PageTranslationRequirement, TranslationValidationError } from './i18n-validation'
// Export i18n translation validation
export {
  assertPageTranslationComplete,
  getTranslationStats,
  PAGE_TRANSLATION_REQUIREMENTS,
  REQUIRED_TRANSLATION_KEYS,
  validateAllPageTranslations,
  validatePageTranslations,
} from './i18n-validation'
export type { GeneratorType, PageMetadataConfig } from './registry'
// Export page registry
export {
  getPageConfig,
  getPagesByCategory,
  getPagesByGeneratorType,
  getRegistryStats,
  getTotalPageCount,
  isRegisteredPage,
  PAGE_REGISTRY,
  pageRequiresSlug,
} from './registry'
export type {
  RecommendedMetadataFields,
  RequiredMetadataFields,
  ValidationError,
} from './required-fields'
// Export metadata validation
export {
  assertMetadataComplete,
  hasRequiredFields,
  logMetadataSummary,
  validateMetadataCompleteness,
} from './required-fields'
// Export robots configuration
export {
  DEFAULT_ROBOTS,
  getCustomRobots,
  getPageRobots,
  NOFOLLOW_ROBOTS,
  NOINDEX_ROBOTS,
} from './robots'
// Export metadata templates
export type { PageMetadataOptions, PageType, RootLayoutMetadataOptions } from './templates'
export {
  createBaseMetadata,
  createPageMetadata,
  createRootLayoutMetadata,
  mergeMetadata,
} from './templates'
