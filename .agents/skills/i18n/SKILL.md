---
name: i18n
description: Audits, synchronizes, and prepares translation work for the repository's next-intl UI resources under translations/. Use when UI translation keys or locale content change.
---

# I18n management

This skill manages UI messages under `translations/`. Manifest-localized content under `manifests/**/translations` belongs to the manifest workflow.

Read `docs/I18N-ARCHITECTURE-RULES.md` before reorganizing namespaces. The enabled locale list in `src/i18n/config.ts` is authoritative; currently all 12 locales are required.

## Current structure

- `translations/{locale}/shared.json`
- `translations/{locale}/components/{common,controls,navigation,product,sidebar}.json`
- `translations/{locale}/pages/*.json`
- `translations/{locale}/index.ts`

Do not recreate the retired monolithic `components.json` or old page names. Keep each locale's JSON file/key structure aligned with English, but preserve the namespace architecture defined by the project document.

## Synchronize keys safely

Preview first; the default command is read-only and exits non-zero when drift exists:

```bash
node .agents/skills/i18n/scripts/sync.mjs --check
```

After reviewing the report, apply structural synchronization explicitly:

```bash
node .agents/skills/i18n/scripts/sync.mjs --write
```

Write mode adds missing keys with English placeholders and removes extra keys inside matching JSON files. It does not delete extra files; review those manually because a file may represent an in-progress namespace migration. Always inspect the Git diff.

The sync helper manages JSON only. When adding, renaming, or removing a namespace file, update every locale's `index.ts` explicitly and validate the import/export shape.

## Prepare a translation batch

```bash
node .agents/skills/i18n/scripts/translate.mjs ja
```

The script emits translation candidates: missing values and values exactly equal to English, grouped by file. Some exact matches are intentionally shared product names or technical terms and should remain unchanged after review. It deliberately does not use a Latin-letter heuristic because legitimate German, Spanish, brand names, code, and technical terms contain Latin characters. The agent applies reviewed translations with normal repository edits; the script does not apply generated text.

When translating:

- preserve ICU/next-intl placeholders, plural/select branches, tags, URLs, paths, code, and `@:` references exactly;
- reuse existing terminology before inventing a new translation;
- preserve product/model names unless an official localized name exists;
- translate meaning in page context, not isolated words;
- update all affected locales in the same change; English placeholders are only a temporary synchronization state.

## Validate

```bash
pnpm validate:i18n
pnpm validate:i18n-usage
pnpm validate:i18n-duplicates
pnpm test:validate
```

For release-ready work, also run `pnpm check` and `pnpm test:ci`.
