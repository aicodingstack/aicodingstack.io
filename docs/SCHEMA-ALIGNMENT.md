# Schema & TypeScript Type Alignment

**Last Updated:** January 6, 2026

This document tracks the alignment between JSON schema definitions in `manifests/$schemas/` and TypeScript types in `src/types/manifests.ts`.

---

## Overview

The manifest system uses **one-to-one correspondence** between:
- JSON schemas in `manifests/$schemas/` (validation and documentation)
- TypeScript types in `src/types/manifests.ts` (type safety and IDE support)

When modifying schema files, the corresponding TypeScript types **must be updated** to match.

---

## Schema Directory Structure

```
manifests/$schemas/
├── ref/                               # Reusable base schemas
│   ├── entity.schema.json             # Base entity (id, name, description)
│   ├── vendor-entity.schema.json      # Entity + vendor, docsUrl
│   ├── translations.schema.json       # i18n translations
│   ├── community-urls.schema.json     # Social/Community URLs
│   ├── platform-urls.schema.json      # Platform URLs (HuggingFace, etc.)
│   ├── product.schema.json            # Base product schema
│   └── app.schema.json                # Base app (product + platforms)
├── cli.schema.json                    # CLI tools
├── ide.schema.json                    # IDEs
├── extension.schema.json              # Extensions
├── model.schema.json                  # LLM Models
├── provider.schema.json               # API Providers
├── vendor.schema.json                 # Vendors
├── collections.schema.json            # Curated collections
└── github-stars.schema.json           # GitHub stars data
```

---

## Type Hierarchy

### Base Reference Types

```
entity.schema.json
    extends ManifestEntity ↴
        ↳ vendor-entity.schema.json extends ManifestVendorEntity
            ↳ product.schema.json extends ManifestBaseProduct
                ↳ app.schema.json extends ManifestBaseApp
                    └── [cli, ide].schema.json
```

### Product-Based Schemas (extend app.schema.json)

| Schema | TypeScript Type | Parent Type |
|--------|-----------------|-------------|
| cli.schema.json | `ManifestCLI` | `ManifestBaseApp` |
| ide.schema.json | `ManifestIDE` | `ManifestBaseApp` |
| extension.schema.json | `ManifestExtension` | `ManifestBaseProduct` |

### Independent Schemas

| Schema | TypeScript Type | Parent Type |
|--------|-----------------|-------------|
| model.schema.json | `ManifestModel` | `ManifestVendorEntity` |
| provider.schema.json | `ManifestProvider` | `ManifestVendorEntity` |
| vendor.schema.json | `ManifestVendor` | `ManifestEntity` |
| collections.schema.json | `ManifestCollections` | Independent |

---

## Type Alignment Status

### ✅ Aligned - Complete One-to-One Correspondence

| Schema File | TypeScript Type | Status |
|-------------|-----------------|--------|
| entity.schema.json | `ManifestEntity` | ✅ Aligned |
| vendor-entity.schema.json | `ManifestVendorEntity` | ✅ Aligned |
|Translations.schema.json | `ManifestTranslations` | ✅ Aligned |
| community-urls.schema.json | `ManifestCommunityUrls` | ✅ Aligned |
| platform-urls.schema.json | `ManifestPlatformUrls` | ✅ Aligned |
| product.schema.json | `ManifestBaseProduct` | ✅ Aligned |
| app.schema.json | `ManifestBaseApp` | ✅ Aligned |
| cli.schema.json | `ManifestCLI` | ✅ Aligned |
| ide.schema.json | `ManifestIDE` | ✅ Aligned |
| extension.schema.json | `ManifestExtension` | ✅ Aligned |
| model.schema.json | `ManifestModel` | ✅ Aligned |
| provider.schema.json | `ManifestProvider` | ✅ Aligned |
| vendor.schema.json | `ManifestVendor` | ✅ Aligned |
| collections.schema.json | `ManifestCollections` | ✅ Aligned |
| github-stars.schema.json | `ManifestGitHubStars` | ✅ Aligned |

---

## TypeScript Type Reference

### Base Types

```typescript
// manifests/$schemas/ref/entity.schema.json → ManifestEntity
export interface ManifestEntity {
  id: string
  name: string
  description: string
  translations: ManifestTranslations
  verified: boolean
  websiteUrl: string
}

// manifests/$schemas/ref/vendor-entity.schema.json → ManifestVendorEntity
export interface ManifestVendorEntity extends ManifestEntity {
  docsUrl: string | null
  vendor: string
}

// manifests/$schemas/ref/translations.schema.json → ManifestTranslations
export interface ManifestTranslations {
  [locale: string]: {
    name?: string
    title?: string
    description?: string
  }
}

// manifests/$schemas/ref/community-urls.schema.json → ManifestCommunityUrls
export interface ManifestCommunityUrls {
  linkedin: string | null
  twitter: string | null
  github: string | null
  youtube: string | null
  discord: string | null
  reddit: string | null
  blog: string | null
}

// manifests/$schemas/ref/platform-urls.schema.json → ManifestPlatformUrls
export interface ManifestPlatformUrls {
  huggingface: string | null
  artificialAnalysis: string | null
  openrouter: string | null
}
```

### Product Types

