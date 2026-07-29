import { modelsData } from '@/lib/generated/models'
import {
  allModelIntelligencePoints,
  type ModelIntelligenceThemeColor,
  modelIntelligenceMeta,
} from '@/lib/model-intelligence-index'
import type { ManifestModel } from '@/types/manifests'
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
  pricingSource: 'official' | 'reference'
  pricingSourceUrl: string | null
}

interface ComparableUsdPricing {
  input: number
  output: number
  source: ModelPriceIntelligencePoint['pricingSource']
  sourceUrl: string | null
}

function getComparableUsdPricing(model: ManifestModel): ComparableUsdPricing {
  const primaryOffer =
    model.tokenPricing.status === 'available'
      ? model.tokenPricing.offers.find(offer => offer.id === model.tokenPricing.primaryOffer)
      : undefined
  const primaryRates = primaryOffer?.tiers[0]?.rates

  if (
    primaryOffer?.currency === 'USD' &&
    primaryRates?.input !== null &&
    primaryRates?.input !== undefined &&
    primaryRates.output !== null &&
    primaryRates.output !== undefined
  ) {
    return {
      input: primaryRates.input,
      output: primaryRates.output,
      source: 'official',
      sourceUrl: null,
    }
  }

  const referencePricing = model.referenceTokenPricing

  if (
    referencePricing?.currency === 'USD' &&
    referencePricing.rates.input !== null &&
    referencePricing.rates.output !== null
  ) {
    return {
      input: referencePricing.rates.input,
      output: referencePricing.rates.output,
      source: 'reference',
      sourceUrl: referencePricing.source.url,
    }
  }

  throw new Error(`Price-intelligence selection has no comparable USD pricing: ${model.id}`)
}

const modelById = new Map((modelsData as ManifestModel[]).map(model => [model.id, model] as const))
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

    const pricing = getComparableUsdPricing(model)

    return {
      name: model.name,
      vendor: model.vendor,
      score: intelligence.score,
      estimated: intelligence.estimated,
      configuration: intelligence.configuration,
      inputPrice: pricing.input,
      outputPrice: pricing.output,
      blendedPrice: pricing.input * INPUT_SHARE + pricing.output * OUTPUT_SHARE,
      currency: 'USD',
      color: intelligence.color,
      pricingSource: pricing.source,
      pricingSourceUrl: pricing.sourceUrl,
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
      } => point.pricingSource === 'reference' && point.pricingSourceUrl !== null
    )
    .map(point => ({
      modelId: point.modelId,
      name: point.name,
      sourceUrl: point.pricingSourceUrl,
    })),
}
