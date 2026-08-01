import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import vendorCompanyStagesSchema from '../data/$schemas/vendor-company-stages.schema.json'
import vendorCompanyStagesData from '../data/vendor-company-stages.json'
import { vendorsData } from '../src/lib/generated'
import { groupVendorsByCompanyStage } from '../src/lib/vendor-list'

describe('vendor company-stage groups', () => {
  it('conforms to its JSON schema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)
    const validate = ajv.compile(vendorCompanyStagesSchema)

    expect(validate(vendorCompanyStagesData), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('assigns every vendor exactly once', () => {
    const catalogIds = vendorsData.map(vendor => vendor.id).sort()
    const assignedIds = vendorCompanyStagesData.assignments
      .map(assignment => assignment.vendorId)
      .sort()

    expect(new Set(assignedIds).size).toBe(assignedIds.length)
    expect(assignedIds).toEqual(catalogIds)
  })

  it('keeps sourced evidence for every non-default assignment', () => {
    for (const assignment of vendorCompanyStagesData.assignments) {
      if (assignment.stage !== 'startup') {
        expect(assignment.source, assignment.vendorId).not.toBeNull()
      }
    }
  })

  it('uses each company stage exactly once and in the configured order', () => {
    expect(vendorCompanyStagesData.groups.map(group => group.id)).toEqual([
      'public-company',
      'super-unicorn',
      'unicorn',
      'startup',
    ])
    expect(new Set(vendorCompanyStagesData.groups.map(group => group.id)).size).toBe(4)
  })

  it('sorts localized vendor names alphabetically within every group', () => {
    const groups = groupVendorsByCompanyStage(vendorsData, 'en')
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

    for (const group of groups) {
      expect(group.vendors.map(vendor => vendor.name)).toEqual(
        [...group.vendors]
          .sort((a, b) => collator.compare(a.name, b.name) || collator.compare(a.id, b.id))
          .map(vendor => vendor.name)
      )
    }
  })
})
