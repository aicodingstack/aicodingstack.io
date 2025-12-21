import { VendorModels } from '@/components/vendor/VendorModels'
import type { ManifestModel } from '@/types/manifests'

export interface EntityModelsGridProps {
  models: ManifestModel[]
  locale: string
  title: string
}

/**
 * EntityModelsGrid Section
 *
 * Displays a grid of AI models for a vendor or provider.
 * Wraps VendorModels for consistent naming in the sections architecture.
 * Used by vendor and model-provider detail pages.
 */
export function EntityModelsGrid({ models, locale, title }: EntityModelsGridProps) {
  return <VendorModels models={models} locale={locale} title={title} />
}
