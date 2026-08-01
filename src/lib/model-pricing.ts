import type {
  ManifestAvailableTokenPricing,
  ManifestModel,
  ManifestReferenceTokenPricing,
  ManifestTokenPricing,
  ManifestTokenPricingOffer,
  ManifestTokenPricingRate,
  ManifestTokenPricingTier,
} from '@/types/manifests'

export type DisplayCurrency = 'CNY' | 'USD'

export interface CurrencyConversion {
  targetCurrency: DisplayCurrency
  usdToCny: number | null
}

interface ConvertedTokenRate {
  value: number
  currency: string
  converted: boolean
}

export function isTokenPricingAvailable(
  pricing: ManifestTokenPricing
): pricing is ManifestAvailableTokenPricing {
  return pricing.status === 'available'
}

export function getPrimaryTokenPricingOffer(
  pricing: ManifestTokenPricing
): ManifestTokenPricingOffer | null {
  if (!isTokenPricingAvailable(pricing)) return null
  return (
    pricing.offers.find(offer => offer.id === pricing.primaryOffer) ?? pricing.offers[0] ?? null
  )
}

export function getPrimaryTokenPricingTier(
  pricing: ManifestTokenPricing
): ManifestTokenPricingTier | null {
  return getPrimaryTokenPricingOffer(pricing)?.tiers[0] ?? null
}

export function getPrimaryTokenRate(
  pricing: ManifestTokenPricing,
  rate: ManifestTokenPricingRate
): number | null {
  return getPrimaryTokenPricingTier(pricing)?.rates[rate] ?? null
}

export function getPrimaryTokenRateRange(
  pricing: ManifestTokenPricing,
  rate: ManifestTokenPricingRate
): { min: number; max: number } | null {
  const offer = getPrimaryTokenPricingOffer(pricing)
  if (!offer) return null
  const values = offer.tiers
    .map(tier => tier.rates[rate])
    .filter((value): value is number => value !== null)
  if (values.length === 0) return null
  return { min: Math.min(...values), max: Math.max(...values) }
}

export function hasTieredTokenPricing(pricing: ManifestTokenPricing): boolean {
  const offer = getPrimaryTokenPricingOffer(pricing)
  return Boolean(offer && offer.tiers.length > 1)
}

export function formatTokenRate(
  value: number,
  currency: string,
  locale: string,
  maximumFractionDigits = 6,
  conversion?: CurrencyConversion | null
): string {
  const converted = convertTokenRate(value, currency, conversion)
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: converted.currency,
    maximumFractionDigits,
  }).format(converted.value)
  return converted.converted ? `≈${formatted}` : formatted
}

export function convertTokenRate(
  value: number,
  currency: string,
  conversion?: CurrencyConversion | null
): ConvertedTokenRate {
  if (!conversion || currency === conversion.targetCurrency) {
    return { value, currency, converted: false }
  }

  if (!conversion.usdToCny) {
    return { value, currency, converted: false }
  }

  if (currency === 'USD' && conversion.targetCurrency === 'CNY') {
    return {
      value: value * conversion.usdToCny,
      currency: conversion.targetCurrency,
      converted: true,
    }
  }

  if (currency === 'CNY' && conversion.targetCurrency === 'USD') {
    return {
      value: value / conversion.usdToCny,
      currency: conversion.targetCurrency,
      converted: true,
    }
  }

  return { value, currency, converted: false }
}

function formatConvertedTokenRate(
  converted: ConvertedTokenRate,
  locale: string,
  maximumFractionDigits = 6
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: converted.currency,
    maximumFractionDigits,
  }).format(converted.value)
}

export function formatPrimaryTokenRate(
  pricing: ManifestTokenPricing,
  rate: ManifestTokenPricingRate,
  locale: string,
  conversion?: CurrencyConversion | null
): string | null {
  const offer = getPrimaryTokenPricingOffer(pricing)
  const range = getPrimaryTokenRateRange(pricing, rate)
  if (!offer || !range) return null
  const minimum = convertTokenRate(range.min, offer.currency, conversion)
  const maximum = convertTokenRate(range.max, offer.currency, conversion)
  const prefix = minimum.converted ? '≈' : ''
  const formattedMinimum = formatConvertedTokenRate(minimum, locale)
  if (range.min === range.max) return `${prefix}${formattedMinimum}`
  return `${prefix}${formattedMinimum}–${formatConvertedTokenRate(maximum, locale)}`
}

export function formatReferenceTokenRate(
  pricing: ManifestReferenceTokenPricing,
  rate: ManifestTokenPricingRate,
  locale: string,
  conversion?: CurrencyConversion | null
): string | null {
  const value = pricing.rates[rate]
  if (value === null) return null

  const formatted = formatTokenRate(value, pricing.currency, locale, 6, conversion)
  return pricing.basis === 'provider-median' && !formatted.startsWith('≈')
    ? `≈${formatted}`
    : formatted
}

export function formatModelTokenRate(
  model: Pick<ManifestModel, 'tokenPricing' | 'referenceTokenPricing'>,
  rate: ManifestTokenPricingRate,
  locale: string,
  conversion?: CurrencyConversion | null
): string | null {
  return (
    formatPrimaryTokenRate(model.tokenPricing, rate, locale, conversion) ??
    (model.referenceTokenPricing
      ? formatReferenceTokenRate(model.referenceTokenPricing, rate, locale, conversion)
      : null)
  )
}

export function hasCurrentSingleTierPricing(pricing: ManifestTokenPricing): boolean {
  const offer = getPrimaryTokenPricingOffer(pricing)
  return Boolean(offer && offer.tiers.length === 1 && offer.effectiveTo === null)
}
