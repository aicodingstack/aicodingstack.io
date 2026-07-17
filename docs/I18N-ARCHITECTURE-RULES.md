# i18n Translation Architecture Rules

## Overview

This document defines the rules and best practices for organizing translation resources in the `translations/` directory.

## Current Structure Analysis

### Observed Pattern
```
translations/
├── {locale}/              # 12 language directories (en, de, es, fr, id, ja, ko, pt, ru, tr, zh-Hans, zh-Hant)
│   ├── index.ts          # Unified export entry
│   ├── shared.json       # Shared translations (actions, terms, etc.)
│   ├── components.json   # Component translations (organized by component name)
│   └── pages/            # Page-specific translations
│       ├── home.json
│       ├── stacks.json   # ⚠️ NEEDS REFACTORING - contains multiple pages
│       ├── comparison.json
│       └── ...
```

### Key Findings

1. **stacks.json is overloaded**: Contains translations for multiple pages/features:
   - ides, clis, extensions, models, vendors (list pages)
   - ideDetail, cliDetail, extensionDetail, modelDetail, vendorDetail (detail pages)
   - modelCompare (comparison page)
   - modelProviders, modelProviderDetail
   - overview

2. **Usage pattern in code**:
   ```tsx
   const tPage = useTranslations('pages.stacks')
   const tShared = useTranslations('shared')
   // or
   const tComponent = useTranslations('components.common.footer')
   const tShared = useTranslations('shared')
   ```

3. **Over-reliance on `@:` references**: Many page/component translations reference shared translations using `@:shared.xxx`, which is redundant given the tPage + tShared pattern in code.

## Architecture Rules

### Rule 1: Page Translation File Granularity

**Principle**: Each page or closely related page group should have its own JSON file.

**Implementation**:
- ❌ **Bad**: Single `stacks.json` containing translations for ides, clis, extensions, models, vendors, etc.
- ✅ **Good**: Split into dedicated files:
  ```
  pages/
  ├── home.json
  ├── ides.json              # IDE list page
  ├── ide-detail.json        # IDE detail page
  ├── clis.json              # CLI list page
  ├── cli-detail.json        # CLI detail page
  ├── extensions.json
  ├── extension-detail.json
  ├── models.json
  ├── model-detail.json
  ├── model-compare.json
  ├── model-providers.json
  ├── model-provider-detail.json
  ├── vendors.json
  ├── vendor-detail.json
  ├── stacks-overview.json   # Overview/landing page
  └── ...
  ```

**Note**: Every page translation file created under this rule **MUST include a `meta` section** as specified in Rule 4.

**Rationale**:
- Better file organization and maintainability
- Easier to locate translations for specific pages
- Clearer code-to-translation mapping
- Reduces cognitive load when editing translations

---

### Rule 2: Component Translation Directory Structure

**Principle**: `components.json` should be refactored into a directory structure that **mirrors the `src/components/` directory structure**.

**Current Component Structure**:
```
src/components/
├── Header.tsx
├── Footer.tsx
├── PageHeader.tsx
├── controls/
│   ├── SearchDialog.tsx
│   ├── ThemeSwitcher.tsx
│   └── ...
├── navigation/
│   ├── BackToNavigation.tsx
│   ├── Breadcrumb.tsx
│   ├── StackTabs.tsx
│   └── ...
├── sidebar/
│   ├── DocsSidebar.tsx
│   └── ...
└── product/
    ├── ProductHero.tsx
    ├── ComparisonTable.tsx
    └── ...
```

**Target Translation Structure**:
- ❌ **Bad**: Flat `components.json` file with all components
- ✅ **Good**: Organize by component directory:
  ```
  components/
  ├── common.json          # Root-level components (Header, Footer, PageHeader, etc.)
  ├── navigation.json      # All components in src/components/navigation/
  ├── controls.json        # All components in src/components/controls/
  ├── sidebar.json         # All components in src/components/sidebar/
  └── product.json         # All components in src/components/product/
  ```

