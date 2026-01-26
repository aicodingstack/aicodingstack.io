/**
 * URL building utilities
 */

import { BASE_URL, LOCALES } from './config'
import {
  getArticleSlugs,
  getDocSlugs,
  getDynamicRoutes,
  getSlugsFromManifests,
  getStaticRoutes,
} from './routes'

/**
 * Get locale prefix for URL building
 * Returns '' for 'en' (default locale) and '/{locale}' for others
 */
function getLocalePrefix(locale: string): string {
  return locale === 'en' ? '' : `/${locale}`
}

/**
 * URL info interface
 */
export interface UrlInfo {
  url: string
  route: string
  locale: string
  type: 'static' | 'dynamic'
  slug?: string
}

/**
 * Build URLs options
 */
export interface BuildUrlsOptions {
  allLocales?: boolean
  allSlugs?: boolean
}

/**
 * Build URLs based on configuration
 */
export function buildUrls({
  allLocales = false,
  allSlugs = false,
}: BuildUrlsOptions = {}): UrlInfo[] {
  const urls: UrlInfo[] = []
  const localesToUse = allLocales ? LOCALES : ['en']

  // Static routes
  const staticRoutes = getStaticRoutes()
  for (const route of staticRoutes) {
    for (const locale of localesToUse) {
      const localePrefix = getLocalePrefix(locale)
      const url = `${BASE_URL}${localePrefix}${route}`
      urls.push({ url, route, locale, type: 'static' })
    }
  }

  // Dynamic routes with [slug]
  const dynamicRoutes = getDynamicRoutes()

  for (const { path: routePath, category } of dynamicRoutes) {
    const slugs = getSlugsFromManifests(category)
    const slugsToVisit = allSlugs ? slugs : slugs.slice(0, 1)

    for (const slug of slugsToVisit) {
      for (const locale of localesToUse) {
        const localePrefix = getLocalePrefix(locale)
        const url = `${BASE_URL}${localePrefix}${routePath}/${slug}`
        urls.push({ url, route: `${routePath}/${slug}`, locale, type: 'dynamic', slug })
      }
    }
  }

  // Articles
  const articleSlugs = getArticleSlugs()
  const articleSlugsToVisit = allSlugs ? articleSlugs : articleSlugs.slice(0, 1)

  for (const slug of articleSlugsToVisit) {
    for (const locale of localesToUse) {
      const localePrefix = getLocalePrefix(locale)
      const url = `${BASE_URL}${localePrefix}/articles/${slug}`
      urls.push({ url, route: `/articles/${slug}`, locale, type: 'dynamic', slug })
    }
  }

  // Docs
  const docSlugs = getDocSlugs()
  const docSlugsToVisit = allSlugs ? docSlugs : docSlugs.slice(0, 1)

  for (const slug of docSlugsToVisit) {
    for (const locale of localesToUse) {
      const localePrefix = getLocalePrefix(locale)
      const url = `${BASE_URL}${localePrefix}/docs/${slug}`
      urls.push({ url, route: `/docs/${slug}`, locale, type: 'dynamic', slug })
    }
  }

  return urls
}
