import { describe, expect, it } from 'vitest'
import {
  clisData,
  extensionsData,
  idesData,
  modelsData,
  providersData,
  vendorsData,
} from '@/lib/generated'
import {
  findVendorByName,
  getVendorNames,
  normalizeVendorName,
  vendorMatches,
} from '@/lib/vendor-identity'

const vendorReferences = [
  ...idesData,
  ...clisData,
  ...extensionsData,
  ...modelsData,
  ...providersData,
]

describe('vendor identity aliases', () => {
  it('resolves alternative names to one canonical vendor', () => {
    const cline = findVendorByName(vendorsData, 'Cline Bot')
    const continueVendor = findVendorByName(vendorsData, 'Continue Dev')
    const moonshot = findVendorByName(vendorsData, 'Moonshot')

    expect(cline?.id).toBe('cline')
    expect(continueVendor?.id).toBe('continue')
    expect(moonshot?.id).toBe('moonshot')
    expect(moonshot && vendorMatches(moonshot, 'moonshot ai')).toBe(true)
  })

  it('does not allow canonical names or aliases to be claimed by multiple vendors', () => {
    const identityOwners = new Map<string, string>()

    for (const vendor of vendorsData) {
      for (const name of getVendorNames(vendor)) {
        const identity = normalizeVendorName(name)
        const existingOwner = identityOwners.get(identity)
        expect(
          existingOwner,
          `Vendor identity "${name}" is already owned by ${existingOwner}`
        ).toBe(undefined)
        identityOwners.set(identity, vendor.id)
      }
    }
  })

  it('resolves every manifest vendor reference', () => {
    for (const manifest of vendorReferences) {
      expect(
        findVendorByName(vendorsData, manifest.vendor),
        `${manifest.id} references unknown vendor "${manifest.vendor}"`
      ).toBeDefined()
    }
  })
})
