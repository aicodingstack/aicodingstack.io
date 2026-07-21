import { describe, expect, it } from 'vitest'
import {
  compareVendorMatrixRowsByProducts,
  LANDSCAPE_PRODUCT_CATEGORIES,
  type LandscapeProduct,
  type ProductCategory,
  type VendorMatrixRow,
} from '@/lib/landscape-data'

function createRow(name: string, categories: ProductCategory[]): VendorMatrixRow {
  const cells: VendorMatrixRow['cells'] = {
    ide: [],
    extension: [],
    cli: [],
    desktop: [],
    model: [],
    provider: [],
  }

  for (const category of categories) {
    const product: LandscapeProduct = {
      id: `${name}-${category}`,
      name: `${name} ${category}`,
      vendor: name,
      category,
      description: '',
      path: '/',
    }
    cells[category].push(product)
  }

  return {
    vendorId: name.toLowerCase(),
    vendorName: name,
    vendorType: 'full-stack',
    cells,
  }
}

describe('landscape matrix ordering', () => {
  it('uses the intended product column order', () => {
    expect(LANDSCAPE_PRODUCT_CATEGORIES).toEqual([
      'ide',
      'extension',
      'cli',
      'desktop',
      'model',
      'provider',
    ])
  })

  it('places vendors with models before broader vendors without models', () => {
    const modelVendor = createRow('Model vendor', ['model'])
    const toolVendor = createRow('Tool vendor', ['ide', 'extension', 'cli', 'desktop'])

    expect([toolVendor, modelVendor].sort(compareVendorMatrixRowsByProducts)).toEqual([
      modelVendor,
      toolVendor,
    ])
  })

  it('places model-less providers after tool vendors regardless of coverage', () => {
    const toolVendor = createRow('Tool vendor', ['ide'])
    const providerVendor = createRow('Provider vendor', [
      'ide',
      'extension',
      'cli',
      'desktop',
      'provider',
    ])

    expect([providerVendor, toolVendor].sort(compareVendorMatrixRowsByProducts)).toEqual([
      toolVendor,
      providerVendor,
    ])
  })

  it('sorts equal model groups by category coverage', () => {
    const narrow = createRow('Narrow', ['model'])
    const broadZulu = createRow('Zulu', ['model', 'provider', 'cli'])
    const broadAlpha = createRow('Alpha', ['model', 'provider', 'ide'])

    expect([narrow, broadZulu, broadAlpha].sort(compareVendorMatrixRowsByProducts)).toEqual([
      broadAlpha,
      broadZulu,
      narrow,
    ])
  })

  it('uses visible column order to break category coverage ties', () => {
    const ideVendor = createRow('Zulu IDE', ['ide'])
    const extensionVendor = createRow('Alpha Extension', ['extension'])
    const cliVendor = createRow('Bravo CLI', ['cli'])
    const desktopVendor = createRow('Charlie Desktop', ['desktop'])

    expect(
      [desktopVendor, cliVendor, extensionVendor, ideVendor].sort(compareVendorMatrixRowsByProducts)
    ).toEqual([ideVendor, extensionVendor, cliVendor, desktopVendor])
  })

  it('uses vendor name after priority, coverage, and column presence are equal', () => {
    const zulu = createRow('Zulu', ['model', 'ide'])
    const alpha = createRow('Alpha', ['model', 'ide'])

    expect([zulu, alpha].sort(compareVendorMatrixRowsByProducts)).toEqual([alpha, zulu])
  })
})
