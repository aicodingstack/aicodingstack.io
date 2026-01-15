# AI Coding Stack - Component & Architecture Diagram

**Last Updated:** January 6, 2026

This document provides a comprehensive overview of the AI Coding Stack project architecture, component relationships, and data flow.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI CODING STACK ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐              │
│  │   MANIFESTS/     │────▶│   GENERATORS/    │────▶│   GENERATED/     │              │
│  │   (Data Source)  │     │   (Build Tools)  │     │   (Typed Output) │              │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘              │
│           │                        │                        │                        │
│           │                        │                        │                        │
│           ▼                        ▼                        ▼                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐        │
│  │                           src/lib/                                         │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │        │
│  │  │ manifest-    │  │ metadata/    │  │ i18n/        │  │ landscape-   │  │        │
│  │  │ registry.ts  │  │ (schemas)    │  │ (locales)    │  │ data.ts      │  │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │        │
│  └──────────────────────────────────────────────────────────────────────────┘        │
│                                     │                                                │
│                                     ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐        │
│  │                           src/app/[locale]/                                │        │
│  │  ┌─────────────┐  ┌────────────────────┐  ┌─────────────────────┐         │        │
│  │  │ layout.tsx  │▶ │  Pages (Routing)   │  │  opengraph-image.*  │         │        │
│  │  │  (Root)     │  │  - ides/           │  │  (Social Images)    │         │        │
│  │  └─────────────┘  │  - clis/           │  └─────────────────────┘         │        │
│  │                   │  - models/                                         │        │
│  │                   │  - extensions/                                     │        │
│  │                   │  - articles/                                       │        │
│  │                   │  - docs/                                           │        │
│  │                   └────────────────────┘                                 │        │
│  └──────────────────────────────────────────────────────────────────────────┘        │
│                                     │                                                │
│                                     ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐        │
│  │                        src/components/                                     │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │        │
│  │  │ Layout   │ │ Product  │ │ Controls │ │ Navigation│ │ Sidebar etc  │   │        │
│  │  │ Layer    │ │ Layer    │ │ Layer    │ │ Layer     │ │              │   │        │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │        │
│  └──────────────────────────────────────────────────────────────────────────┘        │
│                                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Root Level
```
aicodingstack.io/
├── .claude/              # Claude Code skills and settings
├── .github/              # GitHub: workflows, templates, CODEOWNERS, dependabot
├── docs/                 # Project documentation
├── manifests/            # Core data: JSON manifest files + schemas
├── public/               # Static assets
├── scripts/              # Build/fetch/generate scripts
├── skills/               # Claude Code skills
├── src/                  # Application source code
└── [config files]        # package.json, next.config.* tsconfig.json, etc.
```

### manifests/ (Data Source)
```
manifests/
├── $schemas/             # JSON Schema definitions for validation
│   ├── ides.schema.json
│   ├── clis.schema.json
│   ├── extensions.schema.json
│   ├── models.schema.json
│   ├── providers.schema.json
│   ├── vendors.schema.json
│   └── github-stars.schema.json
├── ides/*.jsonc          # IDE manifest files
├── clis/*.jsonc          # CLI manifest files
├── extensions/*.jsonc    # Extension manifest files
├── models/*.jsonc        # Model manifest files
├── providers/*.jsonc     # Provider manifest files
├── vendors/*.jsonc       # Vendor manifest files
└── github-stars.json     # Centralized star counts
```

### scripts/ (Build Tools)
```
scripts/
├── fetch/                # Data fetching scripts
│   ├── fetch-github-stars.mjs
│   └── index.mjs
├── generate/             # Code generation scripts
│   ├── generate-i18n.mjs
│   ├── generate-manifests.mjs
│   └── index.mjs
├── refactor/             # Refactoring utilities
└── _shared/              # Shared utilities for scripts
```

### .github/workflows/ (CI/CD)
```
.github/workflows/
├── ci.yml                  # Main CI checks (lint, type-check, build, test)
├── deploy-preview.yml      # Preview deployments from PRs
├── deploy-staging.yml      # Staging environment
├── deploy-production.yml   # Production deployment
├── scheduled-checks.yml    # URL validation, benchmark updates
├── update-github-stars.yml # Scheduled GitHub stars fetch
├── stale.yml               # Stale issue/PR management
├── cleanup-preview.yml     # Preview cleanup
└── dependabot-auto-merge.yml
```

