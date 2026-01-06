# Manifest Internationalization (i18n)

**Last Updated:** January 6, 2026

This document describes how internationalization works for manifest data in AI Coding Stack.

---

## Overview

Manifest_i18n provides localization support for items in the manifest JSON files. It allows product names, descriptions, and other fields to be displayed in different languages without creating duplicate JSON entries.

**Implementation**: `src/lib/manifest-i18n.ts`

---

## Supported Locales

The system supports these locales (defined in `src/i18n/config.ts`):

| Locale | Code | Language |
|--------|------|----------|
| English | `en` | Default locale |
| Simplified Chinese | `zh-Hans` | 简体中文 |
| German | `de` | Deutsch |
| Korean | `ko` | 한국어 |

---

## Translation Structure in Manifests

Each manifest entry can include an optional `translations` object:

```json
{
  "id": "cursor",
  "name": "Cursor",
  "description": "AI-first code editor designed for pair programming with AI",
  "translations": {
    "zh-Hans": {
      "name": "Cursor 编辑器",
      "description": "专为与 AI 进行结对编程而设计的 AI 驱动代码编辑器"
    },
    "de": {
      "name": "Cursor",
      "description": "KI-zuerst Code-Editor, entwickelt für Pair Programming mit KI"
    },
    "ko": {
      "name": "Cursor",
      "description": "AI와의 페어 프로그래밍을 위해 설계된 AI 우선 코드 에디터"
    }
  }
}
```

---

## API Reference

### `localizeManifestItem`

Localizes a single manifest item.

```typescript
function localizeManifestItem<T extends Record<string, unknown>>(
  item: T,
  locale: Locale,
  fields?: (keyof T)[]
): T
```

**Parameters:**
- `item` - The manifest item with potential translations
- `locale` - Target locale (`'en' | 'zh-Hans' | 'de' | 'ko'`)
- `fields` - Array of field names to localize (default: `['description']`)

**Returns:** A new object with localized fields.

**Behavior:**
- Returns the original item if `locale` is the default locale (`en`)
- Returns the original item if no translations exist for the target locale
- Only modifies the specified fields; all other fields are preserved

**Example:**

```typescript
import { localizeManifestItem } from '@/lib/manifest-i18n'

const cursor = {
  name: 'Cursor',
  description: 'AI-first code editor',
  translations: {
    'zh-Hans': {
      description: 'AI 驱动的代码编辑器'
    }
  }
}

// Localize description only
const localizedZh = localizeManifestItem(cursor, 'zh-Hans')
// Returns: { name: 'Cursor', description: 'AI 驱动的代码编辑器', translations: {...} }

// Localize both name and description
const localizedZhBoth = localizeManifestItem(cursor, 'zh-Hans', ['name', 'description'])
// Returns: { name: 'Cursor 编辑器', description: 'AI 驱动的代码编辑器', ... }
```

---

### `localizeManifestItems`

Localizes an array of manifest items.

```typescript
function localizeManifestItems<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fields?: (keyof T)[]
): T[]
```

**Parameters:**
- `items` - Array of manifest items
- `locale` - Target locale
- `fields` - Array of field names to localize

**Returns:** A new array with localized items.

**Example:**

```typescript
import { localizeManifestItems } from '@/lib/manifest-i18n'

const ides = [
  { name: 'Cursor', description: 'AI editor', translations: { 'zh-Hans': { description: 'AI 编辑器' } } },
  { name: 'VS Code', description: 'Microsoft editor', translations: { 'zh-Hans': { description: 'Microsoft 编辑器' } } }
]

const localized = localizeManifestItems(ides, 'zh-Hans')
// Returns array with localized descriptions
```

---

## Usage Patterns

### 1. Localize for Page Display

```typescript
import { getManifest } from '@/lib/generated/manifesto'
import { localizeManifestItems } from '@/lib/manifest-i18n'

export default async function IDEsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const ides = await getManifest('ides')

  // Localize descriptions for non-default locale
  const localizedIdes = locale !== 'en'
    ? localizeManifestItems(ides, locale, ['description', 'name'])
    : ides

  return (
    <div>
      {localizedIdes.map(ide => (
        <div key={ide.id}>
          <h2>{ide.name}</h2>
          <p>{ide.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Localize Specific Fields Only

```typescript
import { getManifest } from '@/lib/generated/manifesto'
import { localizeManifestItem } from '@/lib/manifest-i18n'

const ide = await getManifestEntry('ides', 'cursor')

