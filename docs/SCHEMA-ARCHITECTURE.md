# Schema Architecture Documentation

## Schema Inheritance Hierarchy

```
entity.schema.json (Base Entity)
├── Fields: id, name, description, i18n, websiteUrl, docsUrl, verified
├── Required: all
│
├── vendor-entity.schema.json
│   ├── Adds: vendor
│   ├── Required: vendor
│   │
│   ├── product.schema.json (Products: CLIs, IDEs, Terminals, Extensions)
│   │   ├── Adds: latestVersion, githubUrl, githubStars, license, pricing, resourceUrls, communityUrls, relatedProducts
│   │   ├── Required: latestVersion, githubUrl, githubStars, license, pricing, resourceUrls, communityUrls
│   │   │
│   │   ├── app.schema.json (Applications)
│   │   │   ├── Adds: platforms, installCommand, launchCommand
│   │   │   ├── Required: platforms
│   │   │   │
│   │   │   ├── clis.schema.json
│   │   │   │   └── No additional fields
│   │   │   │
│   │   │   ├── ides.schema.json
│   │   │   │   └── No additional fields
│   │   │   │
│   │   │   └── terminals.schema.json
│   │   │       └── No additional fields
│   │   │
│   │   └── extensions.schema.json
│   │       ├── Adds: supportedIdes
│   │       └── Required: supportedIdes
│   │
│   ├── models.schema.json (AI Models)
│   │   ├── Adds: latestVersion (nullable), githubUrl (nullable), githubStars (nullable)
│   │   │        size, contextWindow, maxOutput, tokenPricing, platformUrls
│   │   └── Required: size, contextWindow, maxOutput, tokenPricing, platformUrls
│   │
│   ├── providers.schema.json (Model Providers)
│   │   ├── Adds: latestVersion (nullable), githubUrl (nullable, required), githubStars (nullable, required)
│   │   │        type, applyKeyUrl, platformUrls, communityUrls
│   │   └── Required: githubUrl, githubStars, type, applyKeyUrl, platformUrls, communityUrls
│   │
│       ├── Adds: latestVersion, githubUrl, githubStars, runtime, command
│       └── Required: latestVersion, githubUrl, githubStars, runtime, command
│
└── vendors.schema.json (Vendors)
    ├── Adds: communityUrls
    └── Required: communityUrls

collections.schema.json (Independent)
└── No inheritance - standalone schema for curated collections
```

## Base Schemas (ref/)

### entity.schema.json
**Purpose**: Core fields shared by all entities (products, models, providers, vendors, etc.)

**Fields**:
- `id` (string, pattern: `^[a-z0-9-]+$`): Unique identifier
- `name` (string): Official name
- `description` (string, maxLength: 200): Concise description
- `translations` (object, → translations.schema.json): Translations
- `websiteUrl` (string, uri, https): Official website
- `docsUrl` (string/null, uri, https): Documentation URL
- `verified` (boolean): Verification status

**Required**: All fields

---

### vendor-entity.schema.json
**Purpose**: Minimal extension adding vendor information

**Extends**: entity.schema.json

**Additional Fields**:
- `vendor` (string): Company or organization name

**Required**: `vendor`

**Note**: This schema ONLY adds the `vendor` field. All other version/GitHub fields are defined by subschemas based on their specific needs.

---

### product.schema.json
**Purpose**: Base schema for installable products (CLIs, IDEs, Terminals, Extensions)

**Extends**: vendor-entity.schema.json

**Additional Fields**:
- `latestVersion` (string): Product version (required, non-null)
- `githubUrl` (string/null, uri, github.com): GitHub repository (nullable)
- `githubStars` (number/null, ≥0): Star count (nullable)
- `license` (string): SPDX identifier or "Proprietary"
- `pricing` (array, minItems: 1): Pricing tiers (→ pricingTier)
- `resourceUrls` (object, → resourceUrls): Product resources
- `communityUrls` (object, → community-urls.schema.json): Community links
- `relatedProducts` (array, → relatedProducts): Related products

**Required**: `latestVersion`, `githubUrl`, `githubStars`, `license`, `pricing`, `resourceUrls`, `communityUrls`

**Definitions**:
- `pricingTier`: name, value, currency, per, category
- `resourceUrls`: download, changelog, pricing, mcp, issue
- `relatedProducts`: type (ide/cli/extension), productId

