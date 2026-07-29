# Schema Refactoring Summary

**Status:** ✅ Complete
**Updated:** January 6, 2026

## Overview

This document summarizes the schema refactoring work done to improve the design of manifest JSON schemas, following DRY (Don't Repeat Yourself) principles and ensuring proper inheritance relationships.

## Changes Implemented

### 1. Fixed i18n Schema Duplication ✅

**Problem**: `collections.schema.json` was redefining its own translations structure instead of reusing the standard `translations.schema.json`.

**Solution**:
- Made `translations.schema.json` more flexible by removing the `required` constraint on `description`
- Updated `collections.schema.json` to reference `./ref/translations.schema.json` instead of inline definitions
- Both `collectionCard` and `collectionItem` now use the standard i18n schema

### 2. Resolved pricing Field Semantic Conflict ✅

**Problem**: The `pricing` field had different meanings:
- In `product.schema.json`: Array of pricing tiers (for products)
- In `models.schema.json`: Object with token pricing (input/output/cache)

**Solution**:
- Renamed `pricing` to `tokenPricing` in `models.schema.json`
- Updated all references in `models.json` data file
- Updated React components that display model pricing (`models/[slug]/page.tsx`, `models/page.tsx`)

### 3. Unified additionalProperties Strategy ✅

**Problem**: `entity.schema.json` used `additionalProperties: true` while other schemas used `unevaluatedProperties: false`, creating inconsistency.

**Solution**:
- Removed `additionalProperties: true` from `entity.schema.json`
- All schemas now consistently use `unevaluatedProperties: false` at the top level

### 4. Refactored Inheritance Hierarchy to Eliminate Field Duplication ✅

**Problem**: Multiple schemas were duplicating field definitions:
- `githubStars`, `githubUrl` repeated across schemas
- `latestVersion` duplicated in multiple places

**Solution**:
- Created new `vendor-entity.schema.json` as an intermediate schema
  - Extends `entity.schema.json`
  - Adds: `vendor` (only field at this level)
  - Only `vendor` is required
  
- Moved product-specific fields to appropriate schemas:
  - `product.schema.json` defines: `latestVersion`, `githubUrl`, `githubStars` (all required, nullable where applicable)
  - `models.schema.json` defines its own: `latestVersion`, `githubUrl`, `githubStars` (all nullable, not required)
  - `providers.schema.json` defines its own: `latestVersion` (nullable), `githubUrl`, `githubStars` (nullable but required)
  
- Updated schema hierarchy:
  ```
  entity.schema.json
    └── vendor-entity.schema.json
          ├── product.schema.json
          │     ├── app.schema.json
          │     │     ├── clis.schema.json
          │     │     ├── ides.schema.json
          │     │     └── terminals.schema.json
          │     └── extensions.schema.json
          ├── models.schema.json
          ├── providers.schema.json
  ```

- Each schema now only defines fields specific to its type
- MCPs require `githubUrl` and `githubStars` (since all integration servers should be open source)
- Providers require `githubUrl` and `githubStars` but allow null values
- Products (CLIs/IDEs/Terminals) require `latestVersion` via `product.schema.json`
- Models and providers override `latestVersion` to be nullable (versions are less applicable)

### 5. Activated relatedProducts Feature ✅

**Problem**: `relatedProducts` was defined in `$defs` but never used in properties.

**Solution**:
- Added `relatedProducts` to `product.schema.json` properties
- Added `relatedProducts` to `app.schema.json` for proper inheritance with `unevaluatedProperties` 
- Migrated IDE `cli` field to `relatedProducts` structure
  - vscode: `cli: "code"` → `relatedProducts: [{"type": "cli", "productId": "code"}]`
  - cursor: `cli: "cursor-agent"` → `relatedProducts: [{"type": "cli", "productId": "cursor-agent"}]`
  - droid: `cli: "factory"` → `relatedProducts: [{"type": "cli", "productId": "factory"}]`
  - zed: `cli: "zed"` → `relatedProducts: [{"type": "cli", "productId": "zed"}]`
  - intellij-idea: `cli: "idea"` → `relatedProducts: [{"type": "cli", "productId": "idea"}]`
- Removed standalone `cli` field from `app.schema.json`
- Added empty `relatedProducts: []` to all products without related products

### 6. Unified Application Schema Usage ✅

**Problem**: `clis.schema.json` and `ides.schema.json` directly inherited `product.schema.json`, missing the `platforms` field that applications need.

**Solution**:
- Updated `clis.schema.json` and `ides.schema.json` to inherit from `app.schema.json` instead
- Added top-level `installCommand` and `launchCommand` as optional fields (legacy support, prefer platform-specific values)
- Added `relatedProducts` support to `app.schema.json`

### 7. Schema Loading Order ✅

**Note**: The validation tests in `tests/validate/` load `vendor-entity.schema.json` in the correct order (after `entity`, before `product`)

## Benefits

1. **Reduced Duplication**: Field definitions are now centralized in base schemas
2. **Improved Maintainability**: Changes to common fields only need to be made once
3. **Better Type Safety**: More consistent validation rules across all manifests
4. **Clearer Semantics**: Field names now accurately reflect their purpose (e.g., `tokenPricing` vs `pricing`)
5. **Flexible Inheritance**: Schemas can override inherited fields when needed (e.g., MCPs making GitHub fields required)

## Validation Results

All manifest files now pass validation:
- ✅ clis.json (18 items)
- ✅ ides.json (11 items)
- ✅ terminals.json (8 items)
- ✅ extensions.json (10 items)
- ✅ providers.json (5 items)
- ✅ models.json (5 items)
- ✅ collections.json
- ✅ vendors.json (11 items)

## Files Modified

### Schema Files
- `manifests/$schemas/ref/entity.schema.json`
- `manifests/$schemas/ref/vendor-entity.schema.json` (NEW)
- `manifests/$schemas/ref/product.schema.json`
- `manifests/$schemas/ref/app.schema.json`
- `manifests/$schemas/ref/translations.schema.json`
- `manifests/$schemas/clis.schema.json`
- `manifests/$schemas/ides.schema.json`
- `manifests/$schemas/models.schema.json`
- `manifests/$schemas/providers.schema.json`
- `manifests/$schemas/collections.schema.json`

### Data Files
- `manifests/models.json` (renamed `pricing` → `tokenPricing`)
- `manifests/providers.json` (added `githubUrl` and `githubStars`)
- `manifests/ides.json` (migrated `cli` → `relatedProducts`, added `githubUrl`)
- `manifests/clis.json` (added `relatedProducts: []`, added `githubUrl`)
- `manifests/terminals.json` (added `relatedProducts: []`, added `githubUrl`)
- `manifests/extensions.json` (added `relatedProducts: []`, added `githubUrl`)

### Code Files
- `src/app/[locale]models/[slug]/page.tsx`
- `src/app/[locale]models/page.tsx`

## Recommendations for Future

1. **Consistent Naming**: Always use descriptive field names that reflect the specific use case
2. **Schema Composition**: Prefer composition over duplication - create reusable schema fragments
3. **Documentation**: Keep this summary updated when making future schema changes
4. **Validation**: Always run `pnpm test:validate` before committing schema changes

