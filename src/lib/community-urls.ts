import type { ManifestCommunityUrls, ManifestVendor } from '@/types/manifests'
import { findVendorByName } from './vendor-identity'

export const COMMUNITY_URL_KEYS = [
  'linkedin',
  'twitter',
  'github',
  'youtube',
  'discord',
  'reddit',
  'blog',
] as const satisfies readonly (keyof ManifestCommunityUrls)[]

type CommunityUrlOwner = {
  vendor: string
  communityUrls: ManifestCommunityUrls
}

export function mergeCommunityUrls(
  organizationUrls: ManifestCommunityUrls,
  productUrls: ManifestCommunityUrls
): ManifestCommunityUrls {
  return Object.fromEntries(
    COMMUNITY_URL_KEYS.map(key => [key, productUrls[key] ?? organizationUrls[key]])
  ) as unknown as ManifestCommunityUrls
}

export function withVendorCommunityUrls<T extends CommunityUrlOwner>(
  product: T,
  vendors: ManifestVendor[]
): T {
  const vendor = findVendorByName(vendors, product.vendor)
  if (!vendor) return product

  return {
    ...product,
    communityUrls: mergeCommunityUrls(vendor.communityUrls, product.communityUrls),
  }
}

export function withVendorCommunityUrlsForCatalog<T extends CommunityUrlOwner>(
  products: T[],
  vendors: ManifestVendor[]
): T[] {
  return products.map(product => withVendorCommunityUrls(product, vendors))
}
