# Model Manifest Workflow

This workflow guides you through creating or updating a Model manifest with focus on technical specifications and pricing.

## Required Fields (from model.schema.json)

**Entity fields**: `id`, `name`, `description`, `i18n`, `websiteUrl`, `docsUrl`, `verified`

**Vendor-entity fields**: `vendor`, `githubUrl` (nullable)

**Model-specific fields:**
- `size`: Parameter count (e.g., "7B", "32B", "200B", "Unknown")
- `contextWindow`: Context window in tokens (e.g., 32000, 128000, 200000)
- `maxOutput`: Max output tokens (e.g., 4096, 8192, 16384)
- `tokenPricing`: {input, output, cache} in $/million tokens
- `platformUrls`: {huggingface, artificialAnalysis, openrouter}

## Phase 1: Core Information

Follow standard entity extraction:
- `name`, `description`, `vendor`, `websiteUrl`, `docsUrl`

## Phase 2: Model Specifications (Playwright)

**Goal**: Extract technical specifications

1. **Navigate to model page or docs**:
   - Look for model card, specs page, or API documentation
   - Common URLs: `/models/<name>`, `/docs/models/<name>`, `/api/models`

   **Official Model Documentation** (Primary Reference Sources):
   - **OpenAI**: https://platform.openai.com/docs/models
   - **Anthropic**: https://platform.claude.com/docs/en/about-claude/models/overview
   - **Google**: https://deepmind.google/models/model-cards
   - **xAI**: https://docs.x.ai/docs/models
   - **Alibaba Qwen**: https://qwen.ai/apiplatform
   - **DeepSeek**: https://api-docs.deepseek.com/quick_start/pricing

2. **Extract specifications**:

   **Size (parameter count)**:
   - Look for: "7 billion parameters", "7B", "32B", "200B"
   - Extract number + unit: "7B", "13B", "32B", "70B", "200B"
   - If multiple variants, use the base model size
   - Use "Unknown" if not disclosed

   **Total Context (context window)**:
   - Look for: "context length", "context window", "token limit"
   - Extract in thousands: "32K", "64K", "128K", "200K"
   - Common values: "8K", "16K", "32K", "128K", "200K"
   - Pattern: number + "K"

   **Max Output (output tokens)**:
   - Look for: "max output tokens", "output length limit"
   - Extract in thousands: "4K", "8K", "16K"
   - Often smaller than context window
   - Pattern: number + "K"

3. **Common locations for specs**:
   - Model card (HuggingFace, official website)
   - Technical specifications page
   - API documentation
   - Announcement blog post
   - GitHub repository README

4. **Retry strategy**:
   - **Attempt 1**: Official model page/docs
   - **Attempt 2**: Announcement blog or GitHub
   - **Attempt 3**: Third-party platforms (HuggingFace, Artificial Analysis)
   - **TODO**: Mark "Unknown" if not found

## Phase 3: Token Pricing (Playwright)

**Goal**: Extract pricing per million tokens

1. **Navigate to pricing or API pricing page**:
   - Common URLs: `/pricing`, `/api/pricing`, `/docs/pricing`

2. **Extract token pricing**:
   - Look for pricing tables or calculators
   - Extract per-million-token pricing:
     - **input**: Price for 1M input tokens ($/M)
     - **output**: Price for 1M output tokens ($/M)
     - **cache**: Price for 1M cache read tokens ($/M) - nullable if not supported

3. **Handle unit conversions**:
   - If pricing shown per 1K tokens:
     - Multiply by 1000 to get $/M
     - Example: $0.0005/1K = $0.50/M
   - Normalize all values to $/M format
   - Use numbers, not strings (e.g., 0.50, not "0.50")

4. **Examples**:
```json
{
  "tokenPricing": {
    "input": 0.25,
    "output": 1.25,
    "cache": 0.025
  }
}
```

5. **Retry strategy**:
   - **Attempt 1**: Official pricing page
   - **Attempt 2**: API documentation
   - **Attempt 3**: Third-party platforms (OpenRouter, Artificial Analysis)
   - **TODO**: Mark null if behind "Contact Sales"

