# Schema Alignment Recommendations

## Overview

This document outlines the inconsistencies found across various schema definitions and provides recommendations for better alignment.

## Base Info Schema

Created `manifests/$schemas/ref/entity.schema.json` to define the absolute minimum fields that ALL entities should have:

- `id` - Unique identifier
- `name` - Official name
- `description` - Concise description (max 200 chars)
- `i18n` - Internationalization support
- `websiteUrl` - Official website
- `docsUrl` - Documentation URL (nullable)

## Current Schema Structure

### Schema Hierarchy

```
entity.schema.json (NEW - minimal core fields)
  ↓
product.schema.json (products like CLI, IDE, Terminal)
  ↓
specific schemas (clis.schema.json, ides.schema.json, etc.)
```

### Entity Types

1. **Product-based** (use base-product):
   - CLIs
   - IDEs
   - Terminals
   - Extensions

2. **Service-based** (independent schemas):
   - Models
   - Providers
   - MCPs
   - Vendors

## Identified Inconsistencies

### 1. Documentation URL Field

**Issue**: `docsUrl` handling is inconsistent

| Schema | docsUrl Status | Current Definition |
|--------|---------------|-------------------|
| base-product | Optional (nullable) | `["string", "null"]` |
| models | Missing | N/A |
| providers | Required | `string` (non-null) |
| vendors | Missing | N/A |

**Recommendation**: 
- Make `docsUrl` **optional (nullable)** across all schemas
- Include it in all entity types
- Use `["string", "null"]` format consistently

```json
"docsUrl": {
  "type": ["string", "null"],
  "format": "uri",
  "pattern": "^https://",
  "description": "Documentation URL (null if not available)"
}
```

### 2. Pricing Field Format

**Issue**: Inconsistent pricing format

| Schema | Format | Example |
|--------|--------|---------|
| base-product | Array of objects | `[{name, value, currency, per, category}]` |
| models | String | `"$0.002/1K tokens"` |
| providers | Not included | N/A |

**Recommendation**:
- For **models**: Change to structured format or add a separate `pricingDetails` object
- Consider adding `pricingUrl` field to point to detailed pricing pages

**Proposed structure for models**:
```json
"pricing": {
  "type": "object",
  "properties": {
    "input": {
      "type": ["string", "null"],
      "description": "Input token pricing (e.g., '$0.002/1K tokens')"
    },
    "output": {
      "type": ["string", "null"],
      "description": "Output token pricing (e.g., '$0.006/1K tokens')"
    },
    "display": {
      "type": ["string", "null"],
      "description": "Human-readable pricing summary"
    }
  }
}
```

### 3. GitHub Integration

**Issue**: GitHub-related fields are inconsistent

| Schema | githubStars | githubUrl | Approach |
|--------|------------|-----------|----------|
| base-product | ✓ (nullable) | Via communityUrls | Indirect |
| models | ✗ Missing | ✗ Missing | None |
| providers | ✗ Missing | Via communityUrls | Indirect |
| vendors | ✗ Missing | Via communityUrls | Indirect |

**Recommendation**:
- Add `githubStars` field (nullable) to **all schemas**
- Keep direct `githubUrl` in MCPs (makes sense for open source projects)
- Use `communityUrls.github` for others

### 4. Community URLs

**Issue**: Not consistently included

| Schema | Has communityUrls |
|--------|------------------|
| base-product | ✓ |
| models | ✗ |
| providers | ✓ |
| vendors | ✓ |

**Recommendation**:
- Add `communityUrls` to **models** schema
- Make it a standard field in `entity.schema.json` (but keep as additionalProperties: true)

### 5. Platform/Page URLs Naming

**Issue**: Inconsistent naming conventions

| Schema | Field Name | Purpose |
|--------|-----------|---------|
| base-product | `resourceUrls` | Internal product pages (download, changelog, pricing, etc.) |
| models | `platformUrls` | Third-party platform pages (Claude.ai, ChatGPT, etc.) |
| providers | `platformUrls` | Third-party platform pages |

**Recommendation**:
- Keep both as separate concepts:
  - `resourceUrls` - Official pages (download, changelog, pricing, blog, mcp, issue)
  - `platformUrls` - Third-party platforms where product is available
- Consider renaming `platformUrls` → `availableOn` for clarity
- Add `resourceUrls` to models/providers if they have relevant pages

### 6. Vendor Reference

