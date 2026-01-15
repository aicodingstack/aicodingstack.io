# Manifest Internationalization (i18n)

**Last Updated:** January 6, 2026

---

## Overview

The AI Coding Stack has **two separate internationalization systems** that share the same locale configuration:

1. **UI Translation System** - Translates static UI strings using `next-intl`
2. **Manifest Translation System** - Translates manifest data (using the same locales)

---

## System 1: UI Translation System (next-intl)

### Supported Locales

| Locale | Code | Status |
|--------|------|--------|
| English | `en` | ✅ Default |
| German | `de` | ✅ Full |
| Spanish | `es` | ✅ Full |
| French | `fr` | ✅ Full |
| Indonesian | `id` | ✅ Full |
| Japanese | `ja` | ✅ Full |
| Korean | `ko` | ✅ Full |
| Portuguese | `pt` | ✅ Full |
| Russian | `ru` | ✅ Full |
| Turkish | `tr` | ✅ Full |
| Simplified Chinese | `zh-Hans` | ✅ Full |
| Traditional Chinese | `zh-Hant` | ✅ Full |

### Configuration

**File:** `src/i18n/config.ts`

```typescript
export const defaultLocale = 'en'
export const locales = ['en', 'de', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh-Hans', 'zh-Hant']
```

### Translation Files

**Directory:** `translations/{locale}/`

```
translations/
├── en/                    # English (default)
│   ├── components.json    # Component translations
│   ├── pages/             # Page-specific translations
│   │   ├── home.json
│   │   ├── articles.json
│   │   ├── comparison.json
│   │   └── ...
│   ├── shared.json        # Shared translations
│   └── index.ts           # Entry point
├── zh-Hans/               # Simplified Chinese
└── ... (other locales)
```

### Usage in Components

```typescript
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const tComponent = useTranslations('shared')
  return <h1>{tComponent('welcome')}</h1>
}
```

### Usage in Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const tPage = await getTranslations('home')
  return <h1>{t('title')}</h1>
}
```

### Navigation

**File:** `src/i18n/navigation.ts`

The `Link` component provides localized routing:

```typescript
import { Link } from '@/i18n/navigation'

// Automatically prepends the locale to the URL
<Link href="/ides">IDEs</Link>  // → /en/ides or /zh-Hans/ides
```

---

## System 2: Manifest Translation System

### Purpose

Translates manifest data (IDEs, CLIs, models, etc.) using the same **12 locales** as the UI system:

| Locale | Code | Status |
|--------|------|--------|
| English | `en` | ✅ Default (no translation needed) |
| German | `de` | ✅ Supported via translations field |
| Spanish | `es` | ✅ Supported via translations field |
| French | `fr` | ✅ Supported via translations field |
| Indonesian | `id` | ✅ Supported via translations field |
| Japanese | `ja` | ✅ Supported via translations field |
| Korean | `ko` | ✅ Supported via translations field |
| Portuguese | `pt` | ✅ Supported via translations field |
| Russian | `ru` | ✅ Supported via translations field |
| Turkish | `tr` | ✅ Supported via translations field |
| Simplified Chinese | `zh-Hans` | ✅ Supported via translations field |
| Traditional Chinese | `zh-Hant` | ✅ Supported via translations field |

### Core Module: `src/lib/manifest-i18n.ts`

```typescript
function localizeManifestItem<T>(
  item: T,
  locale: Locale,  // Any of the 18 supported locales
  fields: (keyof T)[] = ['description']
): T

function localizeManifestItems<T>(
  items: T[],
  locale: Locale,
  fields?: (keyof T)[]
): T[]
```

### Translation Structure

Manifest items support translations through:

```jsonc
{
  "id": "cursor",
  "name": "Cursor",
  "description": "An AI-powered code editor",
  "translations": {
    "zh-Hans": {
      "name": "Cursor",
      "description": "一款 AI 驱动的代码编辑器"
    },
    "de": {
      "name": "Cursor",
      "description": "Ein AI-gesteuerter Code-Editor"
    },
    "ko": {
      "name": "Cursor",
      "description": "AI 기반 코드 에디터"
    }
  }
}
```

### Usage Example

```typescript
import { localizeManifestItems } from '@/lib/manifest-i18n'
import { ides } from '@/lib/generated/ides'
import type { Locale } from '@/i18n/config'

