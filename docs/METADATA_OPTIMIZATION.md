# Metadata & JSON-LD Schema Optimization Implementation

**Last Updated:** January 6, 2026

This document describes the complete metadata and structured data architecture for AI Coding Stack.

---

## Overview

The metadata system consists of two integrated subsystems:

1. **Schema System** (`src/lib/metadata/schemas/`) - JSON-LD structured data generation
2. **Metadata System** (`src/lib/metadata/`) - Page metadata (title, description, OpenGraph, etc.)

Both systems are fully typed, validated, and optimized for SEO.

---

## 1. Schema System (`src/lib/metadata/schemas/`)

### Architecture

```
src/lib/metadata/schemas/
├── types.ts          # Schema.org type definitions
├── builders.ts       # Reusable schema builders
├── generators.ts     # High-level page-specific generators
├── validators.ts     # Schema validation utilities
└── index.ts          # Public API surface
```

### Supported Schema Types

| Type | Purpose |
|------|---------|
| Organization | Company/brand info |
| Person | Individual author info |
| SoftwareApplication | IDEs, CLIs, Extensions |
| Product | Models, commercial products |
| ItemList | Category list pages |
| BreadcrumbList | Navigation breadcrumbs |
| FAQPage | Frequently asked questions |
| Article | Blog posts, articles |
| WebSite | Site-wide search/identity |
| Offer | Pricing information |
| AggregateRating | Review ratings |

### Key Functions

```typescript
// Builders - Low-level schema construction
buildOrganizationSchema()
buildPersonSchema()
buildSoftwareApplicationSchema()
buildProductSchema()
buildItemListSchema()
buildBreadcrumbListSchema()
buildArticleSchema()
buildFAQPageSchema()
buildWebSiteSchema()

// Generators - High-level page schemas
generateRootOrganizationSchema()
generateWebSiteSchema()
generateFAQPageSchema()
generateSoftwareDetailSchema()
generateModelDetailSchema()
generateListPageSchema()
generateArticleSchema()
generateDocsSchema()
generateVendorSchema()

// Validators
validateSchema()
validateOrThrow()
validateAndLog()
```

**Full documentation:** See [SCHEMA-ARCHITECTURE.md](./SCHEMA-ARCHITECTURE.md)

---

## 2. Metadata System (`src/lib/metadata/`)

### Architecture

```
src/lib/metadata/
├── index.ts          # Public API exports
├── config.ts         # Site configuration, SEO defaults
├── templates.ts      # Metadata template functions
├── generators.ts     # High-level metadata generators
├── helpers.ts        # Helper functions
└── robots.ts         # Robots configuration
```

### Directory: `index.ts`

Main entry point exporting all metadata functionality:

```typescript
// Exports
export * from './config'
export * from './templates'
export * from './generators'
export * from './helpers'
export * from './robots'
export * from './schemas'
```

### Directory: `config.ts`

Site-wide configuration and SEO defaults:

```typescript
export const SITE_CONFIG = {
  name: 'AI Coding Stack',
  url: 'https://aicodingstack.io',
  twitter: {
    site: '@aicodingstack',
    creator: '@aicodingstack',
  },
  github: 'https://github.com/aicodingstack/aicodingstack.io',
}

export const METADATA_DEFAULTS = {
  siteName: 'AI Coding Stack',
  description: 'Comprehensive directory for AI coding tools...',
  currentYear: new Date().getFullYear(),
}
```

### Directory: `robots.ts`

Centralized robots configuration:

```typescript
export const DEFAULT_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

// Get robots by page type
export function getPageRobots(pageType: PageType): Metadata['robots']
```

### Directory: `templates.ts`

Metadata template functions:

```typescript
// Create base metadata structure
export function createBaseMetadata(...): Metadata

// Create page metadata with robots rules
export function createPageMetadata(...): Metadata

// Create root layout metadata
export function createRootLayoutMetadata(...): Metadata
```

### Directory: `helpers.ts`

Helper functions for building metadata components:

```typescript
// Build alternates (canonical + hreflang)
export function buildAlternates(...)

// Build OpenGraph metadata
export function buildOpenGraph(...)

// Build Twitter Card metadata
export function buildTwitterCard(...)

// BuildSEO-optimized titles
export function buildDetailPageTitle(...)
export function buildListPageTitle(...)

// Build descriptions
export function buildProductDescription(...)

// Build keywords
export function buildKeywords(...)

// Format utilities
export function formatPlatforms(...)
export function formatPriceForDescription(...)
```

