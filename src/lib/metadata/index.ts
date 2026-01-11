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
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_EXAMPLES,
  CATEGORY_SEO_KEYWORDS,
  type Category,
  type Locale,
  METADATA_DEFAULTS,
  OG_IMAGE_CONFIG,
  SEO_CONFIG,
  SITE_CONFIG,
} from './config'
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
  buildKeywords,
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
  mapLocaleToOG,
} from './helpers'
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
