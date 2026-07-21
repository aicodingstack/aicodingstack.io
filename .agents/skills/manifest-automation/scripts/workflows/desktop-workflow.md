# Desktop manifest workflow

## Read before editing

- `manifests/$schemas/desktop.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two current desktop examples
- related CLI, extension, IDE, and vendor manifests

## Classification boundary

Use `desktop` for a standalone native application whose primary workflow is delegating, coordinating, or reviewing coding-agent work. A product may share one `familyId` with CLI or extension surfaces. Keep editor-first products under `ide`, and exclude browser-only, hosted, and cloud execution products.

## Evidence checklist

Use the official product/download page, documentation, release notes, repository, pricing page, and license. Verify that the native desktop build actually exists for each recorded OS. Do not infer a Windows or Linux build from a generic product page.

## Create or update

1. Keep filename, `id`, official name, vendor, and `familyId` aligned.
2. Record only schema-supported operating systems and documented install or launch commands.
3. Do not invent application paths; use `null` when an optional value is undocumented.
4. Use the latest stable version when published; otherwise use the vendor's documented release label without inventing a number.
5. Copy pricing and license facts without conversion or extrapolation.
6. Add bidirectional `relatedProducts` links for verified CLI, extension, IDE, or desktop siblings.
7. Keep every configured locale complete and semantically aligned.

## Validation

Run the parent skill's validation sequence. Confirm that GitHub stars, generated indexes, navigation counts, vendor pages, search, sitemap, and related-product links all include the new desktop manifest.
