import type { ReactNode } from 'react'
import { ProductHero } from '@/components/product'
import type { ProductHeroProps } from '@/components/product/ProductHero'
import type { ManifestVendorEntity } from '@/types/manifests'
import { EntityDetailTemplate, type EntityDetailTemplateProps } from './EntityDetailTemplate'

export interface VendorEntityDetailTemplateProps<T extends ManifestVendorEntity>
  extends Omit<EntityDetailTemplateProps<T>, 'children'> {
  // ProductHero configuration
  productHero?: Omit<
    ProductHeroProps,
    'name' | 'description' | 'vendor' | 'verified' | 'category'
  > & {
    categoryLabel: string
    category: 'CLI' | 'IDE' | 'MCP' | 'PROVIDER' | 'MODEL' | 'VENDOR'
  }

  // Additional child sections (after ProductHero)
  children?: ReactNode
}

/**
 * VendorEntityDetailTemplate - Extends EntityDetailTemplate
 *
 * Mirrors: ManifestVendorEntity (extends ManifestEntity)
 *
 * Adds ProductHero section for entities that have vendor information:
 * - IDEs, CLIs (which extend ManifestVendorEntity)
 * - Extensions (which have vendor property)
 *
 * This template is used by ProductDetailTemplate and can be used directly
 * for pages that need ProductHero but not the full product sections.
 *
 * @example Usage for IDE/CLI pages
 * ```tsx
 * <VendorEntityDetailTemplate
 *   entity={ide}
 *   locale={locale}
 *   schema={schema}
 *   breadcrumbs={breadcrumbs}
 *   backToHref="/ides"
 *   backToTitle="All IDEs"
 *   productHero={{
 *     categoryLabel: "IDE",
 *     category: "IDE",
 *     latestVersion: ide.latestVersion,
 *     license: ide.license,
 *     ...
 *   }}
 * >
 *   <ProductPricing ... />
 *   <ProductLinks ... />
 * </VendorEntityDetailTemplate>
 * ```
 */
export function VendorEntityDetailTemplate<T extends ManifestVendorEntity>({
  entity,
  productHero,
  children,
  ...baseProps
}: VendorEntityDetailTemplateProps<T>) {
  // Build ProductHero props from entity and configuration
  const heroProps: ProductHeroProps = {
    name: entity.name,
    description: entity.description,
    vendor: 'vendor' in entity ? entity.vendor : undefined,
    verified: entity.verified ?? false,
    ...(productHero || {
      category: 'IDE' as const,
      categoryLabel: 'Product',
    }),
  }

  return (
    <EntityDetailTemplate entity={entity} {...baseProps}>
      {/* ProductHero section */}
      <ProductHero {...heroProps} {...(productHero || {})} />

      {/* Additional sections */}
      {children}
    </EntityDetailTemplate>
  )
}
