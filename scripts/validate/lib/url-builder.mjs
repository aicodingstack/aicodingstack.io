/**
 * URL building utilities
 */

import { BASE_URL, getLocalePrefix, LOCALES } from './config.mjs'
import {
  getArticleSlugs,
  getDocSlugs,
  getDynamicRoutes,
  getSlugsFromManifests,
  getStaticRoutes,
} from './routes.mjs'

/**
 * Build URLs based on configuration
 * @param {Object} options - Configuration options
 * @param {boolean} options.allLocales - Whether to visit all locales or just English
 * @param {boolean} options.allSlugs - Whether to visit all slugs or just one per route type
 * @returns {Array} Array of URL info objects
 */
export function buildUrls({ allLocales = false, allSlugs = false }) {
  const urls = []
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
    const slugsToVisit = allSlugs ? slugs : slugs.slice(0, 1) // Only first slug if not all slugs

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
