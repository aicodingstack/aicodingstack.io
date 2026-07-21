# Extension Manifest Workflow

This workflow guides you through creating or updating an Extension manifest with focus on IDE marketplace integration.

## Required Fields (from extension.schema.json)

**Entity + Product fields**: Same as CLI workflow

**Extension-specific fields:**
- `supportedIdes` (array of {ideId, marketplaceUrl, installUri})

## Phase 1: Core Information

Follow **Phase 1** from CLI workflow to extract:
- `name`, `description`, `vendor`, `docsUrl`

## Phase 2: Marketplace Discovery (WebSearch + Playwright)

**Goal**: Find marketplace listings and extract IDs

### VS Code Marketplace

1. **Search for extension**:
   - Use WebSearch: `"vscode marketplace <extension-name>"`
   - Or navigate directly if URL known

2. **Navigate to marketplace** (Playwright):
   - URL pattern: `https://marketplace.visualstudio.com/items?itemName=<publisher>.<extension>`
   - Take snapshot

3. **Extract information**:
   - **Publisher name**: From page header
   - **Extension ID**: From URL (format: `publisher.extensionId`)
   - **Latest version**: From marketplace page
   - **marketplaceUrl**: Current URL
   - **installUri**: Construct as `vscode:extension/<publisher>.<extensionId>`

4. **Also create for Cursor** (compatible with VS Code extensions):
   - Same marketplaceUrl
   - **installUri**: `cursor:extension/<publisher>.<extensionId>`

### JetBrains Plugins

1. **Search**: `"jetbrains plugins <extension-name>"`

2. **Navigate to plugins.jetbrains.com**:
   - Extract plugin ID from URL
   - Extract marketplace URL
   - **installUri**: `jetbrains://idea/plugin/<plugin-id>` (if available)

3. **Add to supportedIdes** with ideId: `jetbrains`

### Open VSX (for other IDEs)

1. **Search**: `"open vsx <extension-name>"`

2. **Check compatibility with**:
   - Windsurf (ideId: `windsurf`)
   - Trae (ideId: `trae`)
   - Zed (ideId: `zed`)

3. **Extract**:
   - marketplaceUrl from Open VSX
   - Construct appropriate installUri if supported

### Retry Strategy

- **Attempt 1**: Direct marketplace navigation
- **Attempt 2**: WebSearch with alternative names
- **Attempt 3**: Check extension website for marketplace links
- **TODO**: Mark as missing if not found

## Phase 3: Supported IDEs Detection

**Goal**: Build complete supportedIdes array

1. **Check marketplace compatibility**:
   - VS Code Marketplace: "Compatible with VS Code X.X.X"
   - Look for supported IDE versions

2. **Map to enum values**:
   - VS Code → `vscode`
   - Cursor → `cursor` (if VS Code compatible)
   - Windsurf → `windsurf`
   - Trae → `trae`
   - Zed → `zed`
   - JetBrains → `jetbrains`

3. **Build supportedIdes array**:
```json
{
  "supportedIdes": [
    {
      "ideId": "vscode",
      "marketplaceUrl": "https://marketplace.visualstudio.com/items?itemName=...",
      "installUri": "vscode:extension/..."
    },
    {
      "ideId": "cursor",
      "marketplaceUrl": "https://marketplace.visualstudio.com/items?itemName=...",
      "installUri": "cursor:extension/..."
    },
    {
      "ideId": "jetbrains",
      "marketplaceUrl": "https://plugins.jetbrains.com/plugin/...",
      "installUri": null
    }
  ]
}
```

## Phase 4: GitHub & Version

Follow **Phase 3** from CLI workflow:
- Find GitHub repository
- Extract latest version (from releases or marketplace)
- Extract license
- Get issue tracker URL

## Phase 5: Pricing

Follow **Phase 4** from CLI workflow:
- Most extensions are free
- Some have paid tiers (Pro, Enterprise)
- Extract from extension website or marketplace

## Phase 6: Resource URLs

1. **Download**: Marketplace URL or GitHub releases
2. **Changelog**: Look for CHANGELOG.md or releases page
3. **Pricing**: Extension pricing page (if paid)
4. **MCP**: null (not applicable for extensions)
5. **Issue**: GitHub issues URL

## Phase 7: Community URLs

Follow **Phase 6** from CLI workflow:
- Check website footer
- Use WebSearch for social platforms
- Validate official accounts

## Phase 8: Generate Manifest

```json
{
  "$schema": "../$schemas/extension.schema.json",
  "id": "<name>",
  "name": "<Official Name>",
  "description": "<Max 200 chars>",
  "i18n": {},
  "websiteUrl": "<https://...>",
  "docsUrl": "<https://... or null>",
  "verified": false,
  "vendor": "<Publisher Name>",
  "latestVersion": "<1.2.0>",
  "githubUrl": "<https://github.com/...>",
  "license": "<SPDX or Proprietary>",
  "pricing": [...],
  "resourceUrls": {...},
  "communityUrls": {...},
  "relatedProducts": [],
  "supportedIdes": [...]
}
```

## Phase 9: Validation

Run validation and fix errors:
```bash
npm run test:validate
```

## Common Marketplace Patterns

| IDE | Marketplace URL Pattern | Install URI Pattern |
|-----|------------------------|---------------------|
| VS Code | `marketplace.visualstudio.com/items?itemName=<pub>.<id>` | `vscode:extension/<pub>.<id>` |
| Cursor | Same as VS Code | `cursor:extension/<pub>.<id>` |
| JetBrains | `plugins.jetbrains.com/plugin/<id>` | `jetbrains://idea/plugin/<id>` |
| Open VSX | `open-vsx.org/extension/<pub>/<id>` | Varies by IDE |

## Key Differences from CLI

- Focus on marketplace URLs instead of install commands
- No `platforms` field (extensions are IDE-specific, not OS-specific)
- `supportedIdes` is the critical differentiator
- Version often comes from marketplace, not just GitHub
- Publisher name is often the vendor
