import { modelsData } from '@/lib/generated/models'
import { vendorsData } from '@/lib/generated/vendors'
import { findVendorByName } from '@/lib/vendor-identity'
import artificialAnalysisData from '../../data/artificial-analysis-index.json'

const FALLBACK_COLOR: ModelIntelligenceThemeColor = {
  light: '#6b7280',
  dark: '#9ca3af',
}

export const modelIntelligenceHiddenVendors = ['Mistral AI'] as const
export const modelIntelligenceLegacyMissingModelIds = artificialAnalysisData.legacyMissingModelIds

export interface ModelIntelligenceThemeColor {
  light: string
  dark: string
}

export type ModelIntelligenceMarker =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'cross'
  | 'star'
  | 'wye'

export interface ModelIntelligencePoint {
  modelId: string
  name: string
  vendor: string
  series: string
  score: number
  estimated: boolean
  configuration: string
  releaseDate: string
  timestamp: number
  color: ModelIntelligenceThemeColor
}

export interface ModelIntelligenceSeries {
  id: string
  vendor: string
  name: string
  color: ModelIntelligenceThemeColor
  dash: string | null
  marker: ModelIntelligenceMarker
  points: ModelIntelligencePoint[]
}

export function createTimelineTicks([start, end]: [number, number], tickCount = 7): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || tickCount < 1) return []
  if (start === end || tickCount === 1) return [start]

  const count = Math.max(2, Math.floor(tickCount))
  const ticks = Array.from({ length: count }, (_, index) =>
    index === count - 1 ? end : Math.round(start + ((end - start) * index) / (count - 1))
  )

  return ticks.filter((tick, index) => index === 0 || tick !== ticks[index - 1])
}

function getOpenAISeries(id: string): string {
  if (id.startsWith('o')) return 'o-series'
  if (id.includes('codex')) return 'GPT Codex'
  if (id.startsWith('gpt-5-6-sol')) return 'GPT Sol'
  if (id.startsWith('gpt-5-6-terra')) return 'GPT Terra'
  if (id.startsWith('gpt-5-6-luna')) return 'GPT Luna'
  if (id.includes('mini')) return 'GPT mini'
  if (id.includes('nano')) return 'GPT nano'
  if (id.startsWith('gpt-4')) return 'GPT-4'
  return 'GPT'
}

function getSeries(id: string, vendor: string): string {
  if (vendor === 'Anthropic') {
    if (id.includes('opus')) return 'Claude Opus'
    if (id.includes('sonnet')) return 'Claude Sonnet'
    if (id.includes('haiku')) return 'Claude Haiku'
    if (id.includes('fable')) return 'Claude Fable'
    return 'Claude'
  }

  if (vendor === 'OpenAI') return getOpenAISeries(id)

  if (vendor === 'Google') {
    if (id.includes('flash-lite')) return 'Gemini Flash-Lite'
    if (id.includes('flash')) return 'Gemini Flash'
    if (id.includes('pro')) return 'Gemini Pro'
    return 'Gemini'
  }

  if (vendor === 'DeepSeek') {
    if (id.includes('-r')) return 'DeepSeek R'
    if (id.includes('coder')) return 'DeepSeek Coder'
    if (id.includes('flash')) return 'DeepSeek Flash'
    if (id.includes('pro')) return 'DeepSeek Pro'
    return 'DeepSeek V'
  }

  if (vendor === 'Mistral AI') {
    if (id.startsWith('devstral')) return 'Devstral'
    if (id.startsWith('codestral')) return 'Codestral'
    if (id.includes('medium')) return 'Mistral Medium'
    if (id.includes('small')) return 'Mistral Small'
    return 'Mistral'
  }

  if (vendor === 'xAI') {
    if (id.includes('code')) return 'Grok Code'
    if (id.includes('fast')) return 'Grok Fast'
    return 'Grok'
  }

  if (vendor === 'Alibaba') {
    if (id.includes('coder')) return 'Qwen Coder'
    if (id.includes('max')) return 'Qwen Max'
    if (id.includes('plus')) return 'Qwen Plus'
    return 'Qwen'
  }

  if (vendor === 'Moonshot') {
    if (id.includes('code')) return 'Kimi Code'
    return 'Kimi'
  }

  if (vendor === 'Meta') {
    if (id.startsWith('llama')) return 'Llama'
    if (id.startsWith('muse')) return 'Muse'
  }

  if (vendor === 'Z.ai') {
    if (/^glm-\d+(?:-\d+)?v(?:-|$)/.test(id)) return 'GLM Vision'
    if (id.includes('flash')) return 'GLM Flash'
    if (id.includes('air')) return 'GLM Air'
    if (id.includes('turbo')) return 'GLM Turbo'
    return 'GLM'
  }

  if (vendor === 'MiniMax') return 'MiniMax M'
  return vendor
}

const modelById = new Map(modelsData.map(model => [model.id, model]))

export const allModelIntelligencePoints: ModelIntelligencePoint[] =
  artificialAnalysisData.entries.map(entry => {
    const model = modelById.get(entry.modelId)

    if (!model?.releaseDate) {
      throw new Error(`Artificial Analysis entry has no matching dated model: ${entry.modelId}`)
    }

    return {
      ...entry,
      name: model.name,
      vendor: model.vendor,
      series: getSeries(model.id, model.vendor),
      releaseDate: model.releaseDate,
      timestamp: Date.parse(`${model.releaseDate}T00:00:00Z`),
      color: findVendorByName(vendorsData, model.vendor)?.themeColor ?? FALLBACK_COLOR,
    }
  })

const hiddenVendorSet = new Set<string>(modelIntelligenceHiddenVendors)

export const modelIntelligencePoints = allModelIntelligencePoints.filter(
  point => !hiddenVendorSet.has(point.vendor)
)

const groupedSeries = new Map<string, ModelIntelligenceSeries>()

for (const point of modelIntelligencePoints) {
  const id = `${point.vendor}:${point.series}`
  const existing = groupedSeries.get(id)

  if (existing) {
    existing.points.push(point)
  } else {
    groupedSeries.set(id, {
      id,
      vendor: point.vendor,
      name: point.series,
      color: point.color,
      dash: null,
      marker: 'circle',
      points: [point],
    })
  }
}

const sortedSeries = Array.from(groupedSeries.values())
  .map(series => ({
    ...series,
    points: series.points.sort((a, b) => a.timestamp - b.timestamp || a.score - b.score),
  }))
  .sort(
    (a, b) =>
      a.vendor.localeCompare(b.vendor) ||
      a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' })
  )

const seriesIndexByVendor = new Map<string, number>()
const DASH_PATTERNS = [null, '6 4', '2 4', '10 4 2 4']
const MARKERS: ModelIntelligenceMarker[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'cross',
  'star',
  'wye',
]

export const modelIntelligenceSeries = sortedSeries.map(series => {
  const seriesIndex = seriesIndexByVendor.get(series.vendor) ?? 0
  seriesIndexByVendor.set(series.vendor, seriesIndex + 1)

  return {
    ...series,
    dash: DASH_PATTERNS[seriesIndex % DASH_PATTERNS.length] ?? null,
    marker: MARKERS[seriesIndex % MARKERS.length] ?? 'circle',
  }
})

export const modelIntelligenceMeta = {
  source: artificialAnalysisData.source,
  sourceUrl: artificialAnalysisData.sourceUrl,
  methodologyUrl: artificialAnalysisData.methodologyUrl,
  indexVersion: artificialAnalysisData.indexVersion,
  observedAt: artificialAnalysisData.observedAt,
}
