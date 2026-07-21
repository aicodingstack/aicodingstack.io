# Vendor Manifest Workflow

This workflow guides you through creating or updating a Vendor manifest - the simplest manifest type.

## Required Fields (from vendor.schema.json)

**Entity fields**:
- `id`, `name`, `description`, `i18n`, `websiteUrl`, `docsUrl`, `verified`

**Vendor fields**:
- `communityUrls`: {linkedin, twitter, github, youtube, discord, reddit, blog}

## Phase 1: Core Information (Playwright)

1. **Navigate to vendor website**:
   - Use `mcp__playwright__browser_navigate`
   - Take snapshot with `mcp__playwright__browser_snapshot`

2. **Extract from homepage**:
   - **name**: Official company/organization name
   - **description**: Company tagline or mission statement (max 200 chars)
     - Look in hero section, about section, or meta description
     - Focus on what the company does, not specific products

3. **Find documentation**:
   - **docsUrl**: Developer documentation or general docs
   - Common patterns: `/docs`, `/developers`, `/documentation`
   - Set to null if no documentation hub exists

## Phase 2: Community URLs (WebSearch + Playwright)

**Goal**: Find all official social media and community links

1. **Check website footer** (Playwright):
   - Look for social media icons/links
   - Extract available URLs

2. **Use WebSearch for missing platforms**:

   **LinkedIn** (Company page):
   - Search: `"<company> linkedin company"` or `site:linkedin.com/company <company>`
   - Pattern: `linkedin.com/company/<company-name>`
   - Prefer company page over individual profiles
   - Validate: Check company name, logo, and official verification
   - **Critical**: LinkedIn is often the most authoritative source for company information

   **Twitter/X**:
   - Search: `"<company> official twitter"` or `site:x.com <company>`
   - Pattern: `twitter.com/<handle>` or `x.com/<handle>`
   - Validate: Check verification badge (blue/gold checkmark)

   **GitHub** (Organization):
   - Search: `"<company> github"` or `site:github.com <company>`
   - Pattern: `github.com/<org-name>`
   - Prefer organization page, not specific repos

   **YouTube** (Channel):
   - Search: `"<company> official youtube"` or `site:youtube.com <company>`
   - Pattern: `youtube.com/@<name>`, `youtube.com/c/<name>`, or `youtube.com/channel/<id>`

   **Discord**:
   - Search: `"<company> official discord"`
   - Pattern: `discord.gg/<invite>` or `discord.com/invite/<invite>`

   **Reddit** (Subreddit):
   - Search: `"<company> official subreddit"` or `site:reddit.com/r <company>`
   - Pattern: `reddit.com/r/<subreddit>`

   **Blog**:
   - Look for `/blog` on main website or `blog.<domain>.com`
   - Can also be Medium, Substack, or other platforms

3. **Validation**:
   - Verify accounts are official (check verification badges, content)
   - Ensure consistent branding with company
   - Set to null if not found after 3 attempts

4. **Additional Data Sources**:

   **Wikipedia**:
   - Use for verifying company information (founding date, headquarters, description)
   - Search: `site:wikipedia.org <company>`
   - Pattern: `en.wikipedia.org/wiki/<Company_Name>`
   - **Do NOT store Wikipedia URL in manifest** - use only for verification
   - Cross-reference: Company description, official name, social media links

   **LinkedIn Company Page**:
   - Beyond just the URL, extract additional context:
     - Company size and industry
     - Official company description (cross-reference with website)
     - Verify headquarters location
   - Use as authoritative source for company metadata

## Phase 3: Generate Manifest

```json
{
  "$schema": "../$schemas/vendor.schema.json",
  "id": "<lowercase-company-name>",
  "name": "<Official Company Name>",
  "description": "<Company mission or tagline, max 200 chars>",
  "i18n": {},
  "websiteUrl": "<https://company.com>",
  "docsUrl": "<https://docs.company.com or null>",
  "verified": false,
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

## Phase 4: Validation

Run validation:
```bash
npm run test:validate
```

## Examples

### Example 1: Software Company
```json
{
  "id": "anthropic",
  "name": "Anthropic",
  "description": "AI safety company building reliable, interpretable, and steerable AI systems",
  "websiteUrl": "https://anthropic.com",
  "docsUrl": "https://docs.anthropic.com",
  "communityUrls": {
    "linkedin": "https://linkedin.com/company/anthropic-ai",
    "twitter": "https://x.com/AnthropicAI",
    "github": "https://github.com/anthropics",
    "youtube": "https://youtube.com/@AnthropicAI",
    "discord": null,
    "reddit": null,
    "blog": "https://anthropic.com/news"
  }
}
```

### Example 2: Open Source Organization
```json
{
  "id": "linux-foundation",
  "name": "Linux Foundation",
  "description": "Nonprofit organization enabling mass innovation through open source technology support",
  "websiteUrl": "https://linuxfoundation.org",
  "docsUrl": null,
  "communityUrls": {
    "linkedin": "https://linkedin.com/company/the-linux-foundation",
    "twitter": "https://twitter.com/linuxfoundation",
    "github": "https://github.com/linuxfoundation",
    "youtube": "https://youtube.com/user/TheLinuxFoundation",
    "discord": null,
    "reddit": null,
    "blog": "https://linuxfoundation.org/blog"
  }
}
```

## Key Points

- **Simplest manifest type** - no product-specific fields
- **Company-level information** - not about specific products
- **Description focuses on company mission** - not individual product features
- **docsUrl is often null** - many companies don't have general docs, only product docs
- **Community URLs are critical** - main differentiator from minimal entity fields
- **GitHub is organization page** - not individual repos
- **Wikipedia for verification** - cross-reference data but don't store URL
- **LinkedIn as authoritative source** - use for validating company metadata

## Common Pitfalls

- Don't include product-specific information in description
- Don't link to specific product docs for docsUrl (use company-level docs or null)
- Don't include employee/founder personal social accounts (only official company accounts)
- Don't guess social media handles - verify they exist and are official
- Don't store Wikipedia URLs in manifest - use only for verification
- Don't trust unverified LinkedIn profiles - only use official company pages