export default function IDEList({ locale }: { locale: Locale }) {
  const translatedIDEs = localizeManifestItems(ides, locale, ['description'])

  return (
    <ul>
      {translatedIDEs.map(ide => (
        <li key={ide.id}>{ide.description}</li>
      ))}
    </ul>
  )
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    I18N SYSTEMS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  Shared Locale Configuration:                                  │
│  12 locales (en, de, es, fr, id, ja, ko, pt, ru, tr,         │
│               zh-Hans, zh-Hant)                                │
│                                                                │
│  UI TRANSLATIONS (next-intl)                                    │
│  ├── Uses: translations/{locale}/*.json                        │
│  └── Used for: static UI strings                               │
│                                                                │
│  MANIFEST TRANSLATIONS (manifest-i18n.ts)                       │
│  ├── Uses: item.translations field                             │
│  └── Used for: manifest data (names, descriptions)             │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Translation Coverage

### UI Content ✅

All 12 locales have full UI translation coverage.

### Manifest Data ⚠️

The translation infrastructure is fully implemented, but actual translations need to be added to individual manifest files. Coverage varies by manifest type.

### Adding Manifest Translations

Include translations for all supported locales in manifest files:

```jsonc
{
  "id": "my-tool",
  "name": "My Tool",
  "description": "A great development tool",
  "translations": {
    "zh-Hans": {
      "name": "我的工具",
      "description": "一个很棒的开发工具"
    },
    "zh-Hant": {
      "name": "我的工具",
      "description": "一個很棒的開發工具"
    },
    "de": {
      "name": "Mein Werkzeug",
      "description": "Ein großartiges Entwicklungswerkzeug"
    },
    "es": {
      "name": "Mi Herramienta",
      "description": "Una gran herramienta de desarrollo"
    },
    "fr": {
      "name": "Mon Outil",
      "description": "Un excellent outil de développement"
    },
    "id": {
      "name": "Alat Saya",
      "description": "Alat pengembangan yang hebat"
    },
    "ja": {
      "name": "私のツール",
      "description": "素晴らしい開発ツール"
    },
    "ko": {
      "name": "내 도구",
      "description": "훌륭한 개발 도구"
    },
    "pt": {
      "name": "Minha Ferramenta",
      "description": "Uma ótima ferramenta de desenvolvimento"
    },
    "ru": {
      "name": "Мой инструмент",
      "description": "Отличный инструмент для разработки"
    },
    "tr": {
      "name": "Araçım",
      "description": "Harika bir geliştirme aracı"
    }
  }
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/config.ts` | Locale configuration |
| `src/i18n/navigation.ts` | Localized Link component |
| `src/i18n/lib-core.ts` | Reference resolution |
| `src/i18n/request.ts` | Request config for next-intl |
| `src/lib/manifest-i18n.ts` | Manifest translation layer |
| `translations/{locale}/` | UI translation files |

---

## Best Practices

### 1. Always Use Localized Link

```typescript
// ✅ Correct
import { Link } from '@/i18n/navigation'

// ❌ Incorrect
import Link from 'next/link'
```

### 2. Use Translation Keys, Don't Hardcode

```typescript
// ✅ Correct
const tShared = useTranslations('shared')
return <button>{tShared('submit')}</button>

// ❌ Incorrect
return <button>Submit</button>
```

### 3. Manifest Translation Fields

Default translated field is `description`. Other fields can be translated:

```typescript
localizeManifestItem(item, locale, ['name', 'description'])
```

---

## Related Documentation

- `specs.md` - Project specifications
- `COMPONENT-RELATIONSHIP-DIAGRAM.md` - Architecture overview
- `SCHEMA-ARCHITECTURE.md` - Schema system details

---

**Version:** 2.0
**Last Updated:** January 6, 2026
