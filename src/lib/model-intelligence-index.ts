import { modelsData } from '@/lib/generated/models'
import { vendorsData } from '@/lib/generated/vendors'
import { findVendorByName } from '@/lib/vendor-identity'
import artificialAnalysisData from '../../data/artificial-analysis-index.json'
import modelIntelligenceData from '../../data/model-intelligence-index.json'

const FALLBACK_COLOR: ModelIntelligenceThemeColor = {
  light: '#6b7280',
  dark: '#9ca3af',
}

export const modelIntelligenceHiddenVendors = modelIntelligenceData.hiddenVendorIds.map(
  vendorId => {
    const vendor = vendorsData.find(candidate => candidate.id === vendorId)

    if (!vendor) {
      throw new Error(`Model intelligence configuration has no matching vendor: ${vendorId}`)
    }

    return vendor.name
  }
)
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
  seriesId: string
  seriesOrder: number
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
  order: number
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

const modelById = new Map(modelsData.map(model => [model.id, model]))
const modelSeriesByModelId = new Map<
  string,
  {
    vendorId: string
    seriesId: string
    seriesName: string
    seriesOrder: number
  }
>()

for (const vendor of vendorsData) {
  vendor.modelSeries?.forEach((series, seriesOrder) => {
    for (const modelId of series.modelIds) {
      if (modelSeriesByModelId.has(modelId)) {
        throw new Error(`Model belongs to multiple vendor series: ${modelId}`)
      }

      modelSeriesByModelId.set(modelId, {
        vendorId: vendor.id,
        seriesId: series.id,
        seriesName: series.name,
        seriesOrder,
      })
    }
  })
}

export const allModelIntelligencePoints: ModelIntelligencePoint[] =
  artificialAnalysisData.entries.map(entry => {
    const model = modelById.get(entry.modelId)

    if (!model?.releaseDate) {
      throw new Error(`Artificial Analysis entry has no matching dated model: ${entry.modelId}`)
    }

    const series = modelSeriesByModelId.get(model.id)

    if (!series) {
      throw new Error(`Artificial Analysis model has no vendor series: ${model.id}`)
    }

    const vendor = findVendorByName(vendorsData, model.vendor)

    if (!vendor || series.vendorId !== vendor.id) {
      throw new Error(`Model series vendor does not match model vendor: ${model.id}`)
    }

    return {
      ...entry,
      name: model.name,
      vendor: model.vendor,
      series: series.seriesName,
      seriesId: series.seriesId,
      seriesOrder: series.seriesOrder,
      releaseDate: model.releaseDate,
      timestamp: Date.parse(`${model.releaseDate}T00:00:00Z`),
      color: vendor.themeColor ?? FALLBACK_COLOR,
    }
  })

const hiddenVendorSet = new Set<string>(modelIntelligenceHiddenVendors)

export const modelIntelligencePoints = allModelIntelligencePoints.filter(
  point => !hiddenVendorSet.has(point.vendor)
)

const groupedSeries = new Map<string, ModelIntelligenceSeries>()

for (const point of modelIntelligencePoints) {
  const id = `${point.vendor}:${point.seriesId}`
  const existing = groupedSeries.get(id)

  if (existing) {
    existing.points.push(point)
  } else {
    groupedSeries.set(id, {
      id,
      vendor: point.vendor,
      name: point.series,
      order: point.seriesOrder,
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
      a.order - b.order ||
      a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' })
  )

const seriesIndexByVendor = new Map<string, number>()
const DASH_PATTERNS = [null, '6 4', '10 4 2 4', '2 4']
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