```typescript
// manifests/$schemas/ref/product.schema.json → ManifestBaseProduct
export interface ManifestBaseProduct extends ManifestVendorEntity {
  latestVersion: string
  githubUrl: string | null
  license: string
  pricing: ManifestPricingTier[]
  resourceUrls: ManifestResourceUrls
  communityUrls: ManifestCommunityUrls
  relatedProducts: ManifestRelatedProduct[]
}

// manifests/$schemas/ref/app.schema.json → ManifestBaseApp
export interface ManifestBaseApp extends ManifestBaseProduct {
  platforms: ManifestPlatformElement[]
  installCommand?: string | null
  launchCommand?: string | null
}

// manifests/$schemas/cli.schema.json → ManifestCLI
export interface ManifestCLI extends ManifestBaseApp {}

// manifests/$schemas/ide.schema.json → ManifestIDE
export interface ManifestIDE extends ManifestBaseApp {}

// manifests/$schemas/extension.schema.json → ManifestExtension
export interface ManifestExtension extends ManifestBaseProduct {
  supportedIdes: ManifestIDESupport[]
}
```

### Independent Types

```typescript
// manifests/$schemas/model.schema.json → ManifestModel
export interface ManifestModel extends ManifestVendorEntity {
  size: string
  contextWindow: number
  maxOutput: number
  tokenPricing: ManifestTokenPricing
  releaseDate: string | null
  inputModalities: ModelInputModality[]
  capabilities: ModelCapability[]
  benchmarks: ManifestBenchmarks
  platformUrls: ManifestPlatformUrls
}

// manifests/$schemas/provider.schema.json → ManifestProvider
export interface ManifestProvider extends ManifestVendorEntity {
  type: 'foundation-model-provider' | 'model-service-provider'
  applyKeyUrl: string | null
  platformUrls: ManifestPlatformUrls
  communityUrls: ManifestCommunityUrls
}

// manifests/$schemas/vendor.schema.json → ManifestVendor
export interface ManifestVendor extends ManifestEntity {
  communityUrls: ManifestCommunityUrls
}
```

### Collection Types

```typescript
// manifests/$schemas/collections.schema.json → ManifestCollections
export interface ManifestCollections {
  specifications: ManifestCollectionSection
  articles: ManifestCollectionSection
  tools: ManifestCollectionSection
  features: ManifestCollectionSection
}

export interface ManifestCollectionSection {
  title: string
  description: string
  translations: ManifestTranslations
  sections: ManifestCollectionSubSection[]
}

export interface ManifestCollectionSubSection {
  title: string
  translations: ManifestTranslations
  items: ManifestCollectionItem[]
}

export interface ManifestCollectionItem {
  name: string
  url: string
  description: string
  translations: ManifestTranslations
}
```

---

## Type Guards

Type guards are intentionally **not** defined in `src/types/manifests.ts` to keep it type-only.
If runtime guards are needed, define them in a separate module under `src/lib/` (or `src/types/guards/`)
so client components don't accidentally pull in runtime code when importing types.

---

## Utility Types

```typescript
// Array types for JSON file imports
export type ManifestCLIArray = ManifestCLI[]
export type ManifestIDEArray = ManifestIDE[]
export type ManifestExtensionArray = ManifestExtension[]
export type ManifestModelArray = ManifestModel[]
export type ManifestProviderArray = ManifestProvider[]
export type ManifestVendorArray = ManifestVendor[]

// Union types
export type ManifestProductType = ManifestIDE | ManifestCLI | ManifestExtension
export type ManifestEntityType = ManifestEntity | ManifestVendorEntity | ManifestVendor | ManifestProductType | ManifestModel | ManifestProvider
```

---

## Guidelines for Adding New Schemas

### 1. Create JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "allOf": [
    { "$ref": "./ref/vendor-entity.schema.json" },
    {
      "type": "object",
      "properties": {
        "customField": {
          "type": ["string", "null"],
          "description": "Custom field description"
        }
      }
    }
  ]
}
```

### 2. Add TypeScript Type

```typescript
// In src/types/manifests.ts
export interface ManifestNewType extends ManifestVendorEntity {
  customField: string | null
}
```

### 3. Update Utility Types (if needed)

```typescript
export type ManifestNewTypeArray = ManifestNewType[]
export type ManifestUnionType = ManifestNewType | ManifestExistingType
```

### 4. Update Type Guards (if needed)

```typescript
export function isManifestNewType(obj: unknown): obj is ManifestNewType {
  return isManifestVendorEntity(obj) && 'customField' in obj
}
```

---

## Schema Validation

The project includes JSON schema validation tests:

```bash
npm test -- manifests.schema.test
```

This validates all manifest JSON files against their schemas in `manifests/$schemas/`.

---

## Common Patterns

### Nullable Fields

All optional fields use the `["string", "null"]` pattern for flexibility:

```json
"docsUrl": {
  "type": ["string", "null"],
  "format": "uri"
}
```

```typescript
export interface ManifestVendorEntity extends ManifestEntity {
  docsUrl: string | null
}
```

### Localized Fields

Use the `translations` object for i18n support:

```json
"translations": {
  "en": { "name": "Cursor" },
  "zh-Hans": { "name": "Cursor 编辑器" }
}
```

### Platform Lists

Use arrays for platform-specific data:

```json
"platforms": [
  { "os": "macOS", "installPath": "cursor" },
  { "os": "Windows", "installPath": "cursor.exe" }
]
```

---

## Migration Notes

When updating schemas:

1. ✅ **Always update corresponding TypeScript type in `src/types/manifests.ts`**
2. ✅ **Use nullable types `null` for optional fields**
3. ✅ **Add index signatures for extensibility**
4. ✅ **Run validation tests after changes**
5. ✅ **Update this document if the hierarchy changes**

---

## Validation Commands

```bash
# Validate all manifests against schemas
npm run test:validate

# Check TypeScript types
npm run type-check

# Lint manifest JSON files
npm run biome:check
```

---

**Status**: All schemas and types are fully aligned ✅
**Last Verified**: January 6, 2026
