import type { ManifestVendor } from '@/types/manifests'
import vendorCompanyStagesData from '../../data/vendor-company-stages.json'

export type VendorCompanyStage = 'public-company' | 'super-unicorn' | 'unicorn' | 'startup'

type VendorCompanyStageTranslationKey = 'publicCompany' | 'superUnicorn' | 'unicorn' | 'startup'

type VendorCompanyStageConfig = {
  groups: Array<{
    id: VendorCompanyStage
    translationKey: VendorCompanyStageTranslationKey
  }>
  assignments: Array<{
    vendorId: string
    stage: VendorCompanyStage
  }>
}

export type VendorCompanyStageGroup<T extends ManifestVendor = ManifestVendor> = {
  id: VendorCompanyStage
  translationKey: VendorCompanyStageTranslationKey
  vendors: T[]
}

const vendorCompanyStageConfig = vendorCompanyStagesData as VendorCompanyStageConfig
const vendorCompanyStageById = new Map(
  vendorCompanyStageConfig.assignments.map(assignment => [assignment.vendorId, assignment.stage])
)

export function groupVendorsByCompanyStage<T extends ManifestVendor>(
  vendors: readonly T[],
  locale: string
): VendorCompanyStageGroup<T>[] {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  const vendorsByStage = new Map<VendorCompanyStage, T[]>(
    vendorCompanyStageConfig.groups.map(group => [group.id, []])
  )

  for (const vendor of vendors) {
    const stage = vendorCompanyStageById.get(vendor.id)
    if (!stage) {
      throw new Error(`Missing company-stage assignment for vendor: ${vendor.id}`)
    }
    vendorsByStage.get(stage)?.push(vendor)
  }

  return vendorCompanyStageConfig.groups.map(group => ({
    ...group,
    vendors: [...(vendorsByStage.get(group.id) ?? [])].sort(
      (a, b) => collator.compare(a.name, b.name) || collator.compare(a.id, b.id)
    ),
  }))
}
