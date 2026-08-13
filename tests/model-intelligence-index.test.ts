import { describe, expect, it } from 'vitest'
import { modelsData } from '@/lib/generated/models'
import { vendorsData } from '@/lib/generated/vendors'
import {
  allModelIntelligencePoints,
  createTimelineTicks,
  modelIntelligenceLegacyMissingModelIds,
  modelIntelligenceMeta,
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
      expect(point.seriesId).toMatch(/^[a-z0-9-]+$/)
      expect(point.seriesOrder).toBeGreaterThanOrEqual(0)
    }
  })

  it('loads model-series membership from schema-backed vendor manifests', () => {
    const modelsById = new Map(modelsData.map(model => [model.id, model]))
    const assignedModelIds = new Set<string>()

    for (const vendor of vendorsData) {
      const seriesIds = new Set<string>()

      for (const series of vendor.modelSeries ?? []) {
        expect(seriesIds.has(series.id)).toBe(false)
        seriesIds.add(series.id)

        for (const modelId of series.modelIds) {
          expect(assignedModelIds.has(modelId)).toBe(false)
          assignedModelIds.add(modelId)

          const model = modelsById.get(modelId)
          expect(model).toBeDefined()
          expect(findVendorByName(vendorsData, model!.vendor)?.id).toBe(vendor.id)
        }
      }
    }

    expect(
      allModelIntelligencePoints.filter(point => !assignedModelIds.has(point.modelId))
    ).toEqual([])
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

  it('assigns each vendor series the shared line-style priority', () => {
    const expectedDashPatterns = [null, '6 4', '2 4', '10 4 2 4']
    const seriesByVendor = new Map<string, typeof modelIntelligenceSeries>()

    for (const series of modelIntelligenceSeries) {
      const vendorSeries = seriesByVendor.get(series.vendor) ?? []
      vendorSeries.push(series)
      seriesByVendor.set(series.vendor, vendorSeries)
    }

    for (const vendorSeries of seriesByVendor.values()) {
      expect(vendorSeries[0]?.marker).toBe('circle')
      expect(vendorSeries[0]?.dash).toBeNull()

      vendorSeries.forEach((series, index) => {
        expect(series.dash).toBe(expectedDashPatterns[index % expectedDashPatterns.length])
      })
    }
  })

  it('orders Qwen product lines from flagship to open-weight models', () => {
    const qwenSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Alibaba')

    expect(qwenSeries.map(series => series.name)).toEqual([
      'Qwen Max',
      'Qwen Plus',
      'Qwen Coder',
      'Qwen Open',
    ])
    expect(qwenSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
      ['diamond', '10 4 2 4'],
    ])
    expect(
      allModelIntelligencePoints
        .filter(point => point.modelId === 'qwen3-6-27b' || point.modelId === 'qwen3-6-35b-a3b')
        .map(point => point.series)
    ).toEqual(['Qwen Open', 'Qwen Open'])
    expect(
      qwenSeries[0]?.points.map(point => [
        point.modelId,
        point.score,
        point.estimated,
        point.configuration,
      ])
    ).toEqual([
      ['qwen3-6-max-preview', 41, true, 'Qwen3.6 Max Preview'],
      ['qwen3-7-max', 47, false, 'Qwen3.7 Max'],
      ['qwen3-8-max', 58, false, 'Qwen3.8 Max'],
    ])
  })

  it('connects Grok 4.6 to the flagship Grok line', () => {
    const grokSeries = modelIntelligenceSeries.find(
      series => series.vendor === 'xAI' && series.name === 'Grok'
    )

    expect(grokSeries?.points.at(-1)).toMatchObject({
      modelId: 'grok-4-6',
      score: 61,
      estimated: false,
      configuration: 'Grok 4.6 (high)',
    })
  })

  it('orders Claude product lines from Opus through Fable', () => {
    const claudeSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Anthropic')

    expect(claudeSeries.map(series => series.name)).toEqual([
      'Claude Opus',
      'Claude Sonnet',
      'Claude Haiku',
      'Claude Fable',
    ])
    expect(claudeSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
      ['diamond', '10 4 2 4'],
    ])
  })

  it('names and orders the three connected GPT product lines', () => {
    const openAISeries = modelIntelligenceSeries.filter(series => series.vendor === 'OpenAI')

    expect(openAISeries.slice(0, 3).map(series => series.name)).toEqual([
      'GPT (Sol)',
      'GPT mini(Terra)',
      'GPT nano(Luna)',
    ])
    expect(openAISeries.slice(0, 3).map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
    ])
  })

  it('connects the DeepSeek main line through V4 while keeping Flash separate', () => {
    const deepSeekSeries = modelIntelligenceSeries.filter(series => series.vendor === 'DeepSeek')

    expect(deepSeekSeries.map(series => series.name)).toEqual(['DeepSeek', 'DeepSeek Flash'])
    expect(deepSeekSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
    ])
    expect(deepSeekSeries[0]?.points.map(point => point.modelId)).toEqual([
      'deepseek-v3',
      'deepseek-r1',
      'deepseek-r1-0528',
      'deepseek-v3-1',
      'deepseek-v3-terminus',
      'deepseek-v3-2-exp',
      'deepseek-3-2',
      'deepseek-v4-pro-preview',
      'deepseek-v4-pro',
    ])
    expect(deepSeekSeries[0]?.points.slice(-2).map(point => [point.modelId, point.score])).toEqual([
      ['deepseek-v4-pro-preview', 45],
      ['deepseek-v4-pro', 53],
    ])
    expect(
      deepSeekSeries[1]?.points.map(point => [
        point.modelId,
        point.score,
        point.estimated,
        point.configuration,
      ])
    ).toEqual([
      ['deepseek-v4-flash-preview', 42, false, 'DeepSeek V4 Flash (max)'],
      ['deepseek-v4-flash', 52, false, 'DeepSeek V4 Flash 0731 (max)'],
    ])
  })

  it('orders Google product lines from Gemini Pro through Gemma', () => {
    const geminiSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Google')

    expect(geminiSeries.map(series => series.name)).toEqual([
      'Gemini Pro',
      'Gemini Flash',
      'Gemini Flash-Lite',
      'Gemma',
    ])
    expect(geminiSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
      ['diamond', '10 4 2 4'],
    ])
  })

  it('keeps Xiaomi MiMo models as three independent series', () => {
    const mimoSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Xiaomi')

    expect(mimoSeries.map(series => series.name)).toEqual(['MiMo Pro', 'MiMo', 'MiMo Flash'])
    expect(mimoSeries.map(series => series.points.map(point => point.modelId))).toEqual([
      ['mimo-v2-5-pro'],
      ['mimo-v2-5'],
      ['mimo-v2-flash'],
    ])
    expect(mimoSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
    ])
  })

  it('keeps each Mistral model in its own series', () => {
    const mistralSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Mistral AI')

    expect(mistralSeries.map(series => series.name)).toEqual([
      'Devstral',
      'Devstral Small',
      'Mistral Medium',
      'Mistral Small',
    ])
    expect(mistralSeries.map(series => series.id)).toEqual([
      'Mistral AI:devstral-2',
      'Mistral AI:devstral-small-2',
      'Mistral AI:mistral-medium-3-5',
      'Mistral AI:mistral-small-4',
    ])
    expect(mistralSeries.map(series => series.points.map(point => point.modelId))).toEqual([
      ['devstral-2'],
      ['devstral-small-2'],
      ['mistral-medium-3-5'],
      ['mistral-small-4'],
    ])
    expect(mistralSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
      ['diamond', '10 4 2 4'],
    ])
  })

  it('uses Hunyuan as the Tencent model series name', () => {
    const tencentSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Tencent')

    expect(tencentSeries.map(series => series.name)).toEqual(['Hunyuan'])
    expect(tencentSeries[0]?.points.map(point => point.modelId)).toEqual(['hy3'])
  })

  it('connects GLM Air and Flash while keeping Vision on the dotted series', () => {
    const glmSeries = modelIntelligenceSeries.filter(series => series.vendor === 'Z.ai')

    expect(glmSeries.map(series => series.name)).toEqual([
      'GLM',
      'GLM Air / Flash',
      'GLM Vision',
      'GLM Turbo',
    ])
    expect(glmSeries.map(series => [series.marker, series.dash])).toEqual([
      ['circle', null],
      ['square', '6 4'],
      ['triangle', '2 4'],
      ['diamond', '10 4 2 4'],
    ])
    expect(glmSeries[1]?.points.map(point => point.modelId)).toEqual([
      'glm-4-5-air',
      'glm-4-7-flash',
    ])
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
    expect(
      allModelIntelligencePoints.find(point => point.modelId === 'gpt-5-1-codex-mini')?.series
    ).toBe('GPT mini(Terra)')
    expect(
      allModelIntelligencePoints
        .filter(point => point.modelId === 'o3-mini' || point.modelId === 'o4-mini')
        .map(point => [point.modelId, point.series])
    ).toEqual([
      ['o3-mini', 'o mini'],
      ['o4-mini', 'o mini'],
    ])
    expect(
      allModelIntelligencePoints
        .filter(point =>
          [
            'gpt-4-1',
            'gpt-4o',
            'gpt-5',
            'gpt-5-1',
            'gpt-5-2',
            'gpt-5-4',
            'gpt-5-5',
            'gpt-5-6-sol',
          ].includes(point.modelId)
        )
        .map(point => [point.modelId, point.series])
    ).toEqual([
      ['gpt-4-1', 'GPT (Sol)'],
      ['gpt-4o', 'GPT (Sol)'],
      ['gpt-5', 'GPT (Sol)'],
      ['gpt-5-1', 'GPT (Sol)'],
      ['gpt-5-2', 'GPT (Sol)'],
      ['gpt-5-4', 'GPT (Sol)'],
      ['gpt-5-5', 'GPT (Sol)'],
      ['gpt-5-6-sol', 'GPT (Sol)'],
    ])
    expect(
      allModelIntelligencePoints
        .filter(point =>
          [
            'gpt-4-1-mini',
            'gpt-4o-mini',
            'gpt-5-mini',
            'gpt-5-1-codex-mini',
            'gpt-5-4-mini',
            'gpt-5-6-terra',
          ].includes(point.modelId)
        )
        .map(point => point.series)
    ).toEqual([
      'GPT mini(Terra)',
      'GPT mini(Terra)',
      'GPT mini(Terra)',
      'GPT mini(Terra)',
      'GPT mini(Terra)',
      'GPT mini(Terra)',
    ])
    expect(
      allModelIntelligencePoints
        .filter(point =>
          ['gpt-4-1-nano', 'gpt-5-nano', 'gpt-5-4-nano', 'gpt-5-6-luna'].includes(point.modelId)
        )
        .map(point => point.series)
    ).toEqual(['GPT nano(Luna)', 'GPT nano(Luna)', 'GPT nano(Luna)', 'GPT nano(Luna)'])
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
      ['glm-4-5-air', 'GLM Air / Flash', 17],
      ['glm-4-5v', 'GLM Vision', 7],
      ['glm-4-6', 'GLM', 23],
      ['glm-4-6v', 'GLM Vision', 11],
      ['glm-4-7', 'GLM', 34],
      ['glm-4-7-flash', 'GLM Air / Flash', 23],
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
    expect(modelIntelligenceMeta.indexVersion).toBe('4.1.1')
    expect(modelIntelligenceMeta.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
