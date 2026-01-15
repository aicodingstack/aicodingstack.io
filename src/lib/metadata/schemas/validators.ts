/**
 * Schema Validators
 * Validate Schema.org objects for correctness and completeness
 * Helps catch errors during development
 */

import type {
  AnySchema,
  SchemaArticle,
  SchemaBreadcrumbList,
  SchemaFAQPage,
  SchemaItemList,
  SchemaOffer,
  SchemaOrganization,
  SchemaProduct,
  SchemaSoftwareApplication,
  SchemaWebSite,
} from './types'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate any Schema.org object
 */
export function validateSchema(schema: AnySchema): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required base fields
  if (!schema['@context']) {
    errors.push('Missing required field: @context')
  } else if (schema['@context'] !== 'https://schema.org') {
    errors.push(`Invalid @context: ${schema['@context']} (should be "https://schema.org")`)
  }

  if (!schema['@type']) {
    errors.push('Missing required field: @type')
  }

  // Type-specific validation
  if (schema['@type']) {
    switch (schema['@type']) {
      case 'Organization':
        validateOrganization(schema as SchemaOrganization, errors, warnings)
        break
      case 'SoftwareApplication':
        validateSoftwareApplication(schema as SchemaSoftwareApplication, errors, warnings)
        break
      case 'Product':
        validateProduct(schema as SchemaProduct, errors, warnings)
        break
      case 'Article':
      case 'TechArticle':
      case 'BlogPosting':
        validateArticle(schema as SchemaArticle, errors, warnings)
        break
      case 'ItemList':
        validateItemList(schema as SchemaItemList, errors, warnings)
        break
      case 'BreadcrumbList':
        validateBreadcrumbList(schema as SchemaBreadcrumbList, errors, warnings)
        break
      case 'WebSite':
        validateWebSite(schema as SchemaWebSite, errors, warnings)
        break
      case 'FAQPage':
        validateFAQPage(schema as SchemaFAQPage, errors, warnings)
        break
      default:
        warnings.push(`Unknown schema type: ${schema['@type']}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate Organization schema
 */
function validateOrganization(schema: SchemaOrganization, errors: string[], warnings: string[]) {
  if (!schema.name) errors.push('Organization: Missing required field "name"')
  if (!schema.url) errors.push('Organization: Missing required field "url"')
  else if (!isValidUrl(schema.url)) errors.push(`Organization: Invalid URL "${schema.url}"`)

  if (schema.logo && !isValidUrl(schema.logo)) {
    warnings.push(`Organization: Invalid logo URL "${schema.logo}"`)
  }
}

/**
 * Validate SoftwareApplication schema
 */
function validateSoftwareApplication(
  schema: SchemaSoftwareApplication,
  errors: string[],
  warnings: string[]
) {
  if (!schema.name) errors.push('SoftwareApplication: Missing required field "name"')
  if (!schema.applicationCategory) {
    errors.push('SoftwareApplication: Missing required field "applicationCategory"')
  }
  if (!schema.description) {
    errors.push('SoftwareApplication: Missing required field "description"')
  }
  if (!schema.url) errors.push('SoftwareApplication: Missing required field "url"')
  else if (!isValidUrl(schema.url)) {
    errors.push(`SoftwareApplication: Invalid URL "${schema.url}"`)
  }

  if (!schema.author) {
    warnings.push('SoftwareApplication: Missing recommended field "author"')
  }

  if (schema.downloadUrl && !isValidUrl(schema.downloadUrl)) {
    warnings.push(`SoftwareApplication: Invalid downloadUrl "${schema.downloadUrl}"`)
  }

  if (schema.offers) {
    validateOffers(schema.offers, errors, warnings, 'SoftwareApplication')
  }
}

/**
 * Validate Product schema
 */
function validateProduct(schema: SchemaProduct, errors: string[], warnings: string[]) {
  if (!schema.name) errors.push('Product: Missing required field "name"')
  if (!schema.description) errors.push('Product: Missing required field "description"')
  if (!schema.brand) errors.push('Product: Missing required field "brand"')

  if (schema.offers) {
    validateOffers(schema.offers, errors, warnings, 'Product')
  }
}

/**
 * Validate Article schema
 */
function validateArticle(schema: SchemaArticle, errors: string[], warnings: string[]) {
  if (!schema.headline) errors.push('Article: Missing required field "headline"')
  if (!schema.author) errors.push('Article: Missing required field "author"')
  if (!schema.datePublished) errors.push('Article: Missing required field "datePublished"')
  if (!schema.publisher) errors.push('Article: Missing required field "publisher"')

  if (schema.datePublished && !isValidISODate(schema.datePublished)) {
    errors.push(`Article: Invalid datePublished format "${schema.datePublished}"`)
  }

  if (schema.dateModified && !isValidISODate(schema.dateModified)) {
    warnings.push(`Article: Invalid dateModified format "${schema.dateModified}"`)
  }

  if (!schema.image) {
    warnings.push('Article: Missing recommended field "image"')
  }
}

/**
 * Validate ItemList schema
 */
function validateItemList(schema: SchemaItemList, errors: string[], warnings: string[]) {
  if (!schema.itemListElement) {
    errors.push('ItemList: Missing required field "itemListElement"')
  } else if (!Array.isArray(schema.itemListElement)) {
    errors.push('ItemList: "itemListElement" must be an array')
  } else {
    schema.itemListElement.forEach((item, index: number) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`ItemList: Item ${index + 1} missing @type "ListItem"`)
      }
      if (!item.position) {
        errors.push(`ItemList: Item ${index + 1} missing required field "position"`)
      }
      if (!item.item) {
        errors.push(`ItemList: Item ${index + 1} missing required field "item"`)
      }
    })
  }

  if (schema.numberOfItems !== schema.itemListElement?.length) {
    warnings.push(
      `ItemList: numberOfItems (${schema.numberOfItems}) doesn't match actual items (${schema.itemListElement?.length})`
    )
  }
}

