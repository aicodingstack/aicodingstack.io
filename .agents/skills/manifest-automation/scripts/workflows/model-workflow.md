# Model manifest workflow

## Read before editing

- `manifests/$schemas/model.schema.json` and referenced schemas
- `src/types/manifests.ts`
- the target manifest and two recent model examples
- the related vendor and provider manifests

## Source priority

1. Official model card, API reference, pricing page, release announcement, and lifecycle/deprecation notice.
2. Official repository or weights page.
3. Reputable benchmark leaderboard for that benchmark only.
4. Third-party aggregators for discovery or explicit secondary verification, never as the sole source for official limits, pricing, or availability.

Search snippets are not evidence. Open the source and verify that it describes the exact model ID/version.

## Field rules

- `releaseDate`: public release/availability date for this exact model, not article update date.
- `lifecycle`: determine from current official availability and deprecation notices; do not mark every older model deprecated.
- `size`: use disclosed parameter information only. Do not estimate closed-model size.
- `contextWindow` and `maxOutput`: keep total context and maximum generated output distinct; check API/model/version scope.
- `tokenPricing`: store USD per million tokens for the documented standard tier. Do not mix batch, regional, long-context, or reseller prices without schema support.
- `knowledgeCutoff`: record only if officially stated for the exact model.
- modalities and capabilities: require explicit documentation or demonstrated API support.
- `platformUrls`: verify the page identifies the exact model.
- benchmarks: record score, benchmark/version, evaluation mode, and source together. Never overwrite a score with a different harness, subset, pass@k, tool policy, or leaderboard version as though they were comparable.

## Create or update

1. Keep filename, `id`, official model name, and vendor ID aligned.
2. Avoid aliases that silently move to a newer model; identify the concrete model represented.
3. Keep unknown optional facts `null` only where allowed. If a required numeric field is undisclosed, do not invent a value; report the schema/data-model blocker.
4. Add `sources` with `fields` mappings for specs, pricing, release/lifecycle, and benchmark evidence.
5. Set `lastVerifiedAt`, `verifiedBy`, and `confidence` according to the actual evidence. `verified: true` means the record was reviewed, not merely generated.
6. Keep translations complete for every locale declared in `src/i18n/config.ts`. Translate descriptions; preserve official model names and technical terms where appropriate.

Strict JSON only. Do not add TODO comments, placeholder sources, or benchmark guesses.

## Validation

Run the parent skill's validation sequence. Recalculate price units manually and inspect benchmark diffs for evaluation incompatibilities.
