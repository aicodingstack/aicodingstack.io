# CLI Manifest Workflow

This workflow guides you through creating or updating a CLI manifest using advanced web automation.

## Required Fields (from cli.schema.json)

**Entity fields:**
- `id`, `name`, `description`, `i18n`, `websiteUrl`, `docsUrl`, `verified`

**Product fields:**
- `vendor`, `latestVersion`, `githubUrl`, `license`, `pricing`, `resourceUrls`, `communityUrls`, `relatedProducts`

**App fields:**
- `platforms` (array of {os, installPath, installCommand, launchCommand})

## Phase 1: Core Information (Playwright)

**Goal**: Extract basic information from the main website

1. Navigate to the provided website URL using `mcp__playwright__browser_navigate`

2. Take a page snapshot using `mcp__playwright__browser_snapshot`

3. Extract from the homepage:
   - **name**: Official product name (from header, hero, or title)
   - **description**: Max 200 chars from hero section or tagline
   - **vendor**: Company/organization name (from footer or about)

4. Find documentation link:
   - Look for "Docs", "Documentation", "API", "Guides" in navigation
   - Extract **docsUrl** (should start with https://)
   - Common patterns: `/docs`, `/documentation`, `docs.example.com`

5. Track attempt #1 for these fields using FieldTracker

## Phase 2: Installation Discovery (Playwright + WebSearch)

**Goal**: Find platform-specific installation commands

1. **Navigate to installation page**:
   - Look for "Install", "Download", "Get Started" links
   - Common URLs: `/install`, `/download`, `/getting-started`, `/docs/installation`
   - Use Playwright to navigate and take snapshot

2. **Extract install commands from page**:
   - Look for code blocks with install commands
   - Detect OS tabs or sections (macOS, Windows, Linux)
   - Extract for each platform:
     - **os**: "macos", "windows", "linux", "web"
     - **installCommand**: Full command (e.g., `brew install cursor-cli`)
     - **installPath**: Installation directory (if mentioned)
     - **launchCommand**: How to run the CLI (e.g., `cursor-cli`)

3. **Common install patterns**:
   - **macOS**: `brew install <name>`, `curl | sh`
   - **Windows**: `winget install <name>`, `choco install <name>`, `scoop install <name>`
   - **Linux**: `apt install <name>`, `npm install -g <name>`, `cargo install <name>`
   - **Cross-platform**: `npm install -g <name>`, `pip install <name>`

4. **Fallback (if not found - attempt #2)**:
   - Use WebSearch: `"homebrew <product-name>"`
   - Use WebSearch: `"<product-name> install command"`
   - Check brew.sh or npmjs.com directly
   - Navigate to GitHub README (see Phase 3)

5. **Final fallback (attempt #3)**:
   - Check package manager sites:
     - npm: `https://www.npmjs.com/package/<name>`
     - PyPI: `https://pypi.org/project/<name>/`
     - Homebrew: `https://formulae.brew.sh/formula/<name>`
   - Mark as TODO if still missing

## Phase 3: Version & GitHub (WebSearch + Playwright)

**Goal**: Find GitHub repository, latest version, and license

1. **Find GitHub repository**:
   - Use WebSearch: `"<product-name> github repository"`
   - Look for links in website footer
   - Common patterns: `github.com/<org>/<repo>`
   - Validate format: `https://github.com/<owner>/<repo>`

2. **Navigate to GitHub repository** (Playwright):
   - Use `mcp__playwright__browser_navigate` to GitHub URL
   - Take snapshot

3. **Extract from GitHub**:
   - **latestVersion**: From releases page or tags
     - Navigate to `/releases` or look for "Latest release" section
     - Extract version tag (e.g., "v1.2.0", "1.2.0")
   - **license**: From repository header (top right)
     - Look for license badge or "License" section
     - Extract SPDX identifier (MIT, Apache-2.0, GPL-3.0, etc.)
     - If proprietary/unclear, mark as "Proprietary"
   - **resourceUrls.issue**: Issues URL
     - Format: `https://github.com/<owner>/<repo>/issues`

4. **Fallback strategies (attempts 2-3)**:
   - Check alternative org names or repo names
   - Look for GitLab, Gitea, or other git hosting
   - Check website source code comments for repo link
   - Mark as TODO if unavailable

## Phase 4: Pricing Discovery (Playwright)

**Goal**: Extract pricing tiers and details

1. **Navigate to pricing page**:
   - Look for "Pricing", "Plans", "Buy" links in navigation
   - Common URLs: `/pricing`, `/plans`, `/subscribe`, `/buy`
   - Use Playwright to navigate

2. **Extract pricing tiers**:
   - Look for pricing cards, tables, or sections
   - For each tier extract:
     - **name**: Tier name (e.g., "Free", "Pro", "Enterprise")
     - **value**: Price as number (0 for free)
     - **currency**: "USD" (or appropriate currency code)
     - **per**: Billing period ("month", "year", "once", "user")
     - **category**: "Individual", "Team", "Enterprise"

3. **Handle dynamic pricing**:
   - If pricing calculator present:
     - Use `mcp__playwright__browser_fill_form` or `mcp__playwright__browser_click` to interact
     - Extract calculated prices
   - If multiple currencies available:
     - Prefer USD for consistency

4. **For free/open-source tools**:
   - Create single tier:
     ```json
     [{
       "name": "Free",
       "value": 0,
       "currency": "USD",
       "per": "forever",
       "category": "Individual"
     }]
     ```

5. **Fallback strategies (attempts 2-3)**:
   - Check footer links for pricing
   - Search documentation for pricing mentions
   - Look for "Contact Sales" (mark Enterprise pricing as TODO)
   - Mark as TODO if behind contact form

## Phase 5: Resource URLs (Playwright + WebSearch)

**Goal**: Find download, changelog, and pricing URLs

1. **Download URL** (`resourceUrls.download`):
   - Look for "Download", "Releases" page
   - Common patterns: `/download`, `/releases`, GitHub releases page
   - Should be direct download or download page URL

2. **Changelog URL** (`resourceUrls.changelog`):
   - Look for "Changelog", "Release Notes", "What's New"
   - Common patterns: `/changelog`, `/releases`, `/blog/releases`, `CHANGELOG.md`
   - GitHub: `https://github.com/<owner>/<repo>/releases`

3. **Pricing URL** (`resourceUrls.pricing`):
   - From Phase 4, the pricing page URL
   - Set to null if free/open-source with no pricing page

4. **MCP URL** (`resourceUrls.mcp`):
   - Only if CLI is an MCP server
   - Look for "MCP", "Model Context Protocol" in docs
   - Link to MCP documentation or configuration
   - Set to null if not MCP-related

## Phase 6: Community URLs (WebSearch + Playwright)

**Goal**: Find official social media and community links

1. **Check website footer** (Playwright):
   - Take snapshot of page
   - Look for social media icons/links in footer
   - Extract URLs for: LinkedIn, Twitter/X, GitHub, YouTube, Discord, Reddit, Blog

2. **Use WebSearch for missing platforms**:
   - **LinkedIn**: Search `"<product> official linkedin"`
     - Validate pattern: `linkedin.com/company/` or `linkedin.com/in/`
   - **Twitter/X**: Search `"<product> official twitter"` or `"<product> official x"`
     - Validate pattern: `twitter.com/` or `x.com/`
   - **GitHub**: From Phase 3 (organization URL)
     - Pattern: `github.com/<org>`
   - **YouTube**: Search `"<product> official youtube"`
     - Validate pattern: `youtube.com/@`, `youtube.com/c/`, `youtube.com/channel/`
   - **Discord**: Search `"<product> official discord"`
     - Validate pattern: `discord.gg/` or `discord.com/invite/`
   - **Reddit**: Search `"<product> subreddit"`
     - Validate pattern: `reddit.com/r/`
   - **Blog**: Look for `/blog` on website or `blog.example.com`

3. **Validation**:
   - Verify URLs are official (not fan-made)
   - Check account names match product/vendor
   - Set to null if not found after 3 attempts

4. **Set communityUrls**:
   ```json
   {
     "linkedin": "<url or null>",
     "twitter": "<url or null>",
     "github": "<url or null>",
     "youtube": "<url or null>",
     "discord": "<url or null>",
     "reddit": "<url or null>",
     "blog": "<url or null>"
   }
   ```

## Phase 7: Generate Manifest

**Goal**: Create complete manifest JSON

1. **Compile all extracted data** into manifest structure:

```json
{
  "$schema": "../$schemas/cli.schema.json",
  "id": "<name>",
  "name": "<Official Name>",
  "description": "<Max 200 chars from website>",
  "i18n": {},
  "websiteUrl": "<https://...>",
  "docsUrl": "<https://... or null>",
  "verified": false,
  "vendor": "<Company Name>",
  "latestVersion": "<v1.2.0>",
  "githubUrl": "<https://github.com/...>",
  "license": "<SPDX or Proprietary>",
  "pricing": [...],
  "resourceUrls": {
    "download": "<url or null>",
    "changelog": "<url or null>",
    "pricing": "<url or null>",
    "mcp": "<url or null>",
    "issue": "<https://github.com/.../issues>"
  },
  "communityUrls": {...},
  "relatedProducts": [],
  "platforms": [
    {
      "os": "macos",
      "installPath": "<path or null>",
      "installCommand": "<command>",
      "launchCommand": "<command>"
    },
    ...
  ]
}
```

2. **Add TODO comments** for failed fields (using FieldTracker):
   - Generate TODO comment for each field with 3 failed attempts
   - Include reason for failure

3. **Write manifest file** to output path

4. **Generate completion report** using FieldTracker:
   - Show success/failure counts
   - List TODO fields
   - Provide next steps

## Phase 8: Validation

**Goal**: Ensure manifest is valid

1. **Run schema validation**:
   ```bash
   pnpm test:validate
   ```

2. **Fix any validation errors**:
   - Required fields missing
   - Invalid URL formats
   - Invalid enum values (os, pricing categories)

3. **Output final report** with:
   - Validation status
   - Fields needing manual review
   - Completion percentage

## Retry Strategy Summary

| Field | Attempt 1 | Attempt 2 | Attempt 3 |
|-------|-----------|-----------|-----------|
| Install Commands | Docs page | WebSearch packages | Package manager sites |
| GitHub URL | WebSearch | Footer links | Source code comments |
| Version | GitHub releases | Download page | Changelog |
| Pricing | Pricing page | Footer/header nav | Docs mention |
| Community URLs | Footer | WebSearch official | Common patterns |

## Common Pitfalls

- Don't extract descriptions from meta tags - use visible hero/tagline text
- Don't guess version numbers - extract from authoritative source
- Don't assume install commands - verify from official docs
- Don't include unofficial social media accounts
- Don't create pricing tiers without explicit price information