### Directory: `generators.ts`

High-level metadata generators for different page types:

```typescript
// List pages (ides, clis, models, etc.)
export async function generateListPageMetadata(options: {
  locale: Locale
  category: Category
  translationNamespace: string
  additionalKeywords?: string[]
}): Promise<Metadata>

// Software product detail pages (ides, clis, extensions)
export async function generateSoftwareDetailMetadata(options: {
  locale: Locale
  category: Category
  slug: string
  product: { name, description, vendor, platforms?, pricing?, license? }
  typeDescription: string
}): Promise<Metadata>

// Model detail pages
export async function generateModelDetailMetadata(options: {
  locale: Locale
  slug: string
  model: { name, description, vendor, size?, contextWindow?, maxOutput?, tokenPricing? }
  translationNamespace: string
}): Promise<Metadata>

// Comparison pages
export async function generateComparisonMetadata(...)

// Article pages
export async function generateArticleMetadata(...)

// Documentation pages
export async function generateDocsMetadata(...)

// Static pages (home, manifesto, etc.)
export async function generateStaticPageMetadata(...)
```

---

## 3. Integration Patterns

### Root Layout

```typescript
// src/app/[locale]/layout.tsx
import { createRootLayoutMetadata } from '@/lib/metadata'
import { generateRootOrganizationSchema, generateWebSiteSchema } from '@/lib/metadata/schemas'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return createRootLayoutMetadata({
    locale,
    title: messages.site.title,
    description: messages.site.description,
    keywords: ['AI coding tools', 'AI IDE', 'AI CLI'].join(', '),
    canonical: locale === defaultLocale ? '/' : `/${locale}`,
    languageAlternates: buildLanguageAlternates(''),
    openGraph: {
      type: 'website',
      locale: mapLocaleToOG(locale),
      alternateLocale: locales.filter(l => l !== locale).map(mapLocaleToOG),
      // Images auto-detected from opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      // Images auto-detected from opengraph-image.tsx
    },
  })
}

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

### Detail Page (Software)

```typescript
// src/app/[locale]/ides/[slug]/page.tsx
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale, slug } = await params
  const ide = await getManifestEntry('ides', slug)

  return generateSoftwareDetailMetadata({
    locale,
    category: 'ides',
    slug: ide.slug,
    product: {
      name: ide.name,
      description: ide.description,
      vendor: ide.vendor,
      platforms: ide.platforms,
      pricing: ide.pricing,
      license: ide.license,
    },
    typeDescription: 'AI-Powered IDE',
  })
}

const schema = await generateSoftwareDetailSchema({
  product: ide,
  category: 'ides',
  locale,
})

return <><JsonLd data={schema} />{/* page content */}</>
```

### List Page

```typescript
// src/app/[locale]/ides/page.tsx
import { generateListPageSchema } from '@/lib/metadata/schemas'
import { generateListPageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params

  return generateListPageMetadata({
    locale,
    category: 'ides',
    translationNamespace: 'pages.ides',
  })
}

const schema = await generateListPageSchema({
  items: ides.map(ide => ({
    name: ide.name,
    url: `${baseUrl}/ides/${ide.slug}`,
    description: ide.description,
  })),
  itemName: 'IDEs',
  itemDescription: 'AI-powered code editors',
})