---

### app.schema.json
**Purpose**: Schema for applications (CLIs, IDEs, Terminals)

**Extends**: product.schema.json

**Additional Fields**:
- `platforms` (array, minItems: 1): Platform-specific details
  - `os` (enum: macOS/Windows/Linux)
  - `installPath` (string/null)
  - `installCommand` (string/null)
  - `launchCommand` (string/null)
- `installCommand` (string/null): Top-level install command (optional, legacy)
- `launchCommand` (string/null): Top-level launch command (optional, legacy)

**Required**: `platforms`

**Inherited**: `relatedProducts` (from product.schema.json)

---

## Product Schemas

### clis.schema.json
**Type**: object  
**Extends**: app.schema.json  
**Additional**: None

### ides.schema.json
**Type**: object  
**Extends**: app.schema.json  
**Additional**: None

### terminals.schema.json
**Type**: object  
**Extends**: app.schema.json  
**Additional**: None

### extensions.schema.json
**Type**: object  
**Extends**: product.schema.json  
**Additional**:
- `supportedIdes` (array, minItems: 1): IDE support information
  - `ideId` (string): IDE identifier
  - `marketplaceUrl` (string/null, uri)
  - `installCommand` (string/null)
  - `installUri` (string/null, uri)

**Required**: `supportedIdes`

---

## Entity Schemas (Arrays)

### models.schema.json
**Type**: array  
**Extends**: vendor-entity.schema.json

**Additional Fields**:
- `latestVersion` (string/null): Version (optional)
- `githubUrl` (string/null, uri, github.com): Repository (optional)
- `githubStars` (number/null, ≥0): Stars (optional)
- `size` (string): Parameter size (e.g., "7B", "200B")
- `contextWindow` (number): Context window in tokens (e.g., 128000)
- `maxOutput` (number): Max output tokens (e.g., 4096)
- `tokenPricing` (object): API pricing
  - `input` (string): Input pricing
  - `output` (string): Output pricing
  - `cache` (string/null): Cache pricing
- `platformUrls` (object, → platform-urls.schema.json): Third-party platforms

**Required**: `size`, `contextWindow`, `maxOutput`, `tokenPricing`, `platformUrls`

---

### providers.schema.json
**Type**: array  
**Extends**: vendor-entity.schema.json

**Additional Fields**:
- `latestVersion` (string/null): Version (optional)
- `githubUrl` (string/null, uri, github.com): Repository (required but nullable)
- `githubStars` (number/null, ≥0): Stars (required but nullable)
- `type` (enum): "foundation-model-provider" or "model-service-provider"
- `applyKeyUrl` (string/null, uri): API key application URL
- `platformUrls` (object, → platform-urls.schema.json): Third-party platforms
- `communityUrls` (object, → community-urls.schema.json): Community links

**Required**: `githubUrl`, `githubStars`, `type`, `applyKeyUrl`, `platformUrls`, `communityUrls`

---

**Type**: array  
**Extends**: vendor-entity.schema.json

**Additional Fields**:
- `latestVersion` (string): Version (required, non-null)
- `githubUrl` (string, uri, github.com): Repository (required, non-null)
- `githubStars` (number, ≥0): Stars (required, non-null)
- `runtime` (enum): "Node.js", "Python", "Docker", "Other"
- `command` (string): Command to run the integration server

**Required**: `latestVersion`, `githubUrl`, `githubStars`, `runtime`, `command`

---

### vendors.schema.json
**Type**: array  
**Extends**: entity.schema.json (NOT vendor-entity)

**Additional Fields**:
- `communityUrls` (object, → community-urls.schema.json): Community links

**Required**: `communityUrls`

---

### collections.schema.json
**Type**: object  
**Extends**: None (independent schema)

**Structure**:
- `specifications`, `articles`, `tools` (collectionSection)
  - `title`, `description`, `translations` (→ translations.schema.json), `cards`
  - Cards contain: `title`, `translations`, `items`
  - Items contain: `name`, `url`, `description`, `translations`

---

## Supporting Schemas (ref/)

### translations.schema.json
**Purpose**: Internationalization translations

**Pattern**: `^[a-z]{2}(-[A-Z][a-z]+)?$` (e.g., `zh-Hans`, `en`)