**Internal Structure** (example for components/navigation.json):
  ```json
  {
    "backToNavigation": {
      "backTo": "Back to",
      "indexLabel": "INDEX"
    },
    "breadcrumb": {
      "home": "Home"
    },
    "stackTabs": {
      "overview": "Overview",
      "ides": "IDEs"
    }
  }
  ```

**Migration Strategy**:
- Root-level components → `components/common.json`
- Each subdirectory → One JSON file named after the directory
- Within each JSON, organize by component name (camelCase)
- Update index.ts to export from new structure

**Rationale**:
- **Clear mapping**: Easy to find translations for any component
- **Scalability**: Grows naturally with the component library
- **Consistency**: Developers familiar with component structure know where to find translations
- **Maintainability**: Moving/renaming components means updating translations in parallel

---

### Rule 3: Minimize `@:` References in JSON Files

**Principle**: Since the codebase uses `tPage + tShared` or `tComponent + tShared` patterns, JSON files should minimize `@:shared` references and let the code handle multiple translation sources.

**Implementation**:
- ❌ **Bad**: Page JSON with many `@:shared` references
  ```json
  {
    "cliDetail": {
      "documentation": "@:shared.terms.documentation",
      "download": "@:shared.actions.download",
      "license": "@:shared.terms.license"
    }
  }
  ```

- ✅ **Good**: Let the code use tShared directly
  ```tsx
  // In component code
  const tPage = useTranslations('pages.cliDetail')
  const tShared = useTranslations('shared')

  // Use directly
  <button>{tShared('actions.download')}</button>
  <span>{tShared('terms.documentation')}</span>
  ```

**When to use `@:` references**:
- ✅ Within the same namespace (e.g., `@:pages.home.title` within pages/home.json)
- ✅ For DRY within the same file (avoid duplicating long strings)
- ❌ Avoid cross-namespace references to `shared` (let code handle it)

**Rationale**:
- Reduces indirection and improves readability
- Makes it clear which translations are page-specific
- Simplifies refactoring and moving translations
- Code is the source of truth for composition logic

---

### Rule 4: Required Metadata Section

**Principle**: **Every page translation file MUST include a `meta` section** containing page metadata (meta title, description, keywords, OG tags). This is a mandatory requirement for all page translation files.

**Requirement**:
- ✅ **Required**: Every `pages/*.json` file must have a `meta` object
- ✅ **Required**: The `meta` object must be present even if initially empty: `"meta": {}`
- ✅ **Required**: All locales must include the `meta` section (can use English placeholders initially per Rule 5)

**Implementation**:
```json
{
  "meta": {
    "title": "AI Coding Stack - Your AI Coding Ecosystem Hub",
    "description": "Comprehensive directory for AI coding tools...",
    "keywords": "AI coding, IDEs, CLIs, extensions, models"
  },
  "title": "Your AI Coding Ecosystem Hub",
  "subtitle": "Discover, Compare, Build Faster.",
  "...": "..."
}
```

**Minimum Required Structure**:
Even if metadata is not yet defined, the file must include an empty meta object:
```json
{
  "meta": {},
  "title": "Page Title",
  "...": "..."
}
```

**Rationale**:
- **Consistency**: Ensures all pages follow the same structure
- **Discoverability**: Makes it easy to identify which pages have metadata defined
- **Type Safety**: Enables consistent type definitions across all page translations
- **Single source of truth**: Co-locates page content and metadata
- **Maintainability**: Easier to maintain consistency between visible content and metadata
- **Next.js alignment**: Aligns with Next.js metadata generation patterns

---

### Rule 5: Multi-Language Incremental Translation Strategy

**Principle**: To simplify development workflow, new translation keys should initially use English placeholders across all locales, with proper translation happening in a separate step.

**Implementation Workflow**:

1. **Add new feature/page**: Create translation keys in `translations/en/*.json`
2. **Propagate to all locales**: Copy English values to all other 11 language files as placeholders
3. **Mark for translation**: (Optional) Use a convention like `[EN]` prefix or tracking file
4. **Batch translation**: Periodically translate all English placeholders to respective languages

