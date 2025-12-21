// ============================================================================
// Entity Templates (mirrors schema type hierarchy)
// ============================================================================

export type {
  BreadcrumbConfig,
  EntityDetailTemplateProps,
} from './entity/EntityDetailTemplate'
export { EntityDetailTemplate } from './entity/EntityDetailTemplate'
export type { ModelDetailTemplateProps } from './entity/ModelDetailTemplate'
export { ModelDetailTemplate } from './entity/ModelDetailTemplate'
export type {
  OrganizationDetailTemplateProps,
  OrganizationEntity,
} from './entity/OrganizationDetailTemplate'
export { OrganizationDetailTemplate } from './entity/OrganizationDetailTemplate'
export type { VendorEntityDetailTemplateProps } from './entity/VendorEntityDetailTemplate'
export { VendorEntityDetailTemplate } from './entity/VendorEntityDetailTemplate'

// ============================================================================
// Re-export ProductDetailTemplate for backwards compatibility
// ============================================================================

export type { ProductDetailTemplateProps } from './ProductDetailTemplate'
export { ProductDetailTemplate } from './ProductDetailTemplate'

// ============================================================================
// Section Components (reusable for template composition)
// ============================================================================

export type { EntityBenchmarksProps } from './sections/EntityBenchmarks'
export { EntityBenchmarks } from './sections/EntityBenchmarks'
export type { EntityCommunityLinksProps } from './sections/EntityCommunityLinks'
export { EntityCommunityLinks } from './sections/EntityCommunityLinks'
export type { EntityModelsGridProps } from './sections/EntityModelsGrid'
export { EntityModelsGrid } from './sections/EntityModelsGrid'

export type {
  EntityPlatformLinksProps,
  PlatformUrls,
} from './sections/EntityPlatformLinks'
export { EntityPlatformLinks } from './sections/EntityPlatformLinks'

export type {
  EntityProductsGridProps,
  ProductWithType,
} from './sections/EntityProductsGrid'
export { EntityProductsGrid } from './sections/EntityProductsGrid'
export type { EntitySpecificationsProps } from './sections/EntitySpecifications'
export { EntitySpecifications } from './sections/EntitySpecifications'
