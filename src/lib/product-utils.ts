/**
 * Product Utility Functions
 * Provides data transformation utilities for product pages
 */

import type {
  ManifestCLI,
  ManifestCommunityUrls,
  ManifestExtension,
  ManifestIDE,
  ManifestResourceUrls,
} from '@/types/manifests'

/**
 * Component-compatible resource URLs (all optional, null values filtered out)
 * Used for passing to React components that expect optional string props
 */
export interface ComponentResourceUrls {
  download?: string
  changelog?: string
  pricing?: string
  mcp?: string
  issue?: string
}

/**
 * Component-compatible community URLs (all optional, null values filtered out)
 * Used for passing to React components that expect optional string props
 */
export interface ComponentCommunityUrls {
  linkedin?: string
  twitter?: string
  github?: string
  youtube?: string
  discord?: string
  reddit?: string
  blog?: string
}

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

  const result: ComponentResourceUrls = {}
  if (resourceUrls.download) result.download = resourceUrls.download
  if (resourceUrls.changelog) result.changelog = resourceUrls.changelog
  if (resourceUrls.pricing) result.pricing = resourceUrls.pricing
  if (resourceUrls.mcp) result.mcp = resourceUrls.mcp
  if (resourceUrls.issue) result.issue = resourceUrls.issue
  return result
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

  const result: ComponentCommunityUrls = {}
  if (communityUrls.linkedin) result.linkedin = communityUrls.linkedin
  if (communityUrls.twitter) result.twitter = communityUrls.twitter
  if (communityUrls.github) result.github = communityUrls.github
  if (communityUrls.youtube) result.youtube = communityUrls.youtube
  if (communityUrls.discord) result.discord = communityUrls.discord
  if (communityUrls.reddit) result.reddit = communityUrls.reddit
  if (communityUrls.blog) result.blog = communityUrls.blog
  return result
}
