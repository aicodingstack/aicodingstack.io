import { modelsData } from '@/lib/generated/models'
import {
  allModelIntelligencePoints,
  type ModelIntelligenceThemeColor,
  modelIntelligenceMeta,
} from '@/lib/model-intelligence-index'

const INPUT_SHARE = 0.9
const OUTPUT_SHARE = 0.1

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

const selectedModels: SelectedModel[] = [
  {
    modelId: 'deepseek-v4-flash',
    labelDx: -8,
    labelDy: 18,
    labelAnchor: 'end',
    linearLabelDx: 18,
    linearLabelDy: 28,
    linearLabelAnchor: 'start',
  },
  {
    modelId: 'deepseek-v4-pro',
    labelDx: -12,
    labelDy: -14,
    labelAnchor: 'end',
    linearLabelDx: 16,
    linearLabelDy: -40,
    linearLabelAnchor: 'start',
  },
  {
    modelId: 'hy3',
    labelDx: 12,
    labelDy: -28,
    labelAnchor: 'start',
    linearLabelDx: -16,
    linearLabelDy: -46,
    linearLabelAnchor: 'end',
    usdPriceOverride: {
      input: 0.14,
      output: 0.58,
      sourceUrl: 'https://artificialanalysis.ai/models/hy3',
    },
  },
  {
    modelId: 'minimax-m3',
    labelDx: -12,
    labelDy: 24,
    labelAnchor: 'end',
    linearLabelDx: -16,
    linearLabelDy: 34,
    linearLabelAnchor: 'end',
  },
  {
    modelId: 'qwen3-6-35b-a3b',
    labelDx: -10,
    labelDy: -10,
    labelAnchor: 'end',
    linearLabelDx: 10,
    linearLabelDy: 22,
    linearLabelAnchor: 'start',
  },
  {
    modelId: 'qwen3-7-plus',
    labelDx: 10,
    labelDy: -10,
    labelAnchor: 'start',
    linearLabelDx: 18,
    linearLabelDy: -22,
    linearLabelAnchor: 'start',
    usdPriceOverride: {
      input: 0.4,
      output: 1.6,
      sourceUrl: 'https://artificialanalysis.ai/models/qwen3-7-plus',
    },
  },
  { modelId: 'glm-5-2', labelDx: -22, labelDy: -18, labelAnchor: 'end' },
  { modelId: 'gpt-5-6-luna', labelDx: 0, labelDy: -42, labelAnchor: 'middle' },
  {
    modelId: 'gemini-3-5-flash-lite',
    labelDx: 14,
    labelDy: 28,
    labelAnchor: 'start',
  },
  { modelId: 'gemini-3-6-flash', labelDx: -18, labelDy: 24, labelAnchor: 'end' },
  { modelId: 'grok-4-5', labelDx: 18, labelDy: -24, labelAnchor: 'start' },
  { modelId: 'claude-haiku-4-5', labelDx: -10, labelDy: -10, labelAnchor: 'end' },
  { modelId: 'claude-sonnet-5', labelDx: 8, labelDy: -10, labelAnchor: 'start' },
  {
    modelId: 'qwen3-7-max',
    labelDx: -10,
    labelDy: -28,
    labelAnchor: 'end',
    usdPriceOverride: {
      input: 2.5,
      output: 7.5,
      sourceUrl: 'https://artificialanalysis.ai/models/qwen3-7-max',
    },
  },
  { modelId: 'gemini-3-1-pro-preview', labelDx: 8, labelDy: 18, labelAnchor: 'start' },
  { modelId: 'gpt-5-6-terra', labelDx: 8, labelDy: -32, labelAnchor: 'start' },
  { modelId: 'kimi-k3', labelDx: -8, labelDy: -42, labelAnchor: 'end' },
  { modelId: 'claude-opus-5', labelDx: -8, labelDy: 18, labelAnchor: 'end' },
  { modelId: 'gpt-5-6-sol', labelDx: 8, labelDy: -10, labelAnchor: 'start' },
]

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