**Fields per locale**:
- `name` (string, maxLength: 100): Translated name
- `title` (string, maxLength: 100): Translated title  
- `description` (string, maxLength: 200): Translated description

**Required per locale**: None (flexible - use what's needed)

---

### community-urls.schema.json
**Purpose**: Social media and community presence URLs

**Fields** (all string/null, uri, https):
- `linkedin`: LinkedIn company page
- `twitter`: Twitter/X profile
- `github`: GitHub organization
- `youtube`: YouTube channel
- `discord`: Discord server
- `reddit`: Reddit community
- `blog`: Official blog

**Required**: All fields (allows explicit null)

---

### platform-urls.schema.json
**Purpose**: Third-party platform URLs (for models/providers)

**Fields** (all string/null, uri):
- `huggingface`: HuggingFace page (pattern: `^https://huggingface\\.co/`)
- `artificialAnalysis`: Artificial Analysis page (pattern: `^https://artificialanalysis\\.ai/`)
- `openrouter`: OpenRouter page (pattern: `^https://openrouter\\.ai/`)

**Required**: All fields (allows explicit null)

---

## Key Design Principles

### 1. DRY (Don't Repeat Yourself)
- Common fields defined once in base schemas
- Subschemas only define their specific fields
- `vendor-entity.schema.json` is minimal (only `vendor`)
- Version/GitHub fields defined in each subschema based on needs

### 2. Flexible Inheritance
- Child schemas can override parent field types
- Example: `latestVersion` is string in product, but nullable in models/providers

### 3. Type Safety
- Strict validation with `unevaluatedProperties: false`
- All fields explicitly defined
- Nullable fields use `["string", "null"]` pattern

### 4. Semantic Clarity
- Field names match their purpose (`tokenPricing` vs `pricing`)
- `blog` in `communityUrls` (not `resourceUrls`)
- `relatedProducts` in `product.schema.json` (not duplicated)

### 5. Consistent Patterns
- All URL fields: `["string", "null"]`, format: "uri", pattern: "^https://"
- All required fields with nullable type explicitly allow null values
- Enum fields used for controlled vocabularies

---

## Field Requirement Strategy

| Schema Level | latestVersion | githubUrl | githubStars | Rationale |
|-------------|---------------|-----------|-------------|-----------|
| **vendor-entity** | ❌ Not defined | ❌ Not defined | ❌ Not defined | Minimal base |
| **product** | ✅ Required | ✅ Required (nullable) | ✅ Required (nullable) | Products have versions |
| **models** | ⚪ Optional (nullable) | ⚪ Optional (nullable) | ⚪ Optional (nullable) | Models don't have traditional versions |
| **providers** | ⚪ Optional (nullable) | ✅ Required (nullable) | ✅ Required (nullable) | Some providers have GitHub |

---

## Data Structure Summary

### Products (object type)
- **clis.json**: Array of CLI objects
- **ides.json**: Array of IDE objects
- **terminals.json**: Array of terminal objects
- **extensions.json**: Array of extension objects

### Entities (array type)
- **models.json**: Array of model objects
- **providers.json**: Array of provider objects
- **vendors.json**: Array of vendor objects

### Collections (object type)
- **collections.json**: Single object with specifications, articles, tools sections

---

## Breaking Changes From Refactoring

1. **pricing → tokenPricing** (models only)
   - Avoids semantic conflict with product pricing
   - Models use token-based pricing

2. **cli → relatedProducts** (IDEs)
   - String field converted to structured array
   - Supports multiple related products of different types

3. **blog field moved** (all products)
   - From `resourceUrls.blog` to `communityUrls.blog`
   - Blog is community content, not a product resource

4. **New required fields**:
   - All products: `githubUrl`, `githubStars`, `relatedProducts`
   - Providers: `githubUrl`, `githubStars`
   - communityUrls: `blog`

---

## Validation

All schemas use JSON Schema Draft 2020-12 with strict mode:
- `unevaluatedProperties: false` on top-level schemas
- `additionalProperties: false` on nested definitions
- Format and pattern validation for URLs
- Enum validation for controlled vocabularies

**Validation Command**: `npm run test:validate`

**Current Status**: ✅ All 9 manifest files validated successfully
