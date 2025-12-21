import { VendorProducts } from '@/components/vendor/VendorProducts'
import type { ManifestCLI, ManifestExtension, ManifestIDE } from '@/types/manifests'

export type ProductWithType = (ManifestIDE | ManifestCLI | ManifestExtension) & {
  type: 'ide' | 'cli' | 'extension'
}

export interface EntityProductsGridProps {
  products: ProductWithType[]
  locale: string
  title: string
}

/**
 * EntityProductsGrid Section
 *
 * Displays a grid of IDE, CLI, and Extension products for a vendor.
 * Wraps VendorProducts for consistent naming in the sections architecture.
 * Used by vendor detail pages.
 */
export function EntityProductsGrid({ products, locale, title }: EntityProductsGridProps) {
  return <VendorProducts products={products} locale={locale} title={title} />
}