**Issue**: Vendor linking is inconsistent

| Schema | Vendor Field | Format |
|--------|-------------|--------|
| base-product | `vendor` | String (name) |
| models | `vendor` | String (name) |
| providers | `vendor` | String (ID reference) |

**Recommendation**:
- Standardize on **both fields**:
  - `vendor` - Display name (string)
  - `vendor` - Reference ID (for data relations)
- Update all schemas to include both
- Make `vendor` required where vendor relationship is important

### 7. License Information

**Issue**: License field missing in several schemas

| Schema | Has License |
|--------|------------|
| base-product | ✓ |
| models | ✗ |
| providers | ✗ |
| vendors | ✗ |

**Recommendation**:
- Add `license` field to **models** (some are open-source)
- Optional for providers and vendors

### 8. Version Tracking

**Issue**: Version field naming inconsistent

| Schema | Field Name | Type |
|--------|-----------|------|
| base-product | `latestVersion` | `["string", "null"]` |
| models | Missing | N/A |

**Recommendation**:
- Add `latestVersion` to models (some have version numbers like GPT-4)
- Consider adding `releaseDate` field for version tracking

## Implementation Priority

### High Priority (Breaking Inconsistencies)

1. ✅ Create `entity.schema.json`
2. 🔴 Standardize `docsUrl` as nullable across all schemas
3. 🔴 Add `vendor` to all schemas that reference vendors
4. 🔴 Restructure models `pricing` field

### Medium Priority (Missing Features)

6. 🟡 Add `githubStars` to models and providers

### Low Priority (Nice to Have)

8. 🟢 Add `latestVersion` to models
9. 🟢 Rename `platformUrls` for clarity
10. 🟢 Add `releaseDate` field for version tracking

## Proposed Updated Schemas

### Models Schema Update

```json
{
  "properties": {
    "id": "...",
    "name": "...",
    "vendor": "...",
    "vendor": {
      "type": "string",
      "description": "Reference to vendor ID in vendors.json"
    },
    "license": {
      "type": ["string", "null"],
      "description": "License (e.g., 'MIT', 'Apache-2.0', 'Proprietary')"
    },
    "size": "...",
    "contextWindow": "...",
    "maxOutput": "...",
    "pricing": {
      "type": "object",
      "properties": {
        "input": {"type": ["string", "null"]},
        "output": {"type": ["string", "null"]},
        "display": {"type": ["string", "null"]}
      }
    },
    "websiteUrl": "...",
    "docsUrl": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "githubStars": {
      "type": ["number", "null"],
      "minimum": 0
    },
    "latestVersion": {
      "type": ["string", "null"]
    },
    "platformUrls": "...",
    "communityUrls": {
      "$ref": "./ref/community-urls.schema.json"
    }
  }
}
```

### Providers Schema Update

```json
{
  "properties": {
    "id": "...",
    "name": "...",
    "vendor": {
      "type": "string",
      "description": "Vendor display name"
    },
    "vendor": "...",
    "docsUrl": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "githubStars": {
      "type": ["number", "null"],
      "minimum": 0
    },
    "communityUrls": "..."
  }
}
```

### MCPs Schema Update

```json
{
  "properties": {
    "id": "...",
    "name": "...",
    "vendor": "...",
    "vendor": {
      "type": ["string", "null"],
      "description": "Reference to vendor ID in vendors.json (if applicable)"
    },
    "license": {
      "type": ["string", "null"],
      "description": "License identifier"
    },
    "communityUrls": {
      "$ref": "./ref/community-urls.schema.json"
    },
    "docsUrl": "...",
    "githubUrl": "...",
    "githubStars": "..."
  }
}
```

## Migration Strategy

1. **Phase 1**: Create entity.schema.json ✅
2. **Phase 2**: Update existing data files to match new schemas
3. **Phase 3**: Update validation scripts
4. **Phase 4**: Update UI components to handle new fields
5. **Phase 5**: Deprecate old field formats with warnings

## Testing Checklist

- [ ] Validate all existing JSON files against updated schemas
- [ ] Test backward compatibility with existing data
- [ ] Update TypeScript types
- [ ] Update documentation
- [ ] Test UI rendering with new fields
- [ ] Run full validation suite

## Notes

- All changes should maintain backward compatibility where possible
- Use nullable types (`["string", "null"]`) for optional fields
- Document migration path for breaking changes
- Consider versioning schemas if breaking changes are necessary

