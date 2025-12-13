/**
 * Product Utility Functions
 * Provides data transformation utilities for product pages
 */

import type {
  ComponentCommunityUrls,
  ComponentResourceUrls,
  ManifestCLI,
  ManifestCommunityUrls,
  ManifestExtension,
  ManifestIDE,
  ManifestResourceUrls,
} from '@/types/manifests'

/**
 * Platform information type
 */
export type PlatformInfo =
  | {
      type: 'platforms'
      values: string[]
    }
  | {
      type: 'supportedIdes'
      values: string[]
    }
  | null

/**
 * Get normalized platform information from a product
 * Handles both platforms (for IDE/CLI) and supportedIdes (for Extension)
 */
export function getPlatformInfo(
  product: ManifestIDE | ManifestCLI | ManifestExtension
): PlatformInfo {
  // Check for platforms field (IDE/CLI)
  if ('platforms' in product && product.platforms && product.platforms.length > 0) {
    return {
      type: 'platforms',
      values: product.platforms.map(p => p.os),
    }
  }

  // Check for supportedIdes field (Extension)
  if ('supportedIdes' in product && product.supportedIdes && product.supportedIdes.length > 0) {
    return {
      type: 'supportedIdes',
      values: product.supportedIdes.map(ide => ide.ideId),
    }
  }

  return null
}

/**
 * Transform resource URLs from manifest format to component format
 * Converts null to undefined for optional component props
 */
export function transformResourceUrls(
  resourceUrls?: ManifestResourceUrls | null
): ComponentResourceUrls {
  if (!resourceUrls) {
    return {}
  }

  return {
    download: resourceUrls.download || undefined,
    changelog: resourceUrls.changelog || undefined,
    pricing: resourceUrls.pricing || undefined,
    mcp: resourceUrls.mcp || undefined,
    issue: resourceUrls.issue || undefined,
  }
}

/**
 * Transform community URLs from manifest format to component format
 * Converts null to undefined for optional component props
 */
export function transformCommunityUrls(
  communityUrls?: ManifestCommunityUrls | null
): ComponentCommunityUrls {
  if (!communityUrls) {
    return {}
  }

  return {
    linkedin: communityUrls.linkedin || undefined,
    twitter: communityUrls.twitter || undefined,
    github: communityUrls.github || undefined,
    youtube: communityUrls.youtube || undefined,
    discord: communityUrls.discord || undefined,
    reddit: communityUrls.reddit || undefined,
  }
}