**Example**:
```json
// translations/en/pages/new-feature.json
{
  "title": "New Feature",
  "description": "This is a new feature"
}

// translations/zh-Hans/pages/new-feature.json (initial)
{
  "title": "New Feature",  // English placeholder
  "description": "This is a new feature"
}

// translations/zh-Hans/pages/new-feature.json (after translation)
{
  "title": "新功能",
  "description": "这是一个新功能"
}
```

**Rationale**:
- Prevents broken UI in non-English locales during development
- Allows feature development to proceed without waiting for translations
- Enables batch translation for efficiency
- Clear visibility of what needs translation

---

## Translation File Naming Conventions

### File Names
- Use kebab-case: `model-providers.json`, `cli-detail.json`
- Be descriptive and specific
- Avoid abbreviations unless widely understood

### Translation Keys
- Use camelCase: `maxOutput`, `contextWindow`, `visitWebsite`
- Nest logically but avoid deep nesting (max 3 levels recommended)
- Use singular for object keys, plural for lists

### Namespaces
- `shared.actions.*` - User actions (view, download, compare)
- `shared.terms.*` - Domain terminology (license, vendor, documentation)
- `shared.categories.*` - Category names (singular, plural, all)
- `shared.labels.*` - UI labels
- `components.common.{componentName}.*` - Root-level component translations
  - `components.common.header.*` - Header component
  - `components.common.footer.*` - Footer component
  - `components.common.pageHeader.*` - PageHeader component
- `components.{subdirectory}.{componentName}.*` - Subdirectory component translations
  - `components.navigation.breadcrumb.*` - Navigation/Breadcrumb component
  - `components.navigation.stackTabs.*` - Navigation/StackTabs component
  - `components.controls.searchDialog.*` - Controls/SearchDialog component
  - `components.product.productHero.*` - Product/ProductHero component
- `pages.{pageName}.*` - Page-specific content

---

## Migration Checklist

To align the current codebase with these rules:

### Phase 1: Split stacks.json
- [ ] Create individual page translation files (ides.json, clis.json, etc.)
- [ ] Update index.ts to import new files
- [ ] Update component code to use correct translation namespaces
- [ ] Remove old stacks.json references

