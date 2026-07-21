---
name: manifest-automation
description: Prepares and guides evidence-backed creation or updates of CLI, extension, IDE, model, provider, and vendor manifests in this repository. Use when manifest data must be researched, merged, localized, and validated against the current schemas.
---

# Manifest Automation

Use this skill as a guarded workflow, not as an autonomous web scraper. The helper prints the current schema path, output path, and type-specific checklist; the agent performs research and edits.

## Start

```bash
node .agents/skills/manifest-automation/scripts/automate.mjs create model example-model https://example.com/model
node .agents/skills/manifest-automation/scripts/automate.mjs update model existing-model
```

Supported types: `cli`, `extension`, `ide`, `model`, `provider`, and `vendor`.

## Required workflow

1. Run the helper and read the referenced schema and type-specific workflow completely.
2. Inspect the target manifest, related vendor/provider manifests, `src/types/manifests.ts`, and nearby examples.
3. Research current facts. Prefer official documentation, model cards, release notes, repositories, and official marketplaces. Use third-party sources only for discovery or clearly attributed secondary evidence.
4. Record provenance using the fields required by the current schema. Every mutable or consequential fact must be traceable to a source.
5. Edit strict JSON only. JSON comments, placeholders, guessed values, and invented URLs are forbidden. If a required fact cannot be verified, stop and report it; use `null` only where the schema explicitly permits it.
6. Support all configured locales. English top-level copy and every locale entry must remain semantically aligned.
7. For updates, preserve curated relationships and translations unless evidence supports a change. Do not replace stronger evidence with weaker evidence or combine incompatible benchmark harnesses.
8. Review the diff, then run the validation commands printed by the helper.

## Merge policy

- Immutable identity fields such as `id` are preserved.
- Mutable facts may change only with current, authoritative evidence.
- Object arrays are merged by their schema identity, not by raw object equality.
- Pricing, license, lifecycle, availability, model limits, install commands, and marketplace identifiers require explicit verification.
- Removing an existing value requires evidence that it is obsolete or incorrect.
- Update `lastVerifiedAt`, `verifiedBy`, `confidence`, and `sources` consistently with the actual review performed.

The merge helper is advisory. Always inspect its proposed result before applying it.

## GitHub stars

`data/github-stars.json` tracks only `cli`, `extension`, `ide`, and `model` entries. Add an entry only when the entity has an official GitHub repository and the repository's fetch workflow supports that manifest. Providers and vendors are not tracked.

## Validation

At minimum run:

```bash
npm run changelog:generate
npm run generate
npm run test:validate
npm run validate:i18n
npm run data-health:check
```

Run `npm run check` and `npm run test:ci` before handing off a release-ready change.
