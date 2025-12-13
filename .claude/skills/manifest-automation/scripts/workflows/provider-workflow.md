# Provider Manifest Workflow

This workflow guides you through creating or updating a Provider manifest with focus on provider type detection and API access.

## Required Fields (from provider.schema.json)

**Entity fields**: `id`, `name`, `description`, `i18n`, `websiteUrl`, `docsUrl`, `verified`

**Vendor-entity fields**: `vendor`, `githubUrl` (nullable)

**Provider-specific fields:**
- `type`: "foundation-model-provider" or "model-service-provider"
- `applyKeyUrl`: URL to get API keys (nullable)
- `platformUrls`: {huggingface, artificialAnalysis, openrouter}
- `communityUrls`: Standard social media links

## Phase 1: Core Information

Follow standard entity extraction:
- `name`, `description`, `vendor`, `websiteUrl`, `docsUrl`

## Phase 2: Provider Type Detection (Playwright)

**Goal**: Determine if foundation or service provider

1. **Navigate to main website and model listings**:
   - Look for "Models", "API", "Products" pages
   - Take snapshot

2. **Analyze content to determine type**:

   **Foundation Model Provider** (`foundation-model-provider`):
   - Develops and trains their own models
   - Language like: "Our Models", "Developed by us", "Claude", "GPT", "Gemini"
   - Model names branded with company name
   - Examples: Anthropic (Claude), OpenAI (GPT), Google (Gemini)

   **Model Service Provider** (`model-service-provider`):
   - Aggregates models from multiple providers
   - Language like: "Available Models", "Supported Models", "Choose from..."
   - Lists models from various companies
   - Examples: OpenRouter, Together AI, Replicate

3. **Look for model listings**:
   - If listing only own models → `foundation-model-provider`
   - If listing models from multiple providers → `model-service-provider`

4. **Edge cases**:
   - Some providers do both (e.g., offer own models + others)
   - Classify by primary business model
   - If unclear, prefer `model-service-provider`

## Phase 3: API Access Discovery (Playwright)

**Goal**: Find where users get API keys

1. **Navigate to API documentation**:
   - Look for "API", "Developers", "Get Started", "API Keys"
   - Common URLs: `/api`, `/developers`, `/docs/api`, `/console`

2. **Find API key application/generation page**:
   - **applyKeyUrl**: Where users go to get API keys
   - Common patterns:
     - `/console/api-keys`
     - `/account/api-keys`
     - `/dashboard/api-keys`
     - `/settings/api`
   - Some providers: Sign up page where key is issued
   - Some providers: "Contact Sales" (mark as TODO)

3. **Extract API documentation URL** (docsUrl):
   - Technical API documentation
   - Common patterns: `/docs`, `/api/reference`, `/developers/docs`

4. **Retry strategy**:
   - **Attempt 1**: Navigate from homepage → Developers/API
   - **Attempt 2**: Direct URL patterns (`/console`, `/api-keys`, `/dashboard`)
   - **Attempt 3**: WebSearch `"<provider> api key"`
   - **TODO**: Set null if behind authentication wall

## Phase 4: Platform URLs (WebSearch)

**Goal**: Find provider on third-party platforms

Same as Model workflow Phase 4:

1. **HuggingFace**: `https://huggingface.co/<org>`
2. **Artificial Analysis**: If they benchmark this provider's models
3. **OpenRouter**: If this provider's models available there

Set each to null if not applicable.

## Phase 5: Community URLs (WebSearch + Playwright)

Follow CLI workflow Phase 6:
- Check website footer for social links
- Use WebSearch for missing platforms
- Extract: linkedin, twitter, github, youtube, discord, reddit, blog

## Phase 6: GitHub (Optional)

Many providers don't have public GitHub:
- Foundation providers: May have SDKs, libraries, tools
- Service providers: May have client libraries

Set to null if not applicable.

## Phase 7: Generate Manifest

```json
{
  "$schema": "../$schemas/provider.schema.json",
  "id": "<name>",
  "name": "<Official Name>",
  "description": "<Max 200 chars>",
  "i18n": {},
  "websiteUrl": "<https://...>",
  "docsUrl": "<https://...>",
  "verified": false,
  "vendor": "<Company Name>",
  "githubUrl": "<https://github.com/... or null>",
  "type": "foundation-model-provider" or "model-service-provider",
  "applyKeyUrl": "<https://... or null>",
  "platformUrls": {
    "huggingface": "<url or null>",
    "artificialAnalysis": "<url or null>",
    "openrouter": "<url or null>"
  },
  "communityUrls": {
    "linkedin": "<url or null>",
    "twitter": "<url or null>",
    "github": "<url or null>",
    "youtube": "<url or null>",
    "discord": "<url or null>",
    "reddit": "<url or null>",
    "blog": "<url or null>"
  }
}
```

## Phase 8: Validation

Run validation:
```bash
npm run test:validate
```

## Provider Type Examples

### Foundation Model Providers
- Anthropic (Claude models)
- OpenAI (GPT models)
- Google (Gemini models)
- Meta (Llama models)
- Mistral AI (Mistral models)

### Model Service Providers
- OpenRouter (aggregates many providers)
- Together AI (hosts various models)
- Replicate (runs open source models)
- Hugging Face Inference (serves community models)

## Common Patterns

### API Key URLs
- SaaS dashboard: `/console/api-keys`, `/dashboard/keys`
- Account settings: `/account/api`, `/settings/api`
- Direct signup: `/signup` (for providers that issue keys on signup)
- Enterprise: "Contact Sales" (set to null, add TODO)

### Type Indicators
- Foundation: "powered by [our model]", "we developed", "our research"
- Service: "access to", "choose from", "100+ models", "various providers"

## Key Differences from Other Types

- No installation, pricing tiers, or technical specs
- Focus on provider type and API access
- Community URLs more important (developer relations)
- Platform URLs focus on where provider is mentioned/integrated
- Many providers have no public GitHub