return <><JsonLd data={schema} />{/* page content */}</>
```

---

## 4. Features Implemented

### Canonical URLs
- ✅ Automatically generated for all pages
- ✅ Respects locale structure
- ✅ Consistent across all page types

### Language Alternates (hreflang)
- ✅ Generated for all locales (en, zh-Hans, de, ko)
- ✅ Based on canonical path

### OpenGraph
- ✅ Complete metadata for all pages
- ✅ Locale-aware og:locale
- ✅ Auto-detected images from `opengraph-image.tsx` files
- ✅ Article type for detail pages, website for others

### Twitter Cards
- ✅ Summary large image cards
- ✅ Auto-detected images from `opengraph-image.tsx` files
- ✅ Consistent with OpenGraph metadata

### Structured Data
- ✅ Organization schema on root layout
- ✅ WebSite schema with search action
- ✅ FAQPage schema on homepage
- ✅ SoftwareApplication schema for IDEs/CLIs/Extensions
- ✅ Product schema for Models
- ✅ BreadcrumbList schema on detail pages
- ✅ ItemList schema on list pages
- ✅ Article schema for articles/docs

### Robots Configuration
- ✅ Default robots with max-preview settings
- ✅ Page-type aware (no-index for search pages)
- ✅ Customizable per page

### Performance
- ✅ All generators use React `cache()`
- ✅ No duplicate data fetching
- ✅ Efficient schema building

---

## 5. Migration Status

### Schema Migration - COMPLETE ✅

| Page Type | Schema Generator | Status |
|-----------|------------------|--------|
| Root Layout | `generateRootOrganizationSchema`, `generateWebSiteSchema` | ✅ Done |
| Homepage | `generateFAQPageSchema` | ✅ Done |
| IDE Detail | `generateSoftwareDetailSchema` | ✅ Done |
| CLI Detail | `generateSoftwareDetailSchema` | ✅ Done |
| Extension Detail | `generateSoftwareDetailSchema` | ✅ Done |
| Model Detail | `generateModelDetailSchema` | ✅ Done |
| List Pages | `generateListPageSchema` | ✅ Done |
| Articles | `generateArticleSchema` | ✅ Done |
| Docs | `generateDocsSchema` | ✅ Done |
| Vendors | `generateVendorSchema` | ✅ Done |

### Metadata Migration - COMPLETE ✅

All pages use the new metadata generators:
- ✅ Root layout metadata generator
- ✅ List page metadata generator
- ✅ Software detail metadata generator
- ✅ Model detail metadata generator
- ✅ Article metadata generator
- ✅ Docs metadata generator
- ✅ Comparison metadata generator
- ✅ Static page metadata generator

---

## 6. Code Statistics

### Infrastructure Created

| Destination | Size |
|-------------|------|
| Schema types, builders, generators, validators | ~1,500 lines |
| Metadata config, templates, generators, helpers | ~1,200 lines |
| Total reusable infrastructure | ~2,700 lines |

### Code Reduction

| Page Type | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Root Layout | ~150 lines | ~75 lines | 50% |
| Detail Page Schema | ~40 lines | ~8 lines | 80% |
| Detail Page Metadata | ~30 lines | ~12 lines | 60% |

---

## 7. Benefits

### SEO Improvements
- ✅ Complete structured data on all pages
- ✅ Rich snippet eligibility
- ✅ Proper canonical URLs
- ✅ Language alternates for i18n
- ✅ Optimized robots directives
- ✅ Social media preview cards

### Developer Experience
- ✅ Type-safe throughout
- ✅ Single function call for complete metadata
- ✅ Consistent implementation across pages
- ✅ Easy to extend for new page types
- ✅ Validation in development mode

### Performance
- ✅ Cached data fetching
- ✅ No duplicate queries
- ✅ Efficient schema building

---

## 8. Usage Examples

### Add Metadata to New Page

```typescript
import { generateStaticPageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }): Promise<Metadata> {
  return generateStaticPageMetadata({
    locale: params.locale,
    basePath: 'new-page',
    title: 'New Page Title',
    description: 'Page description for SEO',
    keywords: 'keyword1, keyword2',
    ogType: 'website',
    pageType: 'static',
  })
}
```

### Custom Schema

```typescript
import { buildOrganizationSchema } from '@/lib/metadata/schemas'

const customOrgSchema = buildOrganizationSchema({
  name: 'My Company',
  url: 'https://example.com',
  description: 'Description here',
})
```

### Validate Schema

```typescript
import { validateAndLog } from '@/lib/metadata/schemas'

const schema = await generateSoftwareDetailSchema({ ... })
validateAndLog(schema, 'IDE Detail Page')
```

---

## 9. Testing & Validation

### Verification Steps

1. **Schema Validation**
```bash
npm run dev
# Check console for schema validation warnings
```

2. **Google Rich Results Test**
- https://search.google.com/test/rich-results

3. **Schema.org Validator**
- https://validator.schema.org/

4. **Search Console**
- https://search.google.com/search-console
- Monitor structured data coverage

---

## 10. References

- [SCHEMA-ARCHITECTURE.md](./SCHEMA-ARCHITECTURE.md) - Schema system documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

**Status**: Complete ✅
**Date**: January 6, 2026
