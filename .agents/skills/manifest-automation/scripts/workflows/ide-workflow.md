# IDE Manifest Workflow

This workflow guides you through creating or updating an IDE manifest with focus on GUI installation and downloads.

## Required Fields (from ide.schema.json)

**Entity + Product fields**: Same as CLI

**App fields:**
- `platforms` (array of {os, installPath, installCommand, launchCommand})

## Workflow

Follow **CLI workflow** with these IDE-specific adjustments:

## Phase 1-2: Core Info & Installation

**Differences from CLI:**

1. **Focus on GUI installation** rather than command-line:
   - Download page for installer files (.dmg, .exe, .deb, .AppImage)
   - Installation wizards and GUI installers
   - App Store distributions (Mac App Store, Microsoft Store)

2. **Installation patterns**:

   **macOS**:
   - DMG file download
   - installPath: `/Applications/<Name>.app`
   - installCommand: Download and drag to Applications (or `brew install --cask <name>`)
   - launchCommand: Application name or `open -a "<Name>"`

   **Windows**:
   - EXE or MSI installer
   - installPath: `C:\\Program Files\\<Name>` or `%LOCALAPPDATA%\\<Name>`
   - installCommand: Download and run installer (or `winget install <name>`)
   - launchCommand: Start menu or executable path

   **Linux**:
   - .deb, .rpm, .AppImage, or Snap package
   - installPath: `/usr/bin/<name>` or `/opt/<name>`
   - installCommand: `sudo apt install <name>`, `snap install <name>`, etc.
   - launchCommand: `<name>` or desktop entry

3. **Download URLs** (`resourceUrls.download`):
   - Direct links to installer files
   - Download page with OS detection
   - Release pages with multiple OS versions

## Phase 3-7: Same as CLI

- GitHub discovery
- Version extraction
- Pricing (may include licenses for teams)
- Resource URLs
- Community URLs

## Phase 8: Generate Manifest

```json
{
  "$schema": "../$schemas/ide.schema.json",
  "id": "<name>",
  "name": "<Official Name>",
  "description": "<Max 200 chars>",
  "i18n": {},
  "websiteUrl": "<https://...>",
  "docsUrl": "<https://... or null>",
  "verified": false,
  "vendor": "<Company Name>",
  "latestVersion": "<1.2.0>",
  "githubUrl": "<https://github.com/...>",
  "license": "<SPDX or Proprietary>",
  "pricing": [...],
  "resourceUrls": {
    "download": "<https://.../download>",
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
      "installPath": "/Applications/Name.app",
      "installCommand": "brew install --cask name",
      "launchCommand": "open -a \"Name\""
    },
    {
      "os": "windows",
      "installPath": "%LOCALAPPDATA%\\Name",
      "installCommand": "winget install Name.Name",
      "launchCommand": "Name"
    },
    {
      "os": "linux",
      "installPath": "/usr/bin/name",
      "installCommand": "sudo snap install name --classic",
      "launchCommand": "name"
    }
  ]
}
```

## Common IDE Install Patterns

| OS | Package Manager | Command | Install Path |
|----|----------------|---------|--------------|
| macOS | Homebrew Cask | `brew install --cask <name>` | `/Applications/<Name>.app` |
| macOS | DMG | Download → Drag to Applications | `/Applications/<Name>.app` |
| Windows | Winget | `winget install <id>` | `%LOCALAPPDATA%\<Name>` or `C:\Program Files\<Name>` |
| Windows | Installer | Download .exe → Run | `C:\Program Files\<Name>` |
| Linux | Snap | `snap install <name> --classic` | `/snap/<name>` |
| Linux | APT | `apt install <name>` | `/usr/bin/<name>` |
| Linux | Flatpak | `flatpak install <name>` | `/var/lib/flatpak` |

## Key Differences from CLI

- Emphasize GUI installation over command-line
- Include download page URLs for installers
- Launch commands are often just the app name or GUI launcher
- May include App Store links
- Installation paths are app bundles (.app) on macOS
- Some IDEs are web-based (os: "web", no installPath)
