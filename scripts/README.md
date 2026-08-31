# Scripts

Repository automation is written in TypeScript and executed with `tsx`. Prefer the pnpm commands below so local and CI behavior stay aligned.

## Commands

| Purpose | Command | Output or effect |
| --- | --- | --- |
| Generate all derived source | `pnpm generate` | Rebuilds `src/lib/generated/` |
| Generate manifest indexes | `pnpm generate:manifests` | Rebuilds typed manifest modules |
| Generate content metadata | `pnpm generate:metadata` | Rebuilds article, docs, FAQ, and manifesto metadata |
| Sort manifest fields | `pnpm refactor:sort-fields` | Reorders manifest JSON using schema order |
| Fetch GitHub stars | `pnpm fetch:github-stars` | Updates `data/github-stars.json` |
| Check GitHub stars | `pnpm fetch:github-stars:check` | Fails when a tracked repository's star count changed, without writing |
| Refresh product versions | `pnpm fetch:product-versions` | Updates manifest `latestVersion` values from configured package registries |
| Check product versions | `pnpm fetch:product-versions:check` | Fails when a configured registry reports a newer stable version |
| Refresh benchmark scores | `pnpm fetch:benchmarks` | Updates exact configured entries from official structured leaderboards |
| Check benchmark scores | `pnpm fetch:benchmarks:check` | Fails when an exact configured leaderboard score changed |
| Record model source changes | `pnpm fetch:model-sources` | Updates only monitored official-source content digests |
| Check model sources | `pnpm fetch:model-sources:check` | Fails when monitored pricing or lifecycle source content changed |
| Validate manifest data locally | `pnpm manifest-data:validate` | Runs schema coverage, semantic validation, i18n validation, and the data-health snapshot check |
| Check manifest data and sources | `pnpm manifest-data:check` | Runs local validation and read-only drift checks against every configured authoritative source |
| Update manifest data | `pnpm manifest-data:update` | Refreshes safe source-backed fields, regenerates derived data and health reports, then validates the result |
| Validate manifests and data | `pnpm test:validate` | Runs the underlying semantic validation test suite |
| Run browser smoke tests | `pnpm test:e2e` | Exercises core journeys in Chromium against a local Next.js server |
| Audit dependencies | `pnpm security:audit` | Fails on high or critical npm advisories in the full dependency tree |
| Check data health | `pnpm data-health:check` | Fails on invalid health-report data |
| Refresh data-health snapshot | `pnpm data-health:report` | Writes `data/data-health.json` and `docs/DATA-HEALTH.md` |
| Validate i18n structure | `pnpm validate:i18n` | Checks locale alignment and translation shape |
| Validate i18n usage | `pnpm validate:i18n-usage` | Checks translation keys referenced by source |
| Validate duplicate i18n values | `pnpm validate:i18n-duplicates` | Fails on new cross-namespace duplicate English values |
| Check representative URLs | `pnpm validate:urls:quick` | Runs the default network URL check |
| Check every URL | `pnpm validate:urls:all` | Checks all locales and slugs |

`manifest-data:validate` is deterministic and offline. `manifest-data:check` and
`manifest-data:update` access external sources and can fail when a source is unavailable. Limit a
networked run with `--only`, for example:

```bash
pnpm manifest-data:check -- --only=product-versions,benchmarks
pnpm manifest-data:update -- --only=github-stars
```

Add `--json` for a compact machine-readable report. Successful subprocess output is suppressed;
full output is included only when a validation step fails. This keeps routine agent and CI runs
concise while retaining diagnostic evidence.

## Layout

```text
scripts/
├── _shared/       shared runner utilities
├── fetch/         external data refreshes and comparison helpers
├── generate/      derived TypeScript source generation
├── manifest-data/ unified validation, source-check, and update harness
├── refactor/      mechanical manifest and locale maintenance
├── validate/      i18n and URL validation
└── temp/          ignored experimental workspace
```

Each category with an `index.ts` auto-discovers sibling `.ts` scripts. A filename such as `generate-manifest-indexes.ts` is exposed as `manifest-indexes`:

```bash
pnpm exec tsx scripts/generate/index.ts manifest-indexes
pnpm exec tsx scripts/refactor/index.ts export-vendors
pnpm exec tsx scripts/fetch/index.ts github-stars
pnpm exec tsx scripts/fetch/fetch-product-versions.ts --check
pnpm exec tsx scripts/fetch/fetch-benchmarks.ts --check
pnpm exec tsx scripts/fetch/fetch-model-sources.ts --check
```

## Generated files

Generated modules under `src/lib/generated/` are committed. After changing manifests or content, run `pnpm generate` and include the resulting deterministic diff. CI regenerates these files and fails when the committed output is stale.

`data/github-stars.json` is source data, not generated build output. Update it with `pnpm fetch:github-stars`; the dedicated scheduled workflow also opens a pull request when values change.

Product-version synchronization is declarative and runs separately from the generic `pnpm fetch` batch. Add `releaseTracking` to a product manifest with an official npm, PyPI, Homebrew, crates.io, GitHub Releases, or Visual Studio Marketplace identifier. The generic version fetcher reads that manifest configuration; product identifiers must not be hardcoded in TypeScript. Failed lookups leave every manifest unchanged, and the scheduled workflow opens a pull request rather than pushing directly to `main`.

Benchmark synchronization also keeps model-to-result mappings in JSON manifests. An exact upstream result ID and exact displayed label are both required; a renamed or missing result fails closed instead of fuzzy matching another model or evaluation setup.

Pricing and lifecycle monitoring fingerprints only explicitly configured official source pages. A source-content change updates the source digest in a review pull request; it never modifies `tokenPricing`, `lifecycle`, or other model facts automatically.

The unified maintenance harness includes four source-backed tasks: GitHub star snapshots, declared
product release versions, exact configured benchmark mappings, and monitored official model-source
digests. Each source task fails closed when upstream data is missing or ambiguous. Updates preserve
curated relationships, translations, rankings, pricing, and lifecycle facts; the model-source task
records a review signal instead of changing those facts automatically.

## Adding a script

1. Add a TypeScript file to the relevant category.
2. Use the category prefix when it improves discovery, for example `generate-example.ts` becomes `example`.
3. Add a package script only when the command is part of the normal contributor or CI workflow.
4. Document external writes, required environment variables, and failure behavior.
