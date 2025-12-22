# Component & Layout Relationship Diagram

This document outlines the simplified structure and relationships between layouts and components in the AI Coding Stack project.

## Design Principles

1. **Minimal Nesting** - Only 2 layouts total: RootLayout (app/) and PageLayout
2. **Inline Over Abstraction** - Pages compose components directly instead of using specialized layouts
3. **DRY** - Components are reused across pages, layouts are not nested

---

## Structure

```
src/
├── app/[locale]/layout.tsx    [RootLayout - Next.js root layout]
│
├── layouts/
│   └── PageLayout.tsx         [Only layout - Header + Footer + optional schema]
│
└── components/
    ├── Header.tsx             [Site header with navigation]
    ├── Footer.tsx             [Site footer]
    ├── JsonLd.tsx             [Schema.org structured data]
    ├── ThemeProvider.tsx      [Theme context provider]
    ├── ClientLayout.tsx       [Client-side wrapper for interactivity]
    │
    ├── product/               [Product-related components]
    │   ├── ProductHero.tsx    [Product header info]
    │   ├── ProductPricing.tsx [Pricing section]
    │   ├── ProductLinks.tsx   [Resource/community links]
    │   ├── ProductCommands.tsx[Install/launch commands]
    │   ├── RelatedProducts.tsx[Related products grid]
    │   ├── LinkCard.tsx       [Link card component]
    │   └── GitHubStarHistory.tsx [GitHub stars chart]
    │
    ├── navigation/            [Navigation components]
    │   ├── BackToNavigation.tsx ["Back to" link]
    │   ├── Breadcrumb.tsx     [Breadcrumb navigation]
    │   ├── StackMegaMenu.tsx  [AI Coding Stack mega menu]
    │   ├── RankingMegaMenu.tsx[Ranking mega menu]
    │   └── StackTabs.tsx      [Stack category tabs]
    │
    ├── controls/              [UI controls]
    │   ├── CopyButton.tsx
    │   ├── FilterSortBar.tsx
    │   ├── LanguageSwitcher.tsx
    │   ├── SearchDialog.tsx
    │   ├── SearchInput.tsx
    │   └── ThemeSwitcher.tsx
    │
    ├── sidebar/               [Sidebar components]
    │   ├── Sidebar.tsx        [Main sidebar]
    │   └── DocsSidebar.tsx    [Documentation sidebar]
    │
    ├── og/                    [OpenGraph images]
    │   └── OGImageTemplate.tsx
    │
    └── [other components]
        ├── ComparisonTable.tsx       [Comparison data table]
        ├── CollectionScrollbar.tsx   [Horizontal scroll for collections]
        ├── CollectionSection.tsx     [Collection section wrapper]
        ├── CommunityLinks.tsx        [Community links (Twitter, Discord, etc.)]
        ├── MarkdownContent.tsx       [Markdown content renderer]
        ├── MDXComponents.tsx         [MDX component mappings]
        ├── ModelBenchmarks.tsx       [Model benchmark scores]
        ├── ModelSpecifications.tsx   [Model technical specs]
        ├── PageHeader.tsx            [Page header component]
        ├── PlatformIcons.tsx         [Platform icon display]
        ├── PlatformLinks.tsx         [Platform links (HuggingFace, etc.)]
        ├── VendorModels.tsx          [Vendor's models grid]
        ├── VendorProducts.tsx        [Vendor's products grid]
        └── VerifiedBadge.tsx         [Verified checkmark badge]
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYOUT STRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RootLayout (Next.js app/[locale]/layout.tsx)                              │
│  ├── Provides: i18n, theme, basic HTML structure                          │
│  └── NOT counted as a "layout" for this project                            │
│                                                                             │
│  PageLayout (src/layouts/PageLayout.tsx)                                  │
│  ├── Provides: JsonLd (optional), Header, Footer                          │
│  └── Used by: ALL pages                                                    │
│                                                                             │
│  All pages use PageLayout and compose their own content:                  │
│                                                                             │
│  <PageLayout schema={schema}>                                              │
│    <Breadcrumb items={...} />                                              │
│    <ProductHero {...props} />                                              │
│    <OtherSection {...props} />                                             │
│    <BackToNavigation href="/..." title="..." />                            │
│  </PageLayout>                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Page Usage Examples

### IDE/CLI/Extension Detail Pages
```tsx
<PageLayout schema={schema}>
  <Breadcrumb items={...} />
  <ProductHero {...product} />
  <RelatedProducts products={...} />
  <ProductPricing pricing={...} />
  <ProductLinks links={...} />
  <ProductCommands commands={...} />
  <BackToNavigation href="/ides" title="All IDEs" />
