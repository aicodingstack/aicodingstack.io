# GitHub Stars Fetcher

**Last Updated:** January 6, 2026

This document describes the GitHub stars fetching system for AI Coding Stack.

---

## Overview

The GitHub Stars Fetcher fetches star counts from the GitHub API for all projects in the manifest files and creates a centralized `github-stars.json` data file.

**Implementation**: `scripts/fetch/fetch-github-stars.mjs`
**Output**: `manifests/github-stars.json`

---

## Schema

The stars data follows `manifests/$schemas/github-stars.schema.json`:

```typescript
interface ManifestGitHubStars {
  extensions: { [productId: string]: number | null }
  clis: { [productId: string]: number | null }
  ides: { [productId: string]: number | null }
}
```

---

## Usage

### Fetch Stars with GitHub Token (Recommended)

```bash
GITHUB_TOKEN=your_github_token_here npm run generate
```

### Fetch Stars Without Token (Rate Limited)

```bash
npm run generate
```

### Direct Script Execution

```bash
node scripts/fetch/index.mjs github-stars
```

---

## Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name (e.g., "acs-stars-fetcher")
4. Scopes: `public_repo` (or none for public repos only)
5. Click **Generate token**
6. Copy the token and use it as `GITHUB_TOKEN` environment variable

---

## Rate Limits

| Authentication | Requests | Time Period |
|----------------|----------|-------------|
| With token | 5,000 | 1 hour |
| Without token | 60 | 1 hour |

**Recommendation**: Always use a GitHub token to avoid rate limiting.

---

## How It Works

### 1. Data Sources

The script fetches GitHub URLs from these files:

| Category | File | URL Field |
|----------|------|-----------|
| Extensions | `manifests/extensions/*.json` | `communityUrls.github` |
| CLIs | `manifests/clis/*.json` | `communityUrls.github` |
| IDEs | `manifests/ides/*.json` | `communityUrls.github` |
| Models | `manifests/models/*.json` | `communityUrls.github` |

### 2. Processing Steps

For each project:

1. Extract GitHub URL from `communityUrls.github` field
2. Parse owner/repo from URL (e.g., `microsoft/playwright`)
3. Fetch star count from GitHub API: `GET /repos/:owner/:repo/stargazers`
4. Store raw star count (number)
5. Write to `manifests/github-stars.json`

### 3. Output Format

```json
{
  "extensions": {
    "playwright": 90450,
    "context7": 2150,
    "claude-code": 5420
  },
  "clis": {
    "github-copilot-cli": 3450,
    "codex-cli": 1230
  },
  "ides": {
    "cursor": 42000
  }
}
```

---

## Display Format

When displaying stars on the site, they are formatted with a helper function:

```typescript
// Formats: 42000 → "42k", 1500 → "1.5k", 150 → "150"
function formatStars(stars: number | null): string
```

This is separate from the stored format (raw numbers).

---

## Usage in Components

### Import Stars Data

```typescript
import { githubStars } from '@/lib/generated/github-stars'

// Get stars for an IDE
const cursorStars = githubStars.ides['cursor'] // Returns number or null

// Display formatted
const displayStars = formatStars(cursorStars) // "42k"
```

### ProductHero Component

```typescript
import { githubStars } from '@/lib/generated/github-stars'

<ProductHero
  name={ide.name}
  description={ide.description}
  githubStars={githubStars.ides[ide.id] ?? 0}
/>
```

---

## Files Involved

| Category | File | Purpose |
|----------|------|---------|
| Script | `scripts/fetch/fetch-github-stars.mjs` | Fetch implementation |
| Entry | `scripts/fetch/index.mjs` | Category runner |
| Output | `manifests/github-stars.json` | Stars data |
| Type | `src/types/manifests.ts` | `ManifestGitHubStars` interface |
| Import | `src/lib/generated/github-stars.ts` | Typed import |
| Schema | `manifests/$schemas/github-stars.schema.json` | Validation |

---

## Integration with Build Process

The GitHub stars data is automatically generated as part of the build:

```bash
npm run generate  # Includes star fetching
npm run dev       # Generate + start dev server
npm run build     # Generate + build for production
```

---

## Updating Stars

To update star counts after changes to manifests:

```bash
# Single update
npm run generate

# Force rebuild
rm manifests/github-stars.json && npm run generate
```

---

## Error Handling

The script handles:

1. **Missing GitHub URLs**: Skips products without `communityUrls.github`
2. **Private Repos**: Sets value to `null` for access errors
3. **API Errors**: Logs error and continues
4. **Rate Limits**: Logs warning and returns cached/empty data

---

## Example Output

```
🚀 Starting GitHub stars fetcher...

✅ Using GitHub token for authentication

  🔍 Fetching stars for Playwright (microsoft/playwright)...
  ✅ Updated Playwright: 90450 stars
  🔍 Fetching stars for Context7 (upstash/context7)...
  ✅ Updated Context7: 2150 stars

==================================================
🎉 All files processed!
==================================================

✅ Written to manifests/github-stars.json
```

---

**Related Files:**
- `src/lib/landscape-data.ts` - Uses stars for sorting
- `src/components/product/ProductHero.tsx` - Displays stars on product pages
- `src/app/[locale]/ides/comparison/page.client.tsx` - Comparison rankings

**Last Updated:** January 6, 2026
