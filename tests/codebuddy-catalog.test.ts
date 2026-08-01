import { describe, expect, it } from 'vitest'
import { clisData, desktopsData, idesData } from '@/lib/generated'

describe('CodeBuddy catalog placement', () => {
  it('lists CodeBuddy once as a desktop without a vendor prefix', () => {
    const desktop = desktopsData.find(product => product.id === 'codebuddy')

    expect(desktop?.name).toBe('CodeBuddy')
    expect(desktopsData.some(product => product.id === 'workbuddy')).toBe(false)
    expect(idesData.some(product => product.id === 'codebuddy')).toBe(false)
  })

  it('links the CodeBuddy desktop and CLI as one product family', () => {
    const desktop = desktopsData.find(product => product.id === 'codebuddy')
    const cli = clisData.find(product => product.id === 'codebuddy-cli')

    expect(desktop?.familyId).toBe('codebuddy')
    expect(cli?.familyId).toBe('codebuddy')
    expect(desktop?.relatedProducts).toContainEqual({
      type: 'cli',
      productId: 'codebuddy-cli',
    })
    expect(cli?.relatedProducts).toContainEqual({
      type: 'desktop',
      productId: 'codebuddy',
    })
  })
})
