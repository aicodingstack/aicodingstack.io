import type { ManifestVendor } from '@/types/manifests'

export function normalizeVendorName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function getVendorNames(vendor: Pick<ManifestVendor, 'name' | 'aliases'>): string[] {
  return [vendor.name, ...(vendor.aliases ?? [])]
}

export function vendorMatches(
  vendor: Pick<ManifestVendor, 'name' | 'aliases'>,
  candidate: string
): boolean {
  const normalizedCandidate = normalizeVendorName(candidate)
  return getVendorNames(vendor).some(name => normalizeVendorName(name) === normalizedCandidate)
}

export function findVendorByName(
  vendors: ManifestVendor[],
  candidate: string
): ManifestVendor | undefined {
  return vendors.find(vendor => vendorMatches(vendor, candidate))
}
