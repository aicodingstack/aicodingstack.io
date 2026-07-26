import { describe, expect, it } from 'vitest'
import { modelsData } from '@/lib/generated/models'
import { vendorsData } from '@/lib/generated/vendors'
import {
  allModelIntelligencePoints,
  createTimelineTicks,
  modelIntelligenceHiddenVendors,
  modelIntelligenceLegacyMissingModelIds,
  modelIntelligenceMeta,
  modelIntelligencePoints,
  modelIntelligenceSeries,
} from '@/lib/model-intelligence-index'
import { findVendorByName } from '@/lib/vendor-identity'
import artificialAnalysisData from '../data/artificial-analysis-index.json'

const LEGACY_MISSING_MODEL_ID_BASELINE = new Set([
  'composer',
  'cursor-composer-2',
  'cursor-composer-2-5',
])

function getRelativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map(channel => Number.parseInt(channel, 16) / 255)
    .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

function getContrastRatio(first: string, second: string): number {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)

  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  )
}

describe('model intelligence index', () => {
  it('creates stable unique timeline ticks for the chart axis', () => {
    const domain: [number, number] = [Date.UTC(2024, 0, 1), Date.UTC(2026, 0, 1)]
    const ticks = createTimelineTicks(domain)

    expect(ticks).toHaveLength(7)
    expect(new Set(ticks).size).toBe(ticks.length)
    expect(ticks[0]).toBe(domain[0])
    expect(ticks.at(-1)).toBe(domain[1])
  })

  it('maps every score to one dated catalog model', () => {
    expect(allModelIntelligencePoints).toHaveLength(artificialAnalysisData.entries.length)
    expect(new Set(allModelIntelligencePoints.map(point => point.modelId)).size).toBe(
      allModelIntelligencePoints.length
    )

    for (const point of allModelIntelligencePoints) {
      expect(point.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isFinite(point.timestamp)).toBe(true)
      expect(point.score).toBeGreaterThanOrEqual(0)
      expect(point.score).toBeLessThanOrEqual(100)
      expect(point.series.length).toBeGreaterThan(0)
    }
  })

  it('requires every new catalog model to have an Intelligence Index entry', () => {
    const indexedModelIds = new Set(allModelIntelligencePoints.map(point => point.modelId))
    const missingModelIds = modelsData
      .filter(model => !indexedModelIds.has(model.id))
      .map(model => model.id)
      .sort()
    const legacyMissingModelIds = [...modelIntelligenceLegacyMissingModelIds].sort()
    const unexpectedLegacyMissingModelIds = legacyMissingModelIds.filter(
      modelId => !LEGACY_MISSING_MODEL_ID_BASELINE.has(modelId)
    )

    expect(new Set(legacyMissingModelIds).size).toBe(legacyMissingModelIds.length)
    expect(unexpectedLegacyMissingModelIds).toEqual([])
    expect(missingModelIds).toEqual(legacyMissingModelIds)
  })

  it('keeps hidden vendors in source data but excludes them from the page', () => {
    for (const vendor of modelIntelligenceHiddenVendors) {
      expect(allModelIntelligencePoints.some(point => point.vendor === vendor)).toBe(true)
      expect(modelIntelligencePoints.some(point => point.vendor === vendor)).toBe(false)
      expect(modelIntelligenceSeries.some(series => series.vendor === vendor)).toBe(false)
    }
  })

  it('keeps a single vendor color while separating model series', () => {
    const vendorColors = new Map<string, Set<string>>()
    const vendorStyles = new Map<string, Set<string>>()
    const vendors = new Set(allModelIntelligencePoints.map(point => point.vendor))

    for (const series of modelIntelligenceSeries) {
      const colors = vendorColors.get(series.vendor) ?? new Set<string>()
      colors.add(`${series.color.light}:${series.color.dark}`)
      vendorColors.set(series.vendor, colors)

      const styles = vendorStyles.get(series.vendor) ?? new Set<string>()
      styles.add(`${series.dash ?? 'solid'}:${series.marker}`)
      vendorStyles.set(series.vendor, styles)
    }

    for (const colors of vendorColors.values()) {
      expect(colors.size).toBe(1)
    }

    for (const [vendor, styles] of vendorStyles) {
      expect(styles.size).toBe(
        modelIntelligenceSeries.filter(series => series.vendor === vendor).length
      )

      const singletonSeries = modelIntelligenceSeries.filter(
        series => series.vendor === vendor && series.points.length === 1
      )
      expect(new Set(singletonSeries.map(series => series.marker)).size).toBe(
        singletonSeries.length
      )
    }

    expect(
      [...vendors].filter(vendor => !findVendorByName(vendorsData, vendor)?.themeColor)
    ).toEqual([])
    expect(modelIntelligenceSeries.filter(series => series.vendor === 'Anthropic').length).toBe(4)
    expect(
      modelIntelligenceSeries.filter(series => series.vendor === 'OpenAI').length
    ).toBeGreaterThan(3)
  })

  it('keeps vendor colors visible on their target theme', () => {
    const vendors = new Set(allModelIntelligencePoints.map(point => point.vendor))

    for (const vendor of vendors) {
      const themeColor = findVendorByName(vendorsData, vendor)?.themeColor

      expect(themeColor).toBeDefined()
      expect(getContrastRatio(themeColor!.light, '#FFFFFF')).toBeGreaterThanOrEqual(3)
      expect(getContrastRatio(themeColor!.dark, '#0A0A0A')).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps historical family releases as distinct points', () => {
    const haikuPoints = allModelIntelligencePoints
      .filter(point => point.series === 'Claude Haiku')
      .map(point => [point.modelId, point.score, point.estimated])

    expect(haikuPoints).toEqual([
      ['claude-haiku-3', 4, true],
      ['claude-haiku-3-5', 12, false],
      ['claude-haiku-4-5', 24, true],
    ])

    expect(
      allModelIntelligencePoints
        .filter(point => point.modelId.startsWith('deepseek-r1'))
        .map(point => [point.modelId, point.score])
    ).toEqual([
      ['deepseek-r1', 19],
      ['deepseek-r1-0528', 20],
    ])

    expect(
      allModelIntelligencePoints
        .filter(point => point.vendor === 'Z.ai')
        .map(point => [point.modelId, point.series, point.score])
    ).toEqual([
      ['glm-4-5', 'GLM', 19],
      ['glm-4-5-air', 'GLM Air', 17],
      ['glm-4-5v', 'GLM Vision', 7],
      ['glm-4-6', 'GLM', 23],
      ['glm-4-6v', 'GLM Vision', 11],
      ['glm-4-7', 'GLM', 34],
      ['glm-4-7-flash', 'GLM Flash', 23],
      ['glm-5', 'GLM', 40],
      ['glm-5-turbo', 'GLM Turbo', 38],
      ['glm-5v-turbo', 'GLM Vision', 34],
      ['glm-5-1', 'GLM', 40],
      ['glm-5-2', 'GLM', 51],
    ])
  })

  it('records the source and index version', () => {
    expect(modelIntelligenceMeta.sourceUrl).toBe(
      'https://artificialanalysis.ai/leaderboards/models'
    )
    expect(modelIntelligenceMeta.methodologyUrl).toBe(
      'https://artificialanalysis.ai/methodology/intelligence-benchmarking'
    )
    expect(modelIntelligenceMeta.indexVersion).toBe('4.1')
    expect(modelIntelligenceMeta.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
