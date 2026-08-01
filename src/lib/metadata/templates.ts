/**
 * Metadata Templates
 * Reusable metadata templates for consistent metadata across all pages
 * Implements DRY principle and ensures all pages have complete metadata
 */

import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { SITE_CONFIG } from './config'
import { getPageRobots } from './robots'

/**
 * Page types for different metadata templates
 */
export type PageType =
  | 'home'
  | 'list'
  | 'detail'
  | 'comparison'
  | 'article'
  | 'docs'
  | 'search'
  | 'static'

/**
 * Create base metadata that all pages inherit
 * Contains fields that should be present on every page
 */
export function createBaseMetadata(_locale: Locale, pageType: PageType = 'static'): Metadata {
  return {
    // metadataBase is set in root layout only, don't repeat it
    robots: getPageRobots(pageType),
    // Icons are auto-detected by Next.js from /app/icon.svg, /app/apple-icon.svg, etc.
    // Don't manually specify icons unless using custom paths
  }
}

/**
 * Options for creating page metadata
 */
export interface PageMetadataOptions {
  locale: Locale
  pageType: PageType
  title: string
  description: string
  canonical: string
  languageAlternates?: Record<string, string>
  openGraph?: Metadata['openGraph']
  twitter?: Metadata['twitter']
  other?: Metadata['other']
}

/**
 * Create complete page metadata
 * Combines base metadata with page-specific fields
 */
export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const base = createBaseMetadata(options.locale, options.pageType)

  const metadata: Metadata = {
    ...base,
    title: options.title,
    description: options.description,
    alternates: {
      canonical: options.canonical,
      languages: options.languageAlternates,
    },
  }

  if (options.openGraph) {
    metadata.openGraph = options.openGraph
  }

  if (options.twitter) {
    metadata.twitter = options.twitter
  }

  if (options.other) {
    metadata.other = options.other
  }

  return metadata
}

/**
 * Create root layout metadata
 * Special template for the root layout with additional global fields
 */
export interface RootLayoutMetadataOptions {
  locale: Locale
  title: string
  description: string
  canonical: string
  languageAlternates: Record<string, string>
  openGraph: Metadata['openGraph']
  twitter: Metadata['twitter']
}

export function createRootLayoutMetadata(options: RootLayoutMetadataOptions): Metadata {
  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      default: options.title,
      template: `%s - ${SITE_CONFIG.name}`,
    },
    description: options.description,
    robots: getPageRobots('home'),
    // Authors, creator, publisher for better SEO
    authors: [{ name: `${SITE_CONFIG.name} Team` }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    // Icons auto-detected from files
    alternates: {
      canonical: options.canonical,
      languages: options.languageAlternates,
    },
    appleWebApp: {
      capable: true,
      title: SITE_CONFIG.name,
      statusBarStyle: 'default',
    },
    // Resource hints for better performance
    other: {
      'x-dns-prefetch-control': 'on',
    },
    openGraph: options.openGraph,
    twitter: options.twitter,
  }
}

/**
 * Merge metadata with defaults
 * Useful for extending base metadata with page-specific overrides
 */
export function mergeMetadata(base: Metadata, override: Partial<Metadata>): Metadata {
  return {
    ...base,
    ...override,
    // Deep merge for nested objects
    alternates: {
      ...base.alternates,
      ...override.alternates,
    },
    openGraph: {
      ...base.openGraph,
      ...override.openGraph,
    },
    twitter: {
      ...base.twitter,
      ...override.twitter,
    },
    other: {
      ...base.other,
      ...override.other,
    },
  }
}
