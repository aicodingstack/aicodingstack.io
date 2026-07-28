import { cache } from 'react'
import type { Locale } from '@/i18n/config'
import { withVendorCommunityUrls } from '@/lib/community-urls'
import {
  clisData,
  desktopsData,
  extensionsData,
  idesData,
  modelsData,
  providersData,
  vendorsData,
} from '@/lib/generated'
import { getArticleBySlug } from '@/lib/generated/articles'
import { getDocBySlug } from '@/lib/generated/docs'
import { localizeManifestItem } from '@/lib/manifest-i18n'
import type {
  ManifestCLI,
  ManifestDesktop,
  ManifestExtension,
  ManifestIDE,
  ManifestModel,
  ManifestProvider,
  ManifestRelatedProduct,
  ManifestVendor,
} from '@/types/manifests'

/**
 * Cached fetcher for IDE data
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getIDE = cache(async (slug: string, locale: Locale) => {
  const ideRaw = idesData.find(i => i.id === slug)
  if (!ideRaw) return null

  const ide = localizeManifestItem(
    ideRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestIDE
  return withVendorCommunityUrls(ide, vendorsData as unknown as ManifestVendor[])
})

/**
 * Cached fetcher for CLI data
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getCLI = cache(async (slug: string, locale: Locale) => {
  const cliRaw = clisData.find(c => c.id === slug)
  if (!cliRaw) return null

  const cli = localizeManifestItem(
    cliRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestCLI
  return withVendorCommunityUrls(cli, vendorsData as unknown as ManifestVendor[])
})

/** Cached fetcher for standalone desktop coding-agent data. */
export const getDesktop = cache(async (slug: string, locale: Locale) => {
  const desktopRaw = desktopsData.find(desktop => desktop.id === slug)
  if (!desktopRaw) return null

  const desktop = localizeManifestItem(
    desktopRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestDesktop
  return withVendorCommunityUrls(desktop, vendorsData as unknown as ManifestVendor[])
})

/**
 * Cached fetcher for Model data
 * Models don't require localization, so no locale parameter needed
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getModel = cache(async (slug: string) => {
  return (modelsData.find(m => m.id === slug) as unknown as ManifestModel) || null
})

/**
 * Cached fetcher for Extension data
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getExtension = cache(async (slug: string, locale: Locale) => {
  const extensionRaw = extensionsData.find(e => e.id === slug)
  if (!extensionRaw) return null

  const extension = localizeManifestItem(
    extensionRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestExtension
  return withVendorCommunityUrls(extension, vendorsData as unknown as ManifestVendor[])
})

/**
 * Cached fetcher for Vendor data
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getVendor = cache(async (slug: string, locale: Locale) => {
  const vendorRaw = vendorsData.find(v => v.id === slug)
  if (!vendorRaw) return null

  return localizeManifestItem(
    vendorRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestVendor
})

/**
 * Cached fetcher for Model Provider data
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getModelProvider = cache(async (slug: string, locale: Locale) => {
  const providerRaw = providersData.find(p => p.id === slug)
  if (!providerRaw) return null

  const provider = localizeManifestItem(
    providerRaw as unknown as Record<string, unknown>,
    locale
  ) as unknown as ManifestProvider
  return withVendorCommunityUrls(provider, vendorsData as unknown as ManifestVendor[])
})

/**
 * Cached fetcher for related products
 * Fetches multiple related products from the relatedProducts array
 * Uses React cache() to prevent duplicate fetching
 */
export const getRelatedProducts = cache(
  async (
    relatedProducts: ManifestRelatedProduct[],
    locale: Locale
  ): Promise<
    Array<{
      type: 'ide' | 'cli' | 'extension' | 'desktop'
      data: ManifestIDE | ManifestCLI | ManifestExtension | ManifestDesktop | null
    }>
  > => {
    if (!relatedProducts || relatedProducts.length === 0) {
      return []
    }

    return Promise.all(
      relatedProducts.map(async rel => {
        try {
          let data = null
          if (rel.type === 'ide') data = await getIDE(rel.productId, locale)
          else if (rel.type === 'cli') data = await getCLI(rel.productId, locale)
          else if (rel.type === 'extension') data = await getExtension(rel.productId, locale)
          else if (rel.type === 'desktop') data = await getDesktop(rel.productId, locale)

          return { type: rel.type, data }
        } catch {
          return { type: rel.type, data: null }
        }
      })
    )
  }
)

/**
 * Cached fetcher for Article data
 * Articles are already locale-aware through getArticleBySlug
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getArticle = cache(async (slug: string, locale: string) => {
  return getArticleBySlug(slug, locale)
})

/**
 * Cached fetcher for Documentation data
 * Docs are already locale-aware through getDocBySlug
 * Uses React cache() to prevent duplicate fetching in generateMetadata and page component
 */
export const getDoc = cache(async (slug: string, locale: string) => {
  return getDocBySlug(slug, locale)
})
