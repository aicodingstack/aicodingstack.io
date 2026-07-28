import { modelsData } from '@/lib/generated/models'
import {
  allModelIntelligencePoints,
  type ModelIntelligenceThemeColor,
  modelIntelligenceMeta,
} from '@/lib/model-intelligence-index'
import modelPriceIntelligenceData from '../../data/model-price-intelligence-index.json'

const INPUT_SHARE = modelPriceIntelligenceData.inputShare
const OUTPUT_SHARE = modelPriceIntelligenceData.outputShare

type LabelAnchor = 'start' | 'middle' | 'end'

interface SelectedModel {
  modelId: string
  labelDx: number
  labelDy: number
  labelAnchor: LabelAnchor
  linearLabelDx?: number
  linearLabelDy?: number
  linearLabelAnchor?: LabelAnchor
  usdPriceOverride?: {
    input: number
    output: number
    sourceUrl: string
  }
}

const selectedModels = modelPriceIntelligenceData.models as SelectedModel[]

export interface ModelPriceIntelligencePoint {
  modelId: string
  name: string
  vendor: string
  score: number
  estimated: boolean
  configuration: string
  inputPrice: number
  outputPrice: number
  blendedPrice: number
  currency: 'USD'
  color: ModelIntelligenceThemeColor
  labelDx: number
  labelDy: number
  labelAnchor: LabelAnchor
  linearLabelDx?: number
  linearLabelDy?: number
  linearLabelAnchor?: LabelAnchor
  pricingSource: 'catalog' | 'artificial-analysis'
  pricingSourceUrl: string | null
}

const modelById = new Map(modelsData.map(model => [model.id, model]))
const intelligenceByModelId = new Map(
  allModelIntelligencePoints.map(point => [point.modelId, point])
)

export const modelPriceIntelligencePoints: ModelPriceIntelligencePoint[] = selectedModels.map(
  selection => {
    const model = modelById.get(selection.modelId)
    const intelligence = intelligenceByModelId.get(selection.modelId)

    if (!model) {
      throw new Error(`Price-intelligence selection has no matching model: ${selection.modelId}`)
    }

    if (!intelligence) {
      throw new Error(
        `Price-intelligence selection has no Intelligence Index score: ${selection.modelId}`
      )
    }

    if (!selection.usdPriceOverride && model.tokenPricing.status !== 'available') {
      throw new Error(
        `Price-intelligence selection has no available token pricing: ${selection.modelId}`
      )
    }

    const primaryOffer =
      model.tokenPricing.status === 'available'
        ? model.tokenPricing.offers.find(offer => offer.id === model.tokenPricing.primaryOffer)
        : undefined
    const primaryTier = primaryOffer?.tiers[0]
    const inputPrice = selection.usdPriceOverride?.input ?? primaryTier?.rates.input
    const outputPrice = selection.usdPriceOverride?.output ?? primaryTier?.rates.output

    if (
      (!selection.usdPriceOverride && primaryOffer?.currency !== 'USD') ||
      inputPrice === null ||
      inputPrice === undefined ||
      outputPrice === null ||
      outputPrice === undefined
    ) {
      throw new Error(
        `Price-intelligence selection requires comparable USD input and output pricing: ${selection.modelId}`
      )
    }

    return {
      name: model.name,
      vendor: model.vendor,
      score: intelligence.score,
      estimated: intelligence.estimated,
      configuration: intelligence.configuration,
      inputPrice,
      outputPrice,
      blendedPrice: inputPrice * INPUT_SHARE + outputPrice * OUTPUT_SHARE,
      currency: 'USD',
      color: intelligence.color,
      pricingSource: selection.usdPriceOverride ? 'artificial-analysis' : 'catalog',
      pricingSourceUrl: selection.usdPriceOverride?.sourceUrl ?? null,
      ...selection,
    }
  }
)

export const modelPriceIntelligenceMeta = {
  ...modelPriceIntelligencePoints.reduce(
    (meta, point) => ({
      minPrice: Math.min(meta.minPrice, point.blendedPrice),
      maxPrice: Math.max(meta.maxPrice, point.blendedPrice),
      maxScore: Math.max(meta.maxScore, point.score),
    }),
    {
      minPrice: Number.POSITIVE_INFINITY,
      maxPrice: 0,
      maxScore: 0,
    }
  ),
  inputShare: INPUT_SHARE,
  outputShare: OUTPUT_SHARE,
  source: modelIntelligenceMeta.source,
  sourceUrl: modelIntelligenceMeta.sourceUrl,
  methodologyUrl: modelIntelligenceMeta.methodologyUrl,
  indexVersion: modelIntelligenceMeta.indexVersion,
  observedAt: modelIntelligenceMeta.observedAt,
  fallbackPricingSources: modelPriceIntelligencePoints
    .filter(
      (
        point
      ): point is ModelPriceIntelligencePoint & {
        pricingSourceUrl: string
      } => point.pricingSource === 'artificial-analysis' && point.pricingSourceUrl !== null
    )
    .map(point => ({
      modelId: point.modelId,
      name: point.name,
      sourceUrl: point.pricingSourceUrl,
    })),
}
