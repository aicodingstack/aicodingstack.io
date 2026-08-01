/**
 * Required Metadata Fields Validation
 * Ensures all pages generate complete metadata for optimal SEO
 */

import type { Metadata } from 'next'

/**
 * Internal type for OpenGraph metadata validation
 */
interface OpenGraphMetadata {
  title?: string
  description?: string
  url?: string
  type?: string
  locale?: string
}

/**
 * Internal type for Twitter metadata validation
 */
interface TwitterMetadata {
  card?: string
  site?: string
  title?: string
  description?: string
}

/**
 * Required top-level metadata fields
 * Based on SEO best practices and project requirements
 */
export interface RequiredMetadataFields {
  title: string
  description: string
  alternates: {
    canonical: string
    languages: Record<string, string>
  }
  robots: {
    index: boolean
    follow: boolean
  }
  openGraph: {
    title: string
    description: string
    url: string
    type: 'website' | 'article'
    locale: string
  }
  twitter: {
    card: 'summary_large_image'
    site: string
    title: string
    description: string
  }
}

/**
 * Optional but recommended metadata fields
 */
export interface RecommendedMetadataFields {
  authors?: Array<{ name: string }>
  creator?: string
  publisher?: string
  openGraph?: {
    siteName?: string
    publishedTime?: string
    modifiedTime?: string
  }
  twitter?: {
    creator?: string
  }
}

/**
 * Validation error types
 */
export type ValidationError = {
  field: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Validate metadata completeness
 * Returns an array of validation errors (empty if valid)
 */
export function validateMetadataCompleteness(
  metadata: Metadata,
  _pageName: string
): ValidationError[] {
  const errors: ValidationError[] = []

  // Check title
  if (!metadata.title) {
    errors.push({
      field: 'title',
      message: 'Missing required field: title',
      severity: 'error',
    })
  } else if (typeof metadata.title === 'string' && metadata.title.length > 60) {
    errors.push({
      field: 'title',
      message: `Title too long (${metadata.title.length} chars, recommended: 50-60)`,
      severity: 'warning',
    })
  }

  // Check description
  if (!metadata.description) {
    errors.push({
      field: 'description',
      message: 'Missing required field: description',
      severity: 'error',
    })
  } else if (metadata.description.length > 160) {
    errors.push({
      field: 'description',
      message: `Description too long (${metadata.description.length} chars, recommended: 150-160)`,
      severity: 'warning',
    })
  }

  // Check alternates
  if (!metadata.alternates?.canonical) {
    errors.push({
      field: 'alternates.canonical',
      message: 'Missing required field: alternates.canonical',
      severity: 'error',
    })
  }

  if (!metadata.alternates?.languages || Object.keys(metadata.alternates.languages).length === 0) {
    errors.push({
      field: 'alternates.languages',
      message: 'Missing required field: alternates.languages (hreflang)',
      severity: 'error',
    })
  }

  // Check robots
  if (!metadata.robots) {
    errors.push({
      field: 'robots',
      message: 'Missing required field: robots',
      severity: 'error',
    })
  }

  // Check OpenGraph
  if (!metadata.openGraph) {
    errors.push({
      field: 'openGraph',
      message: 'Missing required field: openGraph',
      severity: 'error',
    })
  } else {
    const og = metadata.openGraph as OpenGraphMetadata
    if (!og.title)
      errors.push({
        field: 'openGraph.title',
        message: 'Missing OpenGraph title',
        severity: 'error',
      })
    if (!og.description)
      errors.push({
        field: 'openGraph.description',
        message: 'Missing OpenGraph description',
        severity: 'error',
      })
    if (!og.url)
      errors.push({ field: 'openGraph.url', message: 'Missing OpenGraph URL', severity: 'error' })
    if (!og.type)
      errors.push({ field: 'openGraph.type', message: 'Missing OpenGraph type', severity: 'error' })
    if (!og.locale)
      errors.push({
        field: 'openGraph.locale',
        message: 'Missing OpenGraph locale',
        severity: 'error',
      })
  }

  // Check Twitter
  if (!metadata.twitter) {
    errors.push({
      field: 'twitter',
      message: 'Missing required field: twitter',
      severity: 'error',
    })
  } else {
    const tw = metadata.twitter as TwitterMetadata
    if (!tw.card)
      errors.push({
        field: 'twitter.card',
        message: 'Missing Twitter card type',
        severity: 'error',
      })
    if (!tw.title)
      errors.push({ field: 'twitter.title', message: 'Missing Twitter title', severity: 'error' })
    if (!tw.description)
      errors.push({
        field: 'twitter.description',
        message: 'Missing Twitter description',
        severity: 'error',
      })
  }

  return errors
}

/**
 * Assert metadata is complete (throws in development)
 * Only runs in development mode, zero production impact
 */
export function assertMetadataComplete(metadata: Metadata, pageName: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const errors = validateMetadataCompleteness(metadata, pageName)
  const hasErrors = errors.some(e => e.severity === 'error')

  if (hasErrors || errors.length > 0) {
    console.warn(`\n⚠️  Metadata validation issues for page: ${pageName}`)
    errors.forEach(error => {
      const icon = error.severity === 'error' ? '❌' : '⚠️ '
      console.warn(`  ${icon} [${error.severity}] ${error.field}: ${error.message}`)
    })

    if (hasErrors) {
      console.error(`\n❌ Page "${pageName}" has incomplete metadata. Fix the errors above.`)
    }
  }
}

/**
 * Validate all required fields are present (type guard)
 */
export function hasRequiredFields(metadata: Metadata): boolean {
  const errors = validateMetadataCompleteness(metadata, 'unknown')
  return errors.filter(e => e.severity === 'error').length === 0
}

/**
 * Development-only: Log metadata summary
 */
export function logMetadataSummary(metadata: Metadata, pageName: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  console.log(`\n📊 Metadata Summary for: ${pageName}`)
  console.log(`  Title: ${metadata.title}`)
  console.log(`  Description: ${metadata.description?.substring(0, 80)}...`)
  console.log(`  Canonical: ${metadata.alternates?.canonical}`)
  console.log(`  Languages: ${Object.keys(metadata.alternates?.languages || {}).length} locales`)
  console.log(`  OpenGraph: ${(metadata.openGraph as OpenGraphMetadata)?.type}`)
}
