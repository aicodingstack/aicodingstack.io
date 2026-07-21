# Vendor manifest workflow

## Read before editing

- `manifests/$schemas/vendor.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two current vendor examples
- manifests that reference the vendor ID

## Evidence checklist

Use the organization's official home/about pages, official repositories, and official social links. Corporate registries or reputable reporting may corroborate identity changes, acquisitions, or shutdowns. Wikipedia and LinkedIn are secondary sources and must not override current first-party information.

## Create or update

1. Keep filename and `id` stable. A corporate rename or acquisition does not automatically justify changing IDs used by other manifests.
2. Use the current official organization name and canonical HTTPS website.
3. Write a factual description within the schema limit; avoid employee counts, headquarters, funding, and similar mutable facts unless the schema needs them.
4. Record only community accounts demonstrably controlled by the organization. Do not infer handles from naming conventions.
5. Before changing or deleting a vendor, inspect all manifest references.
6. Add or refresh provenance and verification metadata for reviewed records.
7. Keep translations complete for every locale declared in `src/i18n/config.ts` and update them together when meaning changes.

Do not add JSON comments, TODOs, placeholder links, or guessed accounts.

## Validation

Run the parent skill's validation sequence and check referential integrity for every product, model, and provider using this vendor ID.