### Phase 2: Refactor components.json
- [ ] Create components/ directory
- [ ] Split components.json into files by component location:
  - `components/common.json` - Root-level components (Header, Footer, PageHeader)
  - `components/navigation.json` - All navigation/* components
  - `components/controls.json` - All controls/* components
  - `components/sidebar.json` - All sidebar/* components
  - `components/product.json` - All product/* components
- [ ] Update index.ts to import from new directory structure
- [ ] Update component code to use new translation paths:
  - Root components: `useTranslations('components.common.{componentName}')`
  - Subdirectory components: `useTranslations('components.{subdirectory}.{componentName}')`

### Phase 3: Remove redundant @: references
- [ ] Audit all page and component JSON files
- [ ] Remove @:shared references where code can use tShared
- [ ] Update component code to use both tPage/tComponent and tShared

### Phase 4: Standardize metadata (MANDATORY)
- [ ] **Audit all page translation files** - Verify every `pages/*.json` file includes a `meta` section
- [ ] **Add missing metadata sections** - For any page without `meta`, add at minimum `"meta": {}`
- [ ] **Populate metadata** - Fill in title, description, and keywords for all pages
- [ ] **Verify metadata localization** - Ensure all locales have metadata sections (can use English placeholders initially)

### Phase 5: Establish translation workflow
- [ ] Document the English placeholder → translation workflow
- [ ] Set up tooling or scripts to detect untranslated content (if needed)

---

## Examples

### Example 1: Page Translation (models.json)

```json
{
  "meta": {
    "title": "AI Coding Models | Compare LLMs for Code 2025",
    "description": "Compare large language models optimized for code generation..."
  },
  "title": "AI Coding Models",
  "subtitle": "Large language models optimized for code generation and analysis",
  "compareAll": "Compare All Models",
  "search": "Search by name...",
  "filters": {
    "context": "Context:",
    "pricing": "Pricing:",
    "size": "Size:"
  },
  "lifecycle": {
    "latest": "Latest",
    "maintained": "Maintained",
    "deprecated": "Deprecated",
    "noResults": "No {lifecycle} models match your search"
  }
}
```

### Example 2: Component Translation (components/common.json)

```json
{
  "header": {
    "aiCodingStack": "AI Coding Stack",
    "manifesto": "Manifesto",
    "landscape": "Landscape",
    "collections": "Collections",
    "ranking": "Ranking",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  },
  "footer": {
    "copyright": "© {year} AI Coding Stack • Built with ❤︎ • Open Source",
    "tagline": "Your AI Coding Ecosystem Hub.",
    "openSource": "Open source AI coding metadata repository.",
    "selectLanguage": "Select Language",
    "toggleTheme": "Toggle theme"
  },
  "pageHeader": {
    "backToTop": "Back to top"
  }
}
```

### Example 3: Component Translation (components/navigation.json)

```json
{
  "breadcrumb": {
    "home": "Home"
  },
  "backToNavigation": {
    "backTo": "Back to",
    "indexLabel": "INDEX"
  },
  "stackTabs": {
    "overview": "Overview",
    "ides": "IDEs",
    "clis": "CLIs",
    "extensions": "Extensions",
    "models": "Models"
  }
}
```

### Example 4: Component Translation (components/controls.json)

```json
{
  "searchDialog": {
    "placeholder": "Search...",
    "noResults": "No results found"
  },
  "themeSwitcher": {
    "light": "Light mode",
    "dark": "Dark mode"
  },
  "copyButton": {
    "copied": "Copied!",
    "copyToClipboard": "Copy to clipboard"
  }
}
```

### Example 5: Code Usage Pattern

```tsx
// ✅ Correct: Use multiple translation sources in pages
import { useTranslations } from 'next-intl'

function ModelDetailPage() {
  const tPage = useTranslations('pages.modelDetail')
  const tShared = useTranslations('shared')

  return (
    <div>
      <h1>{tPage('title')}</h1>
      <button>{tShared('actions.download')}</button>
      <span>{tShared('terms.license')}</span>
      <p>{tPage('description')}</p>
    </div>
  )
}

// ✅ Correct: Use multiple translation sources in components (root-level)
function Header() {
  const tComponent = useTranslations('components.common.header')
  const tShared = useTranslations('shared')

  return (
    <header>
      <h1>{tComponent('aiCodingStack')}</h1>
      <button>{tComponent('openMenu')}</button>
      <nav>
        <a href="/manifesto">{tComponent('manifesto')}</a>
      </nav>
    </header>
  )
}

// ✅ Correct: Use translations for components in subdirectories
function Breadcrumb() {
  const tComponent = useTranslations('components.navigation.breadcrumb')

  return (
    <nav>
      <a href="/">{tComponent('home')}</a>
    </nav>
  )
}

// ❌ Incorrect: Over-reliance on @: in JSON
// pages/model-detail.json
{
  "download": "@:shared.actions.download",  // Don't do this
  "license": "@:shared.terms.license"       // Let code use tShared
}
```

---

## Benefits of These Rules

1. **Maintainability**: Clear structure makes it easy to find and update translations
2. **Scalability**: Supports growth without becoming unwieldy
3. **Developer Experience**: Intuitive organization reduces cognitive load
4. **Type Safety**: Better alignment with code enables stronger typing
5. **Localization Workflow**: Clear process for adding new languages and content
6. **Performance**: Smaller, focused files load faster and are easier to cache

---

## Conclusion

These rules establish a clear, scalable architecture for i18n translations that:
- Aligns with code patterns (tPage + tShared, tComponent + tShared)
- Promotes maintainability through logical file organization
- Simplifies development with English placeholder strategy
- Reduces redundancy by minimizing cross-namespace @: references
- Co-locates related content (metadata with page translations)

**Critical Requirement**: Every page translation file (`pages/*.json`) **MUST include a `meta` section**, even if initially empty. This is a mandatory structural requirement that ensures consistency and enables proper metadata management across all pages.

All future translation work should follow these guidelines.