### src/ (Application Source)
```
src/
├── app/[locale]/           # Next.js App Router (i18n)
│   ├── layout.tsx          # Root layout (i18n provider, Google Analytics)
│   ├── page.tsx            # Homepage
│   ├── [routes]/           # All page routes
│   └── opengraph-image.tsx # OG images
├── components/             # React components
│   ├── controls/           # UI controls (search, filters, theme)
│   ├── navigation/         # Navigation components
│   ├── product/            # Product-specific components
│   ├── sidebar/            # Sidebar components
│   ├── og/                 # OG image templates
│   └── [shared components] # PageHeader, JsonLd, etc.
├── i18n/                   # Internationalization
│   ├── config.ts           # Locale config
│   ├── navigation.ts       # Localized Link component
│   └── locales/            # Translation files (en, zh-Hans, de, ko)
├── lib/                    # Core library modules
│   ├── data/               # Data utilities
│   ├── generated/          # Auto-generated typed imports
│   ├── metadata/           # SEO metadata system
│   │   └── schemas/        # Schema.org builders
│   ├── manifest-i18n.ts    # Manifest translation layer
│   ├── manifest-registry.ts# Manifest query system
│   ├── landscape-data.ts   # Landscape page data
│   ├── search.ts           # Search functionality
│   ├── collections.ts      # Collections data
│   ├── benchmarks.ts       # Benchmark data
│   ├── format.ts           # Formatting utilities
│   ├── pricing.ts          # Pricing utilities
│   └── license.tsx         # License component
├── types/                  # TypeScript type definitions
│   └── manifests.ts        # Manifest types (mapped from schemas)
├── layouts/                # Layout components
│   └── PageLayout.tsx      # Main page layout
└── middleware.ts           # Next.js middleware (redirects, etc.)
```

---

## Core Systems

### 1. Manifest System