</PageLayout>
```

### Model Detail Pages
```tsx
<PageLayout schema={schema}>
  <Breadcrumb items={...} />
  <ProductHero {...model} />
  <PlatformLinks urls={...} />
  <ModelSpecifications model={...} />
  <ModelBenchmarks benchmarks={...} />
  <BackToNavigation href="/models" title="All Models" />
</PageLayout>
```

### Vendor/Provider Detail Pages
```tsx
<PageLayout schema={schema}>
  <Breadcrumb items={...} />
  <ProductHero {...organization} />
  <PlatformLinks urls={...} />      <!-- Providers -->
  <CommunityLinks urls={...} />     <!-- Vendors & Providers -->
  <VendorProducts products={...} /> <!-- Vendors -->
  <VendorModels models={...} />     <!-- Vendors -->
  <BackToNavigation href="/..." title="..." />
</PageLayout>
```

---

## Component Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT DEPENDENCIES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PageLayout                                                                 │
│  ├── JsonLd                                                                │
│  ├── Header                                                                │
│  │   ├── SearchDialog                                                      │
│  │   ├── StackMegaMenu                                                     │
│  │   ├── RankingMegaMenu                                                   │
│  │   └── i18n Link                                                         │
│  └── Footer                                                                │
│      ├── LanguageSwitcher                                                   │
│      └── ThemeSwitcher                                                     │
│                                                                             │
│  Pages compose components directly:                                        │
│  ├── Breadcrumb                                                            │
│  ├── ProductHero                                                           │
│  │   ├── VerifiedBadge                                                     │
│  │   └── PlatformIcons                                                     │
│  ├── RelatedProducts → LinkCard                                            │
│  ├── ProductPricing                                                        │
│  ├── ProductLinks                                                          │
│  ├── ProductCommands → CopyButton                                          │
│  ├── PlatformLinks → PlatformIcons                                         │
│  ├── CommunityLinks → PlatformIcons                                        │
│  ├── ModelSpecifications                                                   │
│  ├── ModelBenchmarks                                                       │
│  ├── VendorProducts → LinkCard                                             │
│  ├── VendorModels → LinkCard                                               │
│  ├── BackToNavigation                                                      │
│  ├── ComparisonTable                                                       │
│  ├── CollectionScrollbar                                                   │
│  ├── CollectionSection                                                     │
│  ├── MarkdownContent                                                       │
│  ├── MDXComponents                                                         │
│  ├── PageHeader                                                            │
│  ├── Sidebar                                                               │
│  └── DocsSidebar                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Page → Layout/Component Matrix

| Page Type | Layout | Components Used |
|-----------|--------|-----------------|
| IDE Detail | PageLayout | Breadcrumb, ProductHero, RelatedProducts, ProductPricing, ProductLinks, ProductCommands, BackToNavigation |
| CLI Detail | PageLayout | Breadcrumb, ProductHero, RelatedProducts, ProductPricing, ProductLinks, ProductCommands, BackToNavigation |
| Extension Detail | PageLayout | Breadcrumb, ProductHero, RelatedProducts, ProductPricing, ProductLinks, ProductCommands, BackToNavigation |
| Model Detail | PageLayout | Breadcrumb, ProductHero, PlatformLinks, ModelSpecifications, ModelBenchmarks, BackToNavigation |
| Vendor Detail | PageLayout | Breadcrumb, ProductHero, CommunityLinks, VendorProducts, VendorModels, BackToNavigation |
| Provider Detail | PageLayout | Breadcrumb, ProductHero, PlatformLinks, CommunityLinks, BackToNavigation |
| Homepage/Listings | PageLayout | Custom components |
| Article/Docs | PageLayout | MarkdownContent, etc. |

---

## Key Design Patterns

### 1. Single Layout Pattern
- Only 1 layout: `PageLayout`
- Pages compose components directly
- No layout inheritance or nesting

### 2. Component Composition
- Each page imports the components it needs directly
- Components are reusable (ProductHero, PlatformLinks, etc.)
- No "smart layouts" that know about page specifics
- Direct imports from component paths (no barrel exports)

---

## Migration Notes

### Before (nested layouts):
```
EntityDetailLayout (base)
└── VendorEntityDetailLayout (extends base, adds ProductHero)
    └── ProductDetailLayout (adds product sections)
```

### After (flat):
```
PageLayout (Header + Footer)
└── Page directly composes components
```

### Benefits:
1. **No layout nesting** - Clear data flow
2. **Explicit composition** - Page code shows exactly what components are used
3. **Easier to modify** - Change one page without affecting others
4. **Better testability** - Components can be tested independently
5. **Simpler mental model** - Only 1 layout to understand