// Only localize description, keep name in English
const localized = localizeManifestItem(ide, 'zh-Hans', ['description'])
```

### 3. Localize with Type Guard

```typescript
import { localizeManifestItem } from '@/lib/manifest-i18n'
import type { ManifestIDE } from '@/types/manifests'

const ide = await getManifestEntry<ManifestIDE>('ides', 'cursor')
const localized = localizeManifestItem<ManifestIDE>(ide, 'de', ['description'])
```

---

## Fallback Behavior

### Default Locale

When the requested locale is `en` (default), no localization is applied:

```typescript
const item = { name: 'Cursor', description: 'AI editor', translations: { ... } }
const result = localizeManifestItem(item, 'en')
// result === item (no processing)
```

### Missing Translations

If translations don't exist for the target locale, the original values are used:

```typescript
const item = {
  name: 'Cursor',
  description: 'AI editor',
  translations: {
    'zh-Hans': { description: 'AI 编辑器' }
  }
}

// Request German - not in translations
const result = localizeManifestItem(item, 'de')
// Returns: { name: 'Cursor', description: 'AI editor', ... }
```

### Missing Fields in Translations

If a field is requested but not present in the translations, the original value is used:

```typescript
const item = {
  name: 'Cursor',
  description: 'AI editor',
  translations: {
    'zh-Hans': { description: 'AI 编辑器' }  // name not translated
  }
}

// Request both name and description
const result = localizeManifestItem(item, 'zh-Hans', ['name', 'description'])
// Returns: { name: 'Cursor', description: 'AI 编辑器', ... }
```

---

## TypeScript Types

```typescript
import type { Locale } from '@/i18n/config'

/**
 * Interface for manifest items with translations support
 */
export interface ManifestItemWithTranslations {
  description?: string
  name?: string
  translations?: {
    [locale: string]: {
      description?: string
      name?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}
```

---

## Best Practices

### 1. Always Use Default Locale First

```typescript
// Good: Only localize when needed
const localized = locale === defaultLocale
  ? items
  : localizeManifestItems(items, locale)

// Avoid: Always localizing (unnecessary work)
const localized = localizeManifestItems(items, locale)
```

### 2. Specify Fields Explicitly

```typescript
// Good: Explicit field list
const localized = localizeManifestItems(items, locale, ['description', 'name'])

// Acceptable: Use default (description only)
const localized = localizeManifestItems(items, locale)
```

### 3. Keep Translations Complete

When adding translations, translate all requested fields:

```json
{
  "translations": {
    "zh-Hans": {
      "name": "Cursor 编辑器",
      "description": "产品描述"
    }
  }
}
```

### 4. Use Consistent Locale Codes

Always use the locale codes defined in `src/i18n/config.ts`:

- ✅ `'zh-Hans'`
- ❌ `'zh-CN'` or `'zh'`
- ✅ `'de'`
- ✅ `'ko'`

---

## Integration with Next.js i18n

The manifest i18n system integrates with Next.js internationalization:

```typescript
import { getTranslations } from 'next-intl/server'
import { localizeManifestItems } from '@/lib/manifest-i18n'

export default async function Page({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'common' })

  // UI translations via next-intl
  const pageTitle = t('welcome')

  // Manifest translations via manifest-i18n
  const items = await getManifest('ides')
  const localizedItems = locale !== 'en'
    ? localizeManifestItems(items, locale)
    : items

  return <div>{/* ... */}</div>
}
```

---

## Testing

```typescript
import { localizeManifestItem } from '@/lib/manifest-i18n'

describe('localizeManifestItem', () => {
  it('should not modify items for default locale', () => {
    const item = { name: 'Test', description: 'Description' }
    const result = localizeManifestItem(item, 'en')
    expect(result).toBe(item)
  })

  it('should apply available translations', () => {
    const item = {
      name: 'Test',
      description: 'Description',
      translations: {
        'zh-Hans': { description: '描述' }
      }
    }

    const result = localizeManifestItem(item, 'zh-Hans')
    expect(result.description).toBe('描述')
  })

  it('should handle missing translations', () => {
    const item = { name: 'Test', description: 'Description', translations: {} }
    const result = localizeManifestItem(item, 'zh-Hans')
    expect(result.description).toBe('Description') // Fallback
  })
})
```

---

## Performance Considerations

- The functions create new objects (not in-place modification)
- For arrays, a new array is created with new objects
- For default locale, no processing occurs (returns original object)
- Cache localized results when possible in React components

---

**Related Documents:**
- [SCHEMA-ALIGNMENT.md](./SCHEMA-ALIGNMENT.md) - Schema structure reference
- [CLAUDE.md](../CLAUDE.md) - Project i18n guidelines

**Last Updated:** January 6, 2026
