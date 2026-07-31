/**
 * Search utilities for AI Coding Stack
 * Provides unified search across all product categories
 */

import { getCollectionSearchEntries } from './collections'
import {
  buildManifestPath,
  getAllManifests,
  type ManifestItem,
  type ManifestCategory as RegistryCategory,
} from './manifest-registry'

/**
 * Search category type (re-export for convenience)
 */
export type SearchCategory = RegistryCategory | 'collections'
export type ManifestCategory = RegistryCategory

type SearchableData = {
  id: string
  name: string
  description: string
  translations?: { [locale: string]: { name?: string; description?: string } }
  [key: string]: unknown
}

export interface SearchResult {
  id: string
  name: string
  description: string
  category: SearchCategory
  href: string
  data: SearchableData
}

/**
 * Get localized name from manifest with fallback to default name
 */
function getLocalizedName(
  item: { name: string; translations?: { [locale: string]: { name?: string } } },
  locale?: string
): string {
  if (locale && item.translations?.[locale]?.name) {
    return item.translations[locale].name
  }
  return item.name
}

function getLocalizedDescription(
  item: { description: string; translations?: { [locale: string]: { description?: string } } },
  locale?: string
): string {
  if (locale && item.translations?.[locale]?.description) {
    return item.translations[locale].description
  }
  return item.description
}

function flattenSearchValue(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(flattenSearchValue)
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(flattenSearchValue)
  }
  return []
}

/**
 * Check if query matches item name (supports translations)
 */
function matchesQuery(
  item: {
    name: string
    description: string
    translations?: { [locale: string]: { name?: string; description?: string } }
  },
  query: string,
  locale?: string
): boolean {
  const lowerQuery = query.toLowerCase()
  const searchableItem = item as typeof item & {
    vendor?: string
    capabilities?: string[]
    inputModalities?: string[]
    outputModalities?: string[]
    platforms?: unknown
    type?: string
    aliases?: string[]
  }
  const translation = locale ? item.translations?.[locale] : undefined
  const values = [
    item.name,
    item.description,
    translation?.name,
    translation?.description,
    searchableItem.vendor,
    searchableItem.type,
    ...flattenSearchValue(searchableItem.aliases),
    ...flattenSearchValue(searchableItem.capabilities),
    ...flattenSearchValue(searchableItem.inputModalities),
    ...flattenSearchValue(searchableItem.outputModalities),
    ...flattenSearchValue(searchableItem.platforms),
  ]

  return values.some(value => value?.toLowerCase().includes(lowerQuery))
}

/**
 * Calculate relevance score for sorting results
 * Higher score = more relevant
 */
function calculateRelevance(
  item: {
    name: string
    description: string
    translations?: { [locale: string]: { name?: string; description?: string } }
  },
  query: string,
  locale?: string
): number {
  const lowerQuery = query.toLowerCase()
  const name = getLocalizedName(item, locale).toLowerCase()
  const description = getLocalizedDescription(item, locale).toLowerCase()
  const aliases = (item as typeof item & { aliases?: string[] }).aliases?.map(alias =>
    alias.toLowerCase()
  )

  // Exact match in name
  if (name === lowerQuery) return 100

  // Starts with query in name
  if (name.startsWith(lowerQuery)) return 90

  // Contains query in name
  if (name.includes(lowerQuery)) return 80

  if (aliases?.includes(lowerQuery)) return 75

  if (aliases?.some(alias => alias.includes(lowerQuery))) return 70

  if (description.includes(lowerQuery)) return 50

  return 10
}

/**
 * Build unified search index from all product manifests
 */
export function buildSearchIndex(locale?: string): SearchResult[] {
  const manifestResults = getAllManifests().map(({ category, data: item }) => ({
    id: item.id,
    name: getLocalizedName(item, locale),
    description: getLocalizedDescription(item, locale),
    category,
    href: buildManifestPath(category, item.id),
    data: item as ManifestItem & SearchableData,
  }))
  const collectionResults = getCollectionSearchEntries(locale ?? 'en').map(entry => ({
    ...entry,
    category: 'collections' as const,
    data: entry.data as SearchableData,
  }))

  return [...manifestResults, ...collectionResults]
}

/**
 * Search across all products
 * @param query - Search query string
 * @param locale - Optional locale for i18n search
 * @returns Array of search results sorted by relevance
 */
export function search(query: string, locale?: string): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const index = buildSearchIndex(locale)
  const results = index
    .filter(item => matchesQuery(item.data, query, locale))
    .map(item => ({
      ...item,
      relevance: calculateRelevance(item.data, query, locale),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .map(({ relevance, ...item }) => item)

  return results
}

/**
 * Generate autocomplete suggestions based on query
 * @param query - Search query string
 * @param locale - Optional locale for i18n search
 * @param limit - Maximum number of suggestions (default: 8)
 * @returns Array of suggested product names
 */
export function getAutocompleteSuggestions(
  query: string,
  locale?: string,
  limit: number = 8
): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const results = search(query, locale)
  return results.slice(0, limit)
}
