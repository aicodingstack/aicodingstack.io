# Project Review and Delivery Tracker — 2026-07-18

This document records the July 2026 project review and tracks the work required to turn AI
Coding Stack from a mostly static directory into a trusted, continuously maintained decision
layer for AI coding tools and models.

## North Star

AI Coding Stack should optimize for trustworthy decisions rather than raw page or entry count:

1. **Data layer:** sourced, dated, reviewable facts about tools, models, providers, and vendors.
2. **Decision layer:** search, filters, comparisons, and use-case-oriented stack recommendations.
3. **Distribution layer:** the website, versioned data exports/API, embeddable comparisons, and
   community contribution workflows.

## Review Baseline

Baseline captured on 2026-07-18:

- 151 manifest files across six entity categories.
- 12 supported locales with aligned translation file structures.
- Last manifest change: 2026-01-26.
- Newest model `releaseDate`: 2025-12-23.
- Last successful production deployment and `main` CI run: 2026-01-28.
- 14 open pull requests; 13 reported as blocked at review time.
- 40 `as unknown as` type escapes under `src/` and `scripts/`.
- 39 client-side source files; several product pages exceed 500 lines.
- 33 models produce 528 pair combinations, or 6,336 localized comparison pages if every pair
  is statically generated.
- Approximately 36–51% of non-English UI strings are byte-identical to English. This is a proxy
  for untranslated placeholders, not a definitive translation-quality score.

## Status Legend

- [ ] Planned
- [~] In progress
- [x] Completed
- [!] Blocked or requires a product/operations decision

## P0 — Restore Maintenance Throughput

- [x] Remove the deleted `develop` branch from deployment workflows.
  - Acceptance: staging has an intentional manual or trunk-based trigger.
- [x] Consolidate GitHub Stars automation into one workflow.
  - Acceptance: one schedule, correct `data/github-stars.json` path, generated output included,
    and changes result in a reviewable PR.
- [x] Make scheduled URL failures observable and actionable.
  - Acceptance: a failed URL check creates or updates an issue and the workflow reports failure.
- [x] Repair stale CODEOWNERS, issue templates, README, contributor guide, and script docs.
  - Acceptance: every referenced path and npm command exists; manifest examples validate.
- [ ] Triage and merge/close the existing blocked dependency and data PR backlog.
  - Acceptance: `main` is current, required checks run on bot PRs, and no obsolete update PRs
    remain open.
- [ ] Define a regular release and data-refresh cadence.
  - Acceptance: named owner, weekly data review, and monthly production release review.

## P0 — Correctness and User Trust

- [x] Fix provider links emitted by the search results page.
- [x] Fix untranslated/raw labels and invalid inferred provider links in two-model comparisons.
- [x] Replace hard-coded 2025 metadata and copyright values with current or timeless values.
- [x] Complete and integrate `ModelCompareSelector` on model detail pages.
- [x] Add missing sitemap coverage for important static, comparison, extension, and vendor pages.
- [x] Remove randomized fallback data from `GitHubStarHistory`; failed requests now render nothing.
- [x] Define the meaning and limitations of the Verified badge in public documentation.

## P1 — Data Trust Layer

- [x] Extend schemas with optional provenance and freshness fields.
  - Candidate fields: `sources`, `lastVerifiedAt`, `verifiedBy`, `confidence`, and field-level
    effective dates where pricing or benchmarks change independently.
- [ ] Backfill provenance for all verified entries before treating verification as authoritative.
- [x] Generate a data-health report covering freshness, missing sources, broken URLs, relationship
  integrity, translation placeholders, and missing pricing/benchmark values.
- [x] Add freshness policies (for example 30/60/90-day review thresholds by field/category).
- [ ] Automate change discovery from official sources, but keep human review before merge.
- [ ] Populate a real changelog from manifest diffs instead of keeping an empty static file.

## P1 — Product Experience

- [x] Stop statically generating every possible two-model comparison pair.
- [x] Unify `/models/comparison` and `/models/compare/...` into one understandable comparison
  journey.
- [x] Add “compare” actions to cards and detail pages with persistent selected items.
- [x] Search localized names/descriptions, capabilities, modalities, platforms, vendors, and types.
- [ ] Add explicit use-case metadata and include it in search when the schema supports it.
- [ ] Add guided selection filters: interface, budget, model freedom, privacy/local execution,
  platform, and team workflow.
- [x] Make the ranking destination directly reachable from keyboard and mobile navigation.
- [ ] Refocus the homepage on current data, recent changes, popular comparisons, and recommended
  stacks rather than primarily explaining the product.

