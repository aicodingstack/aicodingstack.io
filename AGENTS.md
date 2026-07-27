# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Internationalization (i18n)

**Translation Resources Location:** All translation files are located in the `translations/` directory at the project root, organized by locale code (e.g., `translations/en/`, `translations/zh-Hans/`).

When creating or modifying any page, module, or data:
- **MUST support all configured languages (12 total):**
  - English (en)
  - German (de)
  - Spanish (es)
  - French (fr)
  - Indonesian (id)
  - Japanese (ja)
  - Korean (ko)
  - Portuguese (pt)
  - Russian (ru)
  - Turkish (tr)
  - Simplified Chinese (zh-Hans)
  - Traditional Chinese (zh-Hant)

- **NEVER hardcode** a subset of locales like `'en' | 'zh-Hans'`
- **MUST use the localized Link component:** Always import and use `import { Link } from '@/i18n/navigation'` instead of Next.js default Link

### Localization Best Practices

- **Metadata localization:** All meta information (titles, descriptions, keywords, OG tags, etc.) in pages MUST be properly localized
- **DRY principle for translations:** Before creating new translation keys, search existing translation modules thoroughly to reuse existing terms and phrases
- **Consistency:** Use the same translation keys across similar contexts

### Translation File Organization

Follow the detailed architecture rules in [docs/I18N-ARCHITECTURE-RULES.md](docs/I18N-ARCHITECTURE-RULES.md) for organizing translation resources.

**Core Principles:**
1. **Page translations**: Each page or page group should have its own JSON file (e.g., `ides.json`, `ide-detail.json`)
2. **Component translations**: Organize by component directory:
   - `components/common.json` - Root-level components (Header, Footer, etc.)
   - `components/navigation.json` - All navigation/* components
   - `components/controls.json` - All controls/* components
   - `components/sidebar.json` - All sidebar/* components
   - `components/product.json` - All product/* components
3. **Minimize `@:` references**: Use `tPage + tShared` or `tComponent + tShared` patterns in code instead of cross-namespace references in JSON
4. **Metadata placement**: Co-locate page metadata (title, description, etc.) with page translations under a `meta` object
5. **Multi-language workflow**: New translation keys should initially use English placeholders across all locales, with proper translation in a separate batch step

**Usage Pattern:**
```tsx
// Pages
const tPage = useTranslations('pages.modelDetail')
const tShared = useTranslations('shared')

// Components (root-level)
const tComponent = useTranslations('components.common.header')

// Components (subdirectories)
const tComponent = useTranslations('components.navigation.breadcrumb')
```

## Design System

**Global Design Principles:**

- **Minimalist approach:** Follow a unified, extremely minimalist design style throughout the entire application
- **No rounded corners:** All controls, components, labels, and UI elements MUST use sharp corners (border-radius: 0)
- **Restrained color usage:** Use colors extremely sparingly and intentionally. Prefer grayscale and limit accent colors to essential UI elements only. If colors must be used, prefer low-saturation designs.
- **Icon usage:** Prefer using Lucide SVG icons. Avoid using emoji or any other characters as icons.
- **Page width:**
  - `max-w-8xl`: for all pages globally
  - `max-w-6xl`: for content pages and homepage

## Coding Principles

### DRY - Don't Repeat Yourself
- Eliminate code duplication by extracting common logic
- Reuse existing components, functions, and translation keys
- Create shared utilities when patterns emerge

### Type Safety & Schema Alignment
- **Manifest type definitions:** Always ensure that `src/types/manifests.ts` stays in one-to-one correspondence with the JSON schemas in `manifests/$schemas/`
- When modifying schema files, update the corresponding TypeScript types accordingly
- When adding new types, verify they match the schema structure exactly
- Maintain consistency between schema definitions and type definitions to prevent runtime errors

## Metadata & SEO

- **File-based OG images:** Use `opengraph-image.tsx` files for all routes, NOT code-based image paths
- **Request memoization:** Wrap all data fetchers with React `cache()` to prevent duplicate fetching in `generateMetadata()` and page components
- **Type-safe locales:** Always use `import type { Locale } from '@/i18n/config'`
- **Auto-detected OG images:** Do NOT manually specify `images` in OpenGraph metadata - Next.js auto-detects `opengraph-image.tsx` files

**OG Image Design:**
- Size: 1200x630px (OpenGraph standard)
- Follow global design system strictly

## Development Workflow

- **Development server:** Do not start `npm run dev` automatically. User will start it manually when needed.
- **Standalone preview assets:** Before starting `.next/standalone/server.js`, sync `public/` into `.next/standalone/public/` and `.next/static/` into `.next/standalone/.next/static/`. Repeat this after every production build because Next.js regenerates `.next/standalone/`. Never start the standalone server without these assets.
- **Standalone preview verification:** After starting or restarting a standalone preview, verify that one representative page returns `200` and that a stylesheet referenced by that page returns `200` with a CSS content type. When using tmux, include the asset sync in the pane start command.
- **Git commits:** Do not create commits autonomously. Always ask the user before committing changes.
