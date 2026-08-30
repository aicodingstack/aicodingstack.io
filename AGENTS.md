# AGENTS.md

## Internationalization

- Translation resources live under `translations/`. Every page, module, and data change must support every locale configured in `src/i18n/config.ts`; never hardcode a locale subset.
- Always use `Link` from `@/i18n/navigation`, not the Next.js default.
- Localize page metadata and reuse existing translation keys and shared phrases before adding new ones.
- Follow [docs/I18N-ARCHITECTURE-RULES.md](docs/I18N-ARCHITECTURE-RULES.md): keep page and component translations in their prescribed namespaces, co-locate page metadata under `meta`, and minimize cross-namespace `@:` references.
- Add new keys to every locale with English placeholders first; perform proper translation as a separate batch.

## Data and Schema

- Never store product, catalog, editorial, ranking, pricing, benchmark, configuration, or other independently adjustable data in `.ts` or `.tsx` files.
- Store data in schema-validated JSON under `data/`, the appropriate manifest, or translation resources. This includes curated selections, display order, metadata, prices, scores, timelines, chart-label placement, and ranking weights.
- TypeScript may contain types, loaders, validators, transformations, calculations, presentation logic, and implementation-only constants with no product or editorial meaning. When uncertain, treat a value as data.
- Update the JSON schema, corresponding TypeScript type, and validation tests together whenever a data shape changes.
- Keep `src/types/manifests.ts` in one-to-one correspondence with the schemas under `manifests/$schemas/`.
- Follow [docs/DATA-TRUST.md](docs/DATA-TRUST.md) for provenance, source priority, verification metadata, and freshness requirements when adding or materially updating data.

## Design

- Use the existing extremely minimalist visual language: sharp corners, restrained low-saturation color, and accents only where necessary.
- Prefer Lucide SVG icons; do not use emoji or text characters as icons.
- Use `max-w-8xl` globally and `max-w-6xl` for content pages and the homepage.

## Metadata and SEO

- Use route-level `opengraph-image.tsx` files; do not manually set OpenGraph image paths. OG images are 1200×630 and follow the design system.
- Wrap data fetchers shared by `generateMetadata()` and page rendering with React `cache()`.
- Use `Locale` from `@/i18n/config` for locale types.

## Development Workflow

- Do not start `pnpm dev` automatically; the user starts it when needed.
- Before every `.next/standalone/server.js` start, including after each production build, sync `public/` to `.next/standalone/public/` and `.next/static/` to `.next/standalone/.next/static/`.
- Match standalone `HOSTNAME` to the preview URL hostname. For `http://localhost:<port>`, use `HOSTNAME=localhost`, never `127.0.0.1`.
- After each standalone start or restart, verify a default-locale URL, a locale-prefixed URL, and a referenced stylesheet all return `200`, with the stylesheet served as CSS. A tmux start command must include asset sync and the matching `HOSTNAME`.
- Never create a commit without asking the user first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
