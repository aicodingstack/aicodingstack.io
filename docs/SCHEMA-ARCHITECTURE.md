# Schema Architecture

**Last Updated:** January 6, 2026

This document describes the modular Schema.org structured data architecture for AI Coding Stack, which provides type-safe, reusable JSON-LD schema generation for SEO optimization.

---

## Overview

The Schema system is built on a modular architecture with four main modules:

- **`types.ts`** - TypeScript type definitions for all Schema.org types
- **`builders.ts`** - Reusable schema builder functions
- **`generators.ts`** - High-level schema generators for specific page types
- **`validators.ts`** - Schema validation utilities

All modules are exported through a single entry point at **`index.ts`**.

## Directory Structure

```
src/lib/metadata/schemas/
├── types.ts          # Schema.org type definitions
├── builders.ts       # Reusable schema builders
├── generators.ts     # High-level page-specific generators
├── validators.ts     # Schema validation utilities
└── index.ts          # Public API surface
```

---

## Module: types.ts

Defines all Schema.org TypeScript interfaces following the official Schema.org vocabulary.

### Base Types

```typescript
interface SchemaBase {
  '@context': 'https://schema.org'
  '@type': string
}
```

### Supported Schema Types

| Type | Purpose | Interface Name |
|------|---------|----------------|
| Organization | Company/Organization info | `SchemaOrganization` |
| Person | Individual author info | `SchemaPerson` |
| SoftwareApplication | IDEs, CLIs, Extensions | `SchemaSoftwareApplication` |
| Product | Commercial products | `SchemaProduct` |
| ItemList | List pages (IDEs, Models, etc.) | `SchemaItemList` |
| BreadcrumbList | Navigation breadcrumbs | `SchemaBreadcrumbList` |
| FAQPage | Frequently asked questions | `SchemaFAQPage` |
| Article | Blog posts, articles | `SchemaArticle` |
| WebSite | Site-wide search/identity | `SchemaWebSite` |
| Offer | Pricing information | `SchemaOffer` |
| AggregateRating | Review ratings | `SchemaAggregateRating` |

### Key Interfaces

```typescript
// Core schema types
export interface SchemaOrganization extends SchemaBase {
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  sameAs?: string[]
  contactPoint?: SchemaContactPoint
}

export interface SchemaSoftwareApplication extends SchemaBase {
  '@type': 'SoftwareApplication'
  name: string
  applicationCategory: string
  description: string
  url: string
  operatingSystem?: string
  softwareVersion?: string
  offers?: SchemaOffer | SchemaOffer[]
  author: SchemaOrganization
}

export interface SchemaBreadcrumbList extends SchemaBase {
  '@type': 'BreadcrumbList'
  itemListElement: SchemaBreadcrumbListItem[]
}

export interface SchemaFAQPage extends SchemaBase {
  '@type': 'FAQPage'
  mainEntity: SchemaQuestion[]
}
```

---

## Module: builders.ts

Contains reusable builder functions that construct Schema.org objects from data.

### Builder Functions

| Builder | Schema Type | Purpose |
|---------|-------------|---------|
| `buildOrganizationSchema()` | Organization | Company/brand info |
| `buildPersonSchema()` | Person | Author profiles |
| `buildSoftwareApplicationSchema()` | SoftwareApplication | IDEs, CLIs, Extensions |
| `buildProductSchema()` | Product | Commercial tools |
| `buildItemListSchema()` | ItemList | List pages |
| `buildBreadcrumbListSchema()` | BreadcrumbList | Navigation |
| `buildArticleSchema()` | Article | Blog posts |
| `buildFAQPageSchema()` | FAQPage | Questions/answers |
| `buildWebSiteSchema()` | WebSite | Site search |
| `buildOffersSchema()` | Offer | Pricing data |
| `buildAggregateRatingSchema()` | AggregateRating | Review ratings |

### Example: SoftwareApplication Builder

```typescript
import { buildSoftwareApplicationSchema } from '@/lib/metadata/schemas'

const schema = buildSoftwareApplicationSchema({
  name: 'Cursor IDE',
  description: 'AI-first code editor',
  url: 'https://cursor.sh',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'IDE',
  operatingSystem: 'macOS, Windows, Linux',
  version: '0.43.5',
  vendorName: 'Anysphere',
  vendorUrl: 'https://anysphere.co',
  pricing: [
    { name: 'Free', value: 0, currency: 'USD', per: 'month' },
    { name: 'Pro', value: 20, currency: 'USD', per: 'month' },
  ],
  license: 'Proprietary',
})
```

### Example: BreadcrumbList Builder

```typescript
import { buildBreadcrumbListSchema } from '@/lib/metadata/schemas'

const schema = buildBreadcrumbListSchema([
  { name: 'Home', url: 'https://aicodingstack.io' },
  { name: 'IDEs', url: 'https://aicodingstack.io/ides' },
  { name: 'Cursor', url: 'https://aicodingstack.io/ides/cursor' },
])
```

---

## Module: generators.ts

High-level generators that combine builders with manifest data to create page-specific schemas.

### Generators

| Generator | For Page Type | Schemas Generated |
|-----------|---------------|-------------------|
| `generateRootOrganizationSchema()` | Root layout | Organization |
| `generateWebSiteSchema()` | Root layout | WebSite |
| `generateFAQPageSchema()` | Homepage | FAQPage |
| `generateSoftwareDetailSchema()` | IDE/CLI/Extension detail | SoftwareApplication, BreadcrumbList |
| `generateModelDetailSchema()` | Model detail | Product, BreadcrumbList |
| `generateListPageSchema()` | Category list pages | ItemList |
| `generateArticleSchema()` | Article pages | Article |
| `generateDocsSchema()` | Documentation pages | Article |
| `generateVendorSchema()` | Vendor pages | Organization |