The manifest system is the core data layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                     MANIFEST SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  manifests/*.jsonc (Source)                                     │
│         │                                                      │
│         ▼                                                      │
│  scripts/generate/generate-manifests.mjs                       │
│         │                                                      │
│         ▼                                                      │
│  src/lib/generated/*.ts (Typed Access)                         │
│         │                                                      │
│         ├──▶ src/lib/manifest-registry.ts (Query API)          │
│         │                                                      │
│         └──▶ src/lib/manifest-i18n.ts (Translation Layer)      │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Key Files:**
- `src/lib/manifest-registry.ts` - Central manifest query system
- `src/lib/manifest-i18n.ts` - Translates manifest fields
- `src/types/manifests.ts` - TypeScript definitions (1:1 with schemas)
- `src/lib/generated/*.ts` - Auto-generated imports

### 2. i18n System

```
┌─────────────────────────────────────────────────────────────────┐
│                       I18N SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  src/i18n/config.ts - Locale configuration                       │
│         ├── defaultLocale: 'en'                                 │
│         └── locales: ['en', 'zh-Hans', 'de', 'ko']              │
│                                                                │
│  src/i18n/navigation.ts - Localized Link component              │
│                                                                │
│  src/i18n/locales/*.json - Translation files                    │
│         ├── en.json                                             │
│         ├── zh-Hans.json                                        │
│         ├── de.json                                             │
│         └── ko.json                                             │
│                                                                │
│  Usage:                                                         │
│  import { Link } from '@/i18n/navigation'                       │
│  import { useTranslations } from '@/i18n/navigation'            │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Metadata & SEO System

```
┌─────────────────────────────────────────────────────────────────┐
│                   METADATA & SEO SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  src/lib/metadata/                                               │
│  ├── config.ts           - Site-wide SEO config                 │
│  ├── generators.ts       - Page-specific metadata generators   │
│  ├── helpers.ts          - Helper functions (OG, Twitter)      │
│  ├── robots.ts           - Robots configuration                │
│  ├── templates.ts        - Base metadata templates             │
│  └── schemas/            - Schema.org structured data          │
│      ├── types.ts        - Schema type definitions             │
│      ├── builders.ts     - Schema builder functions            │
│      ├── generators.ts   - Page-specific schema generators     │
│      └── validators.ts   - Schema validation                   │
│                                                                │
│  opengraph-image.tsx files - Route-specific OG images           │
│                                                                │
│  Schemas supported:                                             │
│  - Organization, WebSite, FAQPage                               │
│  - SoftwareApplication (IDEs, CLIs, Extensions)                  │
│  - Product, BreadcrumbList, Article, TechArticle                │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 4. External Data Fetching

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL DATA FETCHING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  Scripts for fetching external data:                            │
│                                                                │
│  scripts/fetch/fetch-github-stars.mjs                           │
│  ├── Fetches from GitHub API                                    │
│  └── Writes to manifests/github-stars.json                       │
│                                                                │
│  Scheduled workflows:                                           │
│  .github/workflows/update-github-stars.yml (daily)              │
│  .github/workflows/scheduled-checks.yml (weekly)                │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Page Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAGE COMPONENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  RootLayout (src/app/[locale]/layout.tsx)                       │
│  ├── i18n provider                                              │
│  ├── Google Analytics (@next/third-parties)                     │
│  ├── ThemeProvider                                              │
│  └── ClientLayout (for interactivity)                           │
│                                                                │
│  PageLayout (src/layouts/PageLayout.tsx)                        │
│  ├── JsonLd (optional schema)                                   │
│  ├── Header                                                     │
│  │   ├── SearchDialog                                           │
│  │   ├── StackMegaMenu                                          │
│  │   ├── RankingMegaMenu                                        │
│  │   └── i18n Link                                              │
│  └── Footer                                                     │
│      ├── LanguageSwitcher                                       │
│      └── ThemeSwitcher                                          │
│                                                                │
│  Pages compose components directly (no nested layouts)          │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Product Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT COMPONENTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  ProductHero.tsx          - Main product header                 │
│  ├── VerifiedBadge                                           │
│  └── PlatformIcons                                           │
│                                                                │
│  RelatedProducts.tsx      - Related product grid                │
│  ├── LinkCard                                                 │
│                                                                │
│  ProductPricing.tsx        - Pricing table                      │
│                                                                │
│  ResourceLinks.tsx         - Resource links (download, docs)    │
│  ├── LinkCard                                                 │
│                                                                │
│  CommunityLinks.tsx        - Community links (social)           │
│  ├── LinkCard                                                 │
│  └── PlatformIcons                                           │
│                                                                │
│  ProductCommands.tsx       - Install/launch commands            │
│  ├── CopyButton                                              │
│                                                                │
│  ModelBenchmarks.tsx       - Model benchmark scores             │
│  ModelSpecifications.tsx   - Model technical specs               │
│  VendorProducts.tsx        - Vendor's product grid              │
│  VendorModels.tsx          - Vendor's model grid                 │
│  GitHubStarHistory.tsx     - GitHub stars chart                 │
│  PlatformLinks.tsx         - Platform links (HuggingFace)       │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Build-Time Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD-TIME DATA FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  npm run generate                                               │
│         │                                                      │
│         ▼                                                      │
│  Script: generate-manifests.mjs                                │
│  ├── Reads manifests/*.jsonc                                   │
│  ├── Validates against schemas                                 │
│  └── Writes src/lib/generated/*.ts                             │
│         │                                                      │
│         ▼                                                      │
│  build                                                        │
│         │                                                      │
│         ▼                                                      │
│  Static HTML generated for all locales                         │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Runtime Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME DATA FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  User Visit                                                     │
│     │                                                           │
│     ▼                                                           │
│  Middleware (redirects, locale detection)                       │
│     │                                                           │
│     ▼                                                           │
│  RootLayout (i18n context, analytics)                           │
│     │                                                           │
│     ▼                                                           │
│  Page Component                                                 │
│     ├── reads manifest-registry.ts (cached)                    │
│     ├── uses manifest-i18n.ts for translations                 │
│     ├── generates metadata                                 │
│     └── renders components                                     │
│     │                                                           │
│     ▼                                                           │
│  Browser Response                                              │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page Types

| Page Type | Route | Components | Schema |
|-----------|-------|------------|--------|
| Homepage | `/` | Hero sections, cards | WebSite, FAQPage |
| IDE List | `/ides` | FilterSortBar, cards | - |
| IDE Detail | `/ides/[slug]` | ProductHero, RelatedProducts, ProductPricing, ResourceLinks, CommunityLinks, ProductCommands | SoftwareApplication, BreadcrumbList |
| CLI List | `/clis` | FilterSortBar, cards | - |
| CLI Detail | `/clis/[slug]` | ProductHero, RelatedProducts, ProductPricing, ResourceLinks, CommunityLinks, ProductCommands | SoftwareApplication, BreadcrumbList |
| Extension List | `/extensions` | FilterSortBar, cards | - |
| Extension Detail | `/extensions/[slug]` | ProductHero, RelatedProducts, ProductPricing, ResourceLinks, CommunityLinks, ProductCommands | SoftwareApplication, BreadcrumbList |
| Model List | `/models` | FilterSortBar, cards | - |
| Model Detail | `/models/[slug]` | ProductHero, PlatformLinks, ModelSpecifications, ModelBenchmarks | Product |
| Provider List | `/model-providers` | FilterSortBar, cards | - |
| Provider Detail | `/model-providers/[slug]` | ProductHero, PlatformLinks, CommunityLinks | Organization |
| Vendor Detail | `/vendors/[slug]` | ProductHero, CommunityLinks, VendorProducts, VendorModels | Organization |
| Article | `/articles/[slug]` | MarkdownContent, PageHeader | Article |
| Docs | `/docs/[slug]` | MarkdownContent, DocsSidebar, PageHeader | TechArticle |
| Comparison | `/[type]/comparison` | ComparisonTable, FilterSortBar | - |
| Search | `/search` | SearchDialog, SearchResults | - |

---

## Key Dependencies

### Internal Dependencies

```
Components
├── depend on → src/lib/manifest-registry.ts
├── depend on → src/lib/manifest-i18n.ts
├── depend on → src/lib/generated/*.ts
├── depend on → src/lib/metadata/generators.ts
└── depend on → src/i18n/navigation.ts

Pages
├── depend on → src/components/*
├── depend on → src/lib/manifest-registry.ts
├── depend on → src/lib/metadata/generators.ts
└── depend on → src/i18n/navigation.ts

Lib Modules
├── manifest-registry.ts depends on → src/lib/generated/*.ts
├── manifest-i18n.ts depends on → src/i18n/locales/*.json
├── metadata/ depends on → src/lib/manifest-registry.ts
└── landscape-data.ts depends on → src/lib/generated/*.ts
```

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| next | React framework (v15) |
| react | UI library (v19) |
| @next/third-parties | Google Analytics integration |
| lucide-react | Icons |
| ibm-plex-mono | Monospaced font |
| claude-ui | UI components (if used) |
| playwright | Automated fetching (via skills) |

---

## Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  Git Push                                                       │
│     │                                                           │
│     ▼                                                           │
│  GitHub Actions CI (.github/workflows/ci.yml)                   │
│  ├── Lint                                                       │
│  ├── Type Check                                                 │
│  ├── Build                                                      │
│  ├── URL Validation                                             │
│  └── Spell Check                                                │
│     │                                                           │
│     ▼                                                           │
│  Cloudflare Pages (via deploy-production.yml)                   │
│  ├── Build Output: .open-next                                   │
│  └── Edge Runtime                                               │
│     │                                                           │
     ▼                                                           │
│  https://aicodingstack.io                                       │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

- `SCHEMA-ARCHITECTURE.md` - Schema system details
- `SCHEMA-ALIGNMENT.md` - Schema/Type correspondence
- `METADATA_OPTIMIZATION.md` - Metadata system
- `SEO-AUDIT-REPORT.md` - SEO implementation status
- `PERFORMANCE.md` - Performance considerations
- `scripts/README.md` - Build and generation scripts
- `CLAUDE.md` - Development guidelines

---

**Document Version:** 2.0
**Last Updated:** January 6, 2026
