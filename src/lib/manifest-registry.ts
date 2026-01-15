/**
 * Unified Manifest Registry
 *
 * This module provides a unified abstraction for accessing all manifest data,
 * eliminating repetitive iteration patterns across landscape-data.ts, search.ts, etc.
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

/**
 * Supported manifest categories
 */
export type ManifestCategory = 'ides' | 'clis' | 'extensions' | 'models' | 'providers' | 'vendors'

/**
 * Unified manifest type for all categories
 */
export type ManifestItem =
  | ManifestIDE
  | ManifestCLI
  | ManifestExtension
  | ManifestModel
  | ManifestProvider
  | ManifestVendor

/**
 * Manifest entry with category information
 */
export interface ManifestEntry {
  category: ManifestCategory
  data: ManifestItem
}

/**
 * Category configuration
 */
export interface CategoryConfig {
  routeBase: string
  dataKey: ManifestCategory
}

/**
 * Category configuration mapping
 */
const CATEGORY_CONFIG: Record<ManifestCategory, CategoryConfig> = {
  ides: { routeBase: 'ides', dataKey: 'ides' },
  clis: { routeBase: 'clis', dataKey: 'clis' },
  extensions: { routeBase: 'extensions', dataKey: 'extensions' },
  models: { routeBase: 'models', dataKey: 'models' },
  providers: { routeBase: 'model-providers', dataKey: 'providers' },
  vendors: { routeBase: 'vendors', dataKey: 'vendors' },
}

/**
 * Data storage for all manifest categories
 */
const MANIFEST_DATA: Record<ManifestCategory, ManifestItem[]> = {
  ides: idesData,
  clis: clisData,
  extensions: extensionsData,
  models: modelsData,
  providers: providersData,
  vendors: vendorsData,
}

// =============================================================================
// CORE REGISTRY FUNCTIONS
// =============================================================================

/**
 * Get all manifest entries across all categories
 */
export function getAllManifests(): ManifestEntry[] {
  const entries: ManifestEntry[] = []

  for (const category of Object.keys(CATEGORY_CONFIG) as ManifestCategory[]) {
    for (const item of MANIFEST_DATA[category]) {
      entries.push({ category, data: item })
    }
  }

  return entries
}

/**
 * Get manifest data for a specific category
 */
export function getManifestsByCategory(category: ManifestCategory): ManifestItem[] {
  return MANIFEST_DATA[category]
}

/**
 * Get config for a category
 */
export function getCategoryConfig(category: ManifestCategory): CategoryConfig {
  return CATEGORY_CONFIG[category]
}

/**
 * Get all category names
 */
export function getAllCategories(): ManifestCategory[] {
  return Object.keys(CATEGORY_CONFIG) as ManifestCategory[]
}

/**
 * Get route base for a category
 */
export function getCategoryRouteBase(category: ManifestCategory): string {
  return CATEGORY_CONFIG[category].routeBase
}

/**
 * Build full path for a manifest entry
 */
export function buildManifestPath(category: ManifestCategory, id: string): string {
  return `/${getCategoryRouteBase(category)}/${id}`
}

/**
 * Find a manifest entry by category and ID
 */
export function findManifestEntry(category: ManifestCategory, id: string): ManifestItem | null {
  return MANIFEST_DATA[category].find(item => item.id === id) ?? null
}

/**
 * Iterate over all manifests with a callback
 */
export function forEachManifest(callback: (entry: ManifestEntry) => void): void {
  for (const entry of getAllManifests()) {
    callback(entry)
  }
}

/**
 * Map over all manifests
 */
export function mapManifests<T>(callback: (entry: ManifestEntry) => T): T[] {
  return getAllManifests().map(callback)
}

/**
 * Filter manifests by predicate
 */
export function filterManifests(predicate: (entry: ManifestEntry) => boolean): ManifestEntry[] {
  return getAllManifests().filter(predicate)
}

/**
 * Reduce over all manifests
 */
export function reduceManifests<T>(
  callback: (acc: T, entry: ManifestEntry) => T,
  initialValue: T
): T {
  return getAllManifests().reduce(callback, initialValue)
}