## P1 — Quality Gates

- [x] Add route-contract tests for every manifest category.
- [ ] Add browser-level smoke tests for search, navigation, detail pages, locale switching, and
  comparison selection.
- [ ] Add automated accessibility checks for dialogs, menus, comparison tables, and mobile nav.
- [x] Run generation in CI and fail when tracked generated output differs.
- [x] Make the aggregate CI job fail on cancelled or skipped required jobs as well as failures.
- [ ] Add a small security workflow/policy for dependency and application review.

## P2 — Architecture and Scale

- [ ] Make `ComparisonTable` generic and remove `Record<string, unknown>` call-site casting.
- [ ] Extract shared comparison definitions for IDEs, CLIs, and extensions.
- [ ] Use the manifest registry as the single source of truth for route bases in search, sitemap,
  navigation, and metadata generation.
- [ ] Split large client components and move static derivations back to server components.
- [x] Keep generated TypeScript artifacts tracked and enforce freshness in CI.
- [ ] Replace duplicated metadata constants and hand-maintained examples with generated values.

## P2 — Distribution and Growth

- [ ] Publish versioned JSON exports or a small read-only API.
- [ ] Offer embeddable comparison cards and freshness/verification badges.
- [ ] Generate weekly ecosystem change summaries from reviewed manifest diffs.
- [ ] Let contribution forms generate schema-valid pull requests instead of requiring contributors
  to hand-author large JSON documents.
- [ ] Track decision-oriented product metrics: searches completed, comparisons started, outbound
  official-link clicks, stale entries resolved, and contribution lead time.

## Baseline Findings

These findings were captured before the implementation batch and are retained as historical review
evidence; completed items are reflected in the checklists and implementation log above.

- `src/app/[locale]/search/page.client.tsx` bypasses the manifest registry route mapping.
- `src/app/[locale]/models/compare/[models]/page.client.tsx` renders several internal keys and
  English-only strings directly.
- Model comparison provider URLs are inferred from display names, which does not work for values
  such as `Z.ai`, `KwaiKAT`, or non-provider vendors.
- `src/app/[locale]/models/compare/[models]/page.tsx` generates model pairs with O(n²) growth.
- `.github/workflows/deploy-staging.yml` listens to the removed `develop` branch.
- Stars updates are duplicated across two workflows and one workflow references an obsolete path.
- Scheduled URL validation combines `continue-on-error` with a generic `failure()` condition.
- README and contributor documentation reference old framework versions, commands, paths, and
  manifest shapes.
- Sitemap coverage excludes several valuable routes and two detail categories.
- `METADATA_DEFAULTS.currentYear`, footer text, and model metadata contain hard-coded 2025 values.
- `GitHubStarHistory` generates random chart data when its external API fails.
- The test suite is strong on repository integrity but thin on user-visible behavior.

## Implementation Log

### 2026-07-18

- Captured the review baseline and agreed direction.
- Switched active development back to `main`.
- Restored staging, scheduled URL checks, Stars refresh ownership, CI aggregation, and generated
  source drift checks.
- Corrected contributor-facing paths, commands, runtime versions, script docs, and issue templates.
- Fixed search routing and coverage, comparison localization/provider routing/pricing, sitemap
  coverage, current-year handling, and randomized chart fallback data.
- Integrated the model comparison selector and moved pair pages to on-demand ISR instead of
  prebuilding every localized pair.
- Added structured provenance/freshness fields and documented the Verified badge rollout without
  inventing source history for legacy records.
- Preserved cached GitHub star values on transient API failures instead of overwriting them with
  `null`.
- Added route/search regression tests and completed production verification: Biome, TypeScript,
  25 tests, manifest validation, generation, Next.js build, and OpenNext Cloudflare bundling.
- Added a reproducible data-health scorecard and JSON snapshot covering provenance, freshness,
  relationship integrity, translation placeholders, pricing, and benchmark coverage; CI now rejects
  invalid or stale snapshots while leaving legacy migration debt visible as warnings and inventory.
- Completed the first official-source provenance batch for the OpenAI, Anthropic, and Google
  providers and representative GPT-5.2, Claude Haiku 4.5, and Gemini 3 Flash model records.
- Corrected GPT-5.2 from `latest` to `maintained` after its official model page identified it as a
  previous frontier model that remains available.
- Made `/models/compare` the canonical model comparison journey, retained the old all-model URL as
  a permanent redirect, and removed its duplicate comparison implementation.
- Added a persistent two-model selection shared by model cards, detail-page comparison actions,
  canonical pair URLs, and the comparison selector; adding a third model replaces the oldest pick.
