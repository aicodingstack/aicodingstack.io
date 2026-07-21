# CLI manifest workflow

## Read before editing

- `manifests/$schemas/cli.schema.json` and every referenced schema
- `src/types/manifests.ts`
- the target manifest and two current CLI examples
- the related vendor manifest

The schema is authoritative. Do not copy an old manifest's omissions into a new record.

## Evidence checklist

Use official sources for the product name, description, website, documentation, stable version, license, pricing, downloads, changelog, install commands, launch commands, and supported operating systems. Prefer release pages or package registries owned by the vendor over blog posts. Verify a GitHub repository belongs to the product before recording it.

For every platform entry:

- use only schema-supported OS values;
- copy install commands exactly from current official instructions;
- distinguish a package installation command from a launch command;
- use `null` only when the schema permits it and the value is genuinely unavailable or inapplicable.

## Create or update

1. Keep `id` stable and ensure it matches the filename.
2. Keep `vendor` aligned with an existing vendor ID; create a vendor separately if needed.
3. Summarize the official description in no more than the schema limit; do not use marketing claims as facts.
4. Use a stable release for `latestVersion`, not a beta unless the product has no stable channel and the distinction is documented.
5. Use an SPDX identifier or the literal `Proprietary` for `license`.
6. Record current pricing units and currencies exactly. Do not infer annual/monthly conversions.
7. Preserve curated `relatedProducts` unless relationships were explicitly verified.
8. Add or refresh `sources`, `lastVerifiedAt`, `verifiedBy`, and `confidence` to match the evidence actually reviewed.
9. Keep translations complete for every locale declared in `src/i18n/config.ts` and update them together when English meaning changes.

Do not put TODOs, comments, placeholder URLs, or guessed paths into JSON. Report unresolved facts outside the manifest.

## Validation

Run the validation sequence in the parent skill. If install commands changed, also inspect the rendered diff for shell quoting and platform mix-ups.