/**
 * Validate BreadcrumbList schema
 */
function validateBreadcrumbList(
  schema: SchemaBreadcrumbList,
  errors: string[],
  _warnings: string[]
) {
  if (!schema.itemListElement) {
    errors.push('BreadcrumbList: Missing required field "itemListElement"')
  } else if (!Array.isArray(schema.itemListElement)) {
    errors.push('BreadcrumbList: "itemListElement" must be an array')
  } else {
    schema.itemListElement.forEach((item, index: number) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`BreadcrumbList: Item ${index + 1} missing @type "ListItem"`)
      }
      if (!item.position) {
        errors.push(`BreadcrumbList: Item ${index + 1} missing required field "position"`)
      }
      if (!item.name) {
        errors.push(`BreadcrumbList: Item ${index + 1} missing required field "name"`)
      }
      if (!item.item) {
        errors.push(`BreadcrumbList: Item ${index + 1} missing required field "item"`)
      }
    })
  }
}

/**
 * Validate WebSite schema
 */
function validateWebSite(schema: SchemaWebSite, errors: string[], warnings: string[]) {
  if (!schema.name) errors.push('WebSite: Missing required field "name"')
  if (!schema.url) errors.push('WebSite: Missing required field "url"')
  else if (!isValidUrl(schema.url)) errors.push(`WebSite: Invalid URL "${schema.url}"`)

  if (!schema.potentialAction) {
    warnings.push('WebSite: Missing recommended field "potentialAction" (search functionality)')
  }
}

/**
 * Validate FAQPage schema
 */
function validateFAQPage(schema: SchemaFAQPage, errors: string[], warnings: string[]) {
  if (!schema.mainEntity) {
    errors.push('FAQPage: Missing required field "mainEntity"')
  } else if (!Array.isArray(schema.mainEntity)) {
    errors.push('FAQPage: "mainEntity" must be an array')
  } else if (schema.mainEntity.length === 0) {
    warnings.push('FAQPage: "mainEntity" is empty')
  } else {
    schema.mainEntity.forEach((question, index: number) => {
      if (!question['@type'] || question['@type'] !== 'Question') {
        errors.push(`FAQPage: Question ${index + 1} missing @type "Question"`)
      }
      if (!question.name) {
        errors.push(`FAQPage: Question ${index + 1} missing required field "name"`)
      }
      if (!question.acceptedAnswer) {
        errors.push(`FAQPage: Question ${index + 1} missing required field "acceptedAnswer"`)
      } else if (!question.acceptedAnswer.text) {
        errors.push(`FAQPage: Question ${index + 1} answer missing required field "text"`)
      }
    })
  }
}

/**
 * Validate Offer or array of Offers
 */
function validateOffers(
  offers: SchemaOffer | SchemaOffer[],
  errors: string[],
  _warnings: string[],
  parentType: string
) {
  const offerArray = Array.isArray(offers) ? offers : [offers]

  offerArray.forEach((offer, index: number) => {
    if (!offer['@type'] || offer['@type'] !== 'Offer') {
      errors.push(`${parentType}: Offer ${index + 1} missing @type "Offer"`)
    }
    if (offer.price === undefined || offer.price === null) {
      errors.push(`${parentType}: Offer ${index + 1} missing required field "price"`)
    }
    if (!offer.priceCurrency) {
      errors.push(`${parentType}: Offer ${index + 1} missing required field "priceCurrency"`)
    }
  })
}

/**
 * Helper: Check if string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Helper: Check if string is a valid ISO date
 */
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString)
  return !Number.isNaN(date.getTime())
}

/**
 * Validate and log schema in development mode
 * Only runs validation in development environment
 */
export function validateAndLog(schema: AnySchema, pageName: string): void {
  if (process.env.NODE_ENV !== 'development') return

  const result = validateSchema(schema)

  if (!result.valid || result.warnings.length > 0) {
    console.group(`[Schema Validation] ${pageName}`)

    if (result.errors.length > 0) {
      console.error('❌ Errors:')
      for (const error of result.errors) {
        console.error(`  - ${error}`)
      }
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  WarningMessages::')
      for (const warning of result.warnings) {
        console.warn(`  - ${warning}`)
      }
    }

    console.groupEnd()
  } else {
    console.log(`✅ [Schema Validation] ${pageName}: Valid`)
  }
}

/**
 * Validate schema and throw error if invalid
 * Use this in critical paths where schema must be valid
 */
export function validateOrThrow(schema: AnySchema, pageName: string): void {
  const result = validateSchema(schema)

  if (!result.valid) {
    throw new Error(`Invalid schema for ${pageName}:\n${result.errors.join('\n')}`)
  }
}