## Phase 4: Platform URLs (WebSearch)

**Goal**: Find model on third-party platforms

### HuggingFace

1. **Search**: `"huggingface <vendor>/<model-name>"` or `site:huggingface.co <model-name>`
2. **Navigate** to result (Playwright)
3. **Validate**:
   - URL pattern: `https://huggingface.co/<org>/<model>`
   - Verify it's the correct model (not similar name)
   - Check model card matches vendor and specs
4. **Extract**: Full HuggingFace URL
5. **Set to null** if not found after 3 attempts

### Artificial Analysis

1. **Search**: `"artificial analysis <model-name>"` or `site:artificialanalysis.ai <model-name>`
2. **Navigate** to artificialanalysis.ai
3. **Find model** in their benchmarks/comparisons
4. **Extract**: URL (e.g., `https://artificialanalysis.ai/models/<model-slug>`)
5. **Set to null** if not found

### OpenRouter

1. **Search**: `"openrouter <model-name>"` or `"openrouter <vendor>/<model>"`
2. **Navigate** to openrouter.ai
3. **Find model** in their model list
4. **Extract**: Model page URL
5. **Set to null** if not available

### Wikipedia (Verification Only)

1. **Search**: `site:wikipedia.org <model-name>` or `"<model-name> wikipedia"`
2. **Use for cross-referencing**:
   - Verify model specifications (parameter count, context window)
   - Cross-check release dates and version history
   - Validate vendor/company information
3. **DO NOT store Wikipedia URL** - use only for verification
4. **Common use cases**:
   - Confirming specs for popular models (GPT-4, Claude, Gemini)
   - Validating version numbers and release timeline
   - Cross-referencing pricing history

**Final structure**:
```json
{
  "platformUrls": {
    "huggingface": "<url or null>",
    "artificialAnalysis": "<url or null>",
    "openrouter": "<url or null>"
  }
}
```

## Phase 5: GitHub (Optional)

**Goal**: Find model repository if available

1. **Many models don't have public GitHub repos**:
   - Proprietary models: Set `githubUrl` to null
   - Open source models: Follow GitHub discovery from CLI workflow

2. **If searching**:
   - Use WebSearch: `"<vendor> <model> github"`
   - Look for model weights, inference code, or official repo
   - Validate it's official (from vendor org)

## Phase 6: Generate Manifest

```json
{
  "$schema": "../$schemas/model.schema.json",
  "id": "<name>",
  "name": "<Official Model Name>",
  "description": "<Max 200 chars>",
  "i18n": {},
  "websiteUrl": "<https://...>",
  "docsUrl": "<https://... or null>",
  "verified": false,
  "vendor": "<Company Name>",
  "githubUrl": "<https://github.com/... or null>",
  "size": "<7B|32B|200B|Unknown>",
  "contextWindow": "<32000|128000|200000>",
  "maxOutput": "<4096|8192|16384>",
  "tokenPricing": {
    "input": 0.25,
    "output": 1.25,
    "cache": 0.025
  },
  "platformUrls": {
    "huggingface": "<url or null>",
    "artificialAnalysis": "<url or null>",
    "openrouter": "<url or null>"
  }
}
```

## Phase 7: Validation

Run validation:
```bash
npm run test:validate
```

## Common Patterns

### Size Notations
- Billion: "7B", "13B", "32B", "70B", "200B"
- Million: "350M", "1.5B"
- Trillion: "1T" (rare)
- Unknown: "Unknown" (for proprietary models)

### Context Window Sizes
- Small: "4K", "8K", "16K"
- Medium: "32K", "64K", "128K"
- Large: "200K", "1M" (million)

### Pricing Patterns
- Input usually cheaper than output (2-5x difference)
- Cache usually 10x cheaper than input
- Free models: Set all to 0
- Unreleased models: null

## Key Differences from CLI/Extension

- No installation commands or marketplace URLs
- Focus on technical specs and pricing
- Platform URLs for discoverability
- GitHub is optional (many proprietary models)
- Pricing is per-token, not subscription tiers
- Size/context/output are string values with units
