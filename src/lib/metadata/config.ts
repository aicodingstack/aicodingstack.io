/**
 * Metadata Configuration
 * Centralized configuration for site-wide metadata constants and structural categories
 */

import { defaultLocale, locales } from '@/i18n/config'

export const SITE_CONFIG = {
  name: 'AI Coding Stack',
  url: 'https://aicodingstack.io',
  domain: 'aicodingstack.io',
  twitter: {
    site: '@aicodingstack',
    creator: '@aicodingstack',
  },
  defaultLocale,
  supportedLocales: locales,
} as const

export const OG_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  defaultImage: '/og-image.png',
  paths: {
    ides: '/og-images/ides',
    clis: '/og-images/clis',
    desktops: '/og-images/desktops',
    extensions: '/og-images/extensions',
    models: '/og-images/models',
    modelProviders: '/og-images/model-providers',
    vendors: '/og-images/vendors',
    articles: '/og-images/articles',
  },
} as const

export const METADATA_DEFAULTS = {
  currentYear: new Date().getUTCFullYear(),
  titleSeparator: ' - ',
  listSeparator: ' | ',
  siteName: 'AI Coding Stack',
  revalidate: 3600, // 1 hour ISR
} as const

/**
 * SEO Configuration
 * Additional SEO settings including robots directives and verification
 */
export const SEO_CONFIG = {
  /**
   * Site verification codes for search engines
   * Set these via environment variables for security
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  /**
   * Author and publisher information for better SEO
   */
  authors: [{ name: `${SITE_CONFIG.name} Team` }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  /**
   * Category for app stores
   */
  category: 'Technology',
} as const

/**
 * Category identifiers used by metadata generators and category routes.
 * Search terms and product examples belong in localized page content or
 * schema-validated catalog data, not in this structural registry.
 */
export const METADATA_CATEGORIES = [
  'ides',
  'clis',
  'desktops',
  'extensions',
  'models',
  'modelProviders',
  'vendors',
  'articles',
  'docs',
] as const

export type Category = (typeof METADATA_CATEGORIES)[number]
export type Locale = (typeof SITE_CONFIG.supportedLocales)[number]
