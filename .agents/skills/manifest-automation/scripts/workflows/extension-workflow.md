# Extension manifest workflow

## Read before editing

- `manifests/$schemas/extension.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two current extension examples
- the related vendor and IDE manifests

## Evidence checklist

Use the publisher's official site/docs plus the canonical marketplace listing. Verify the publisher ID, extension ID, stable version, supported IDEs, marketplace URL, install URI, license, pricing, and repository ownership.

Marketplace compatibility is evidence-specific:

- A VS Code Marketplace listing does not prove a dedicated Cursor, Windsurf, or Trae listing.
- Record only URL prefixes and install URI schemes accepted by the schema.
- Use `null` where the schema allows it when a marketplace or one-click URI does not exist.
- Do not manufacture install URIs from a display name; use the exact publisher/extension identifier.

## Create or update

1. Keep filename, `id`, vendor ID, and official name aligned.
2. Use a current stable marketplace version for `latestVersion`.
3. Treat marketplace descriptions and install counts as mutable; do not copy unsupported claims into the concise description.
4. Use an SPDX identifier or `Proprietary` for `license`.
5. Keep pricing units exact and do not infer bundled-product entitlements.
6. Merge `supportedIdes` by `ideId`; review changed marketplace URLs rather than silently appending duplicates.
7. Preserve curated `relatedProducts` unless verified.
8. Add or refresh provenance fields to reflect the sources reviewed.
9. Keep translations complete and semantically aligned across every locale declared in `src/i18n/config.ts`.

Strict JSON only: no comments, TODOs, placeholder URLs, or guessed compatibility.

## Validation

Run the parent skill's validation sequence and verify every marketplace URL and install URI against the schema patterns.
