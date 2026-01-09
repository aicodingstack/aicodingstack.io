# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Internationalization (i18n)

When creating or modifying any page, module, or data:
- **MUST support all configured languages (18 total):**
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
- **Git commits:** Do not create commits autonomously. Always ask the user before committing changes.
