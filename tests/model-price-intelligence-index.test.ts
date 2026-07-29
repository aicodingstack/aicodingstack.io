import { describe, expect, it } from 'vitest'
import {
  modelPriceIntelligenceMeta,
  modelPriceIntelligencePoints,
} from '@/lib/model-price-intelligence-index'

describe('model price-intelligence index', () => {
  it('contains a curated set of comparable mainstream models', () => {
    expect(modelPriceIntelligencePoints.length).toBeGreaterThanOrEqual(18)
    expect(
      new Set(modelPriceIntelligencePoints.map(point => point.vendor)).size
    ).toBeGreaterThanOrEqual(8)
    expect(new Set(modelPriceIntelligencePoints.map(point => point.modelId)).size).toBe(
      modelPriceIntelligencePoints.length
    )
    expect(modelPriceIntelligencePoints.map(point => point.modelId)).toEqual(
      expect.arrayContaining([
        'gemini-3-5-flash-lite',
        'qwen3-7-plus',
        'qwen3-7-max',
        'gpt-5-6-terra',
        'claude-haiku-4-5',
        'claude-opus-5',
        'claude-fable-5',
        'hy3',
      ])
    )
    expect(modelPriceIntelligencePoints.map(point => point.modelId)).not.toEqual(
      expect.arrayContaining(['claude-opus-4-8', 'muse-spark-1-1', 'mistral-medium-3-5'])
    )
  })

  it('uses positive USD token prices and a 9:1 blended price', () => {
    for (const point of modelPriceIntelligencePoints) {
      expect(point.currency).toBe('USD')
      expect(point.inputPrice).toBeGreaterThan(0)
      expect(point.outputPrice).toBeGreaterThan(0)
      expect(point.blendedPrice).toBeCloseTo(point.inputPrice * 0.9 + point.outputPrice * 0.1)
      expect(point.score).toBeGreaterThan(0)
    }
  })

  it('uses reviewed USD API prices when the catalog offer is not directly comparable', () => {
    const fallbackPoints = modelPriceIntelligencePoints.filter(
      point => point.pricingSource === 'reference'
    )

    expect(fallbackPoints.map(point => point.modelId)).toEqual([
      'hy3',
      'qwen3-7-plus',
      'qwen3-7-max',
    ])
    expect(
      fallbackPoints.map(point => ({
        modelId: point.modelId,
        sourceUrl: point.pricingSourceUrl,
      }))
    ).toEqual([
      {
        modelId: 'hy3',
        sourceUrl: 'https://artificialanalysis.ai/models/hy3',
      },
      {
        modelId: 'qwen3-7-plus',
        sourceUrl: 'https://artificialanalysis.ai/models/qwen3-7-plus',
      },
      {
        modelId: 'qwen3-7-max',
        sourceUrl: 'https://artificialanalysis.ai/models/qwen3-7-max',
      },
    ])
    expect(modelPriceIntelligenceMeta.fallbackPricingSources).toEqual(
      fallbackPoints.map(point => ({
        modelId: point.modelId,
        name: point.name,
        sourceUrl: point.pricingSourceUrl,
      }))
    )

    const hy3 = modelPriceIntelligencePoints.find(point => point.modelId === 'hy3')
    expect(hy3).toMatchObject({ inputPrice: 0.14, outputPrice: 0.58, score: 41 })
    expect(hy3?.blendedPrice).toBeCloseTo(0.184)
  })

  it('derives chart bounds from the selected models', () => {
    expect(modelPriceIntelligenceMeta.minPrice).toBe(
      Math.min(...modelPriceIntelligencePoints.map(point => point.blendedPrice))
    )
    expect(modelPriceIntelligenceMeta.maxPrice).toBe(
      Math.max(...modelPriceIntelligencePoints.map(point => point.blendedPrice))
    )
    expect(modelPriceIntelligenceMeta.maxScore).toBe(
      Math.max(...modelPriceIntelligencePoints.map(point => point.score))
    )
  })
})
