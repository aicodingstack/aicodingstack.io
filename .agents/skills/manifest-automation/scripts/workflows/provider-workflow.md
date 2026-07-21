# Provider manifest workflow

## Read before editing

- `manifests/$schemas/provider.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two current provider examples
- the related vendor manifest

## Evidence checklist

Use the provider's official website, API documentation, model catalog, account/key page, and official community links. Determine `type` from what the organization currently offers:

- `foundation-model-provider`: develops and serves its own foundation models;
- `model-service-provider`: primarily aggregates or serves models from other vendors.

If both apply, choose the category that matches the manifest's represented service and explain the decision in the review notes.

## Create or update

1. Keep filename, `id`, official name, and vendor ID aligned.
2. Use the direct HTTPS account/API-key page for `applyKeyUrl`; use `null` only if keys are not applicable or no public flow exists.
3. Record platform pages only when they represent this provider, not merely one similarly named model.
4. Source community URLs from official site navigation or verified official accounts. LinkedIn and Wikipedia are secondary evidence, not authoritative replacements for first-party sources.
5. Summarize the service in no more than the schema limit without unsupported superlatives.
6. Add or refresh provenance and verification metadata.
7. Keep translations complete and aligned across every locale declared in `src/i18n/config.ts`.

No JSON comments, TODOs, guessed handles, or URL-pattern assumptions.

## Validation

Run the parent skill's validation sequence and manually verify `type`, `applyKeyUrl`, and every platform URL.
