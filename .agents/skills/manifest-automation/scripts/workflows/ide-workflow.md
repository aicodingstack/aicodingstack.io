# IDE manifest workflow

## Read before editing

- `manifests/$schemas/ide.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two current IDE examples
- the related vendor manifest

## Evidence checklist

Use official download pages, system requirements, release notes, documentation, pricing, and licensing information. Verify the stable version independently for each release channel when channels differ.

For platform data:

- record only OS values supported by the schema;
- distinguish an installer/download URL from an install command;
- do not invent default filesystem paths;
- record CLI launch commands only when documented;
- represent unavailable optional values as schema-valid `null`.

## Create or update

1. Keep filename, `id`, official name, and vendor ID aligned.
2. Use the latest stable version, not an insider/nightly build unless explicitly represented as such.
3. Use an SPDX identifier or `Proprietary` for the license.
4. Copy pricing values and billing units without conversion or extrapolation.
5. Preserve curated product relationships unless verified.
6. Add or refresh source and verification metadata based on current evidence.
7. Keep translations complete for every locale declared in `src/i18n/config.ts` and update them together when English meaning changes.

Never store JSON comments, TODOs, guessed paths, or placeholder links.

## Validation

Run the parent skill's validation sequence. Manually review platform entries for copied CLI instructions that do not apply to the desktop application.