### Example: IDE Detail Page Schema

```typescript
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

const schema = await generateSoftwareDetailSchema({
  product: ideData,        // From manifest
  category: 'ides',
  locale: 'en',
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'IDEs', url: '/ides' },
    { name: ideData.name, url: `/ides/${ideData.slug}` },
  ],
})
```

### Generator Options

#### SoftwareDetailSchemaOptions

```typescript
interface SoftwareDetailSchemaOptions {
  product: IDE | CLI | Extension
  category: 'ides' | 'clis' | 'extensions'
  locale: Locale
  breadcrumbs?: BreadcrumbItemData[]
}
```

#### ModelDetailSchemaOptions

```typescript
interface ModelDetailSchemaOptions {
  product: Model
  category: 'models'
  locale: Locale
  breadcrumbs?: BreadcrumbItemData[]
}
```

---

## Module: validators.ts

Provides schema validation with detailed error reporting.

### Validation Functions

| Function | Purpose |
|----------|---------|
| `validateSchema()` | Validate any schema against requirements |
| `validateOrThrow()` | Validate and throw on errors |
| `validateAndLog()` | Validate and log results to console |

### Validation Result

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

### Example Validation

```typescript
import { validateAndLog } from '@/lib/metadata/schemas'

const schema = generateSoftwareDetailSchema({ ... })
const result = validateAndLog(schema, 'IDE Detail Page')

// Output to console:
// Schema validation: IDE Detail Page
// Valid: true
// Errors: 0
// Warnings: 0
```

---

## Usage Patterns

### 1. Root Layout (Organization + WebSite)

```typescript
// src/app/[locale]/layout.tsx
import { generateRootOrganizationSchema, generateWebSiteSchema } from '@/lib/metadata/schemas'

const organizationSchema = await generateRootOrganizationSchema()
const websiteSchema = await generateWebSiteSchema()

return (
  <html>
    <head>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
    </head>
  </html>
)
```

### 2. Homepage (FAQPage)

```typescript
// src/app/[locale]/page.tsx
import { generateFAQPageSchema } from '@/lib/metadata/schemas'

const questions = [
  { question: 'What is AI Coding Stack?', answer: '...' },
  { question: 'How can I contribute?', answer: '...' },
  // ... more questions
]

const faqSchema = await generateFAQPageSchema(questions)

return (
  <>
    <JsonLd data={faqSchema} />
    {/* Page content */}
  </>
)
```

### 3. Detail Page (SoftwareApplication + BreadcrumbList)

```typescript
// src/app/[locale]/ides/[slug]/page.tsx
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

const schema = await generateSoftwareDetailSchema({
  product: ideData,
  category: 'ides',
  locale: params.locale,
})

return (
  <>
    <JsonLd data={schema} />
    {/* Page content */}
  </>
)
```

### 4. List Page (ItemList)

```typescript
// src/app/[locale]/ides/page.tsx
import { generateListPageSchema } from '@/lib/metadata/schemas'

const schema = await generateListPageSchema({
  items: ides.map((ide) => ({
    name: ide.name,
    url: baseUrl + `/ides/${ide.slug}`,
    description: ide.description,
  })),
  itemName: 'IDEs',
  itemDescription: 'AI-powered code editors',
})

return (
  <>
    <JsonLd data={schema} />
    {/* Page content */}
  </>
)
```

---

## Schema Types by Page Type

| Page Type | Schema(s) | Notes |
|-----------|-----------|-------|
| Home | Organization, WebSite, FAQPage | Root-level schemas |
| IDE/CLI/Extension Detail | SoftwareApplication, BreadcrumbList | Software-specific |
| Model Detail | Product, BreadcrumbList | Model-specific |
| Vendor Detail | Organization | Company info |
| List (IDEs/Models/etc.) | ItemList | Catalog-style |
| Article | Article | Blog/content |
| Documentation | Article (TechArticle) | Docs pages |

---

## Type Safety

All schema functions are fully typed. This ensures:

1. **Compile-time validation** - Invalid properties are caught at build time
2. **IDE autocompletion** - Schema properties are suggested in editors
3. **Refactor safety** - Changes to schema types propagate through codebase

```typescript
const schema = buildSoftwareApplicationSchema({
  name: 'Cursor',
  // TypeScript error: Property 'invalidField' does not exist
  invalidField: 'should not be here',
})
```

---

## Future Extensions

To add a new schema type:

1. Add type definition in `types.ts`
2. Add builder in `builders.ts`
3. Add generator in `generators.ts` (if needed for specific page)
4. Export from `index.ts`

### Example: Adding RatingReview Schema

```typescript
// 1. types.ts
export interface SchemaRatingReview extends SchemaBase {
  '@type': 'RatingReview'
  reviewRating: SchemaAggregateRating
  author: SchemaPerson
}

// 2. builders.ts
export function buildRatingReviewSchema(...) { ... }

// 3. index.ts
export { buildRatingReviewSchema } from './builders'
export type { SchemaRatingReview } from './types'
```

---

## Testing

Schemas are validated using the `validators.ts` module:

```typescript
import { validateOrThrow, validateAndLog } from '@/lib/metadata/schemas'

// Development: Log validation results
validateAndLog(schema, 'Page Name')

// Production: Throw on errors
validateOrThrow(schema)
```

---

## References

- [Schema.org Official Reference](https://schema.org/)
- [JSON-LD Playground](https://json-ld.org/playground/)
- [Google Structured Data Testing Tool](https://search.google.com/test/rich-results)
