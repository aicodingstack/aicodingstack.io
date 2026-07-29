---
name: benchmark-fetcher
description: Collects benchmark evidence with current browsing tools and safely imports reviewed scores into model manifests. Use for SWE-bench, TerminalBench, MMMU, MMMU Pro, SciCode, LiveCodeBench, or WebDevArena updates.
---

# Benchmark Fetcher

This is an evidence-review workflow with a deterministic importer. The Node script does not control a browser or scrape websites.

## Workflow

1. Read `manifests/$schemas/model.schema.json`, the target model manifests, and the leaderboard's methodology/version documentation.
2. Browse the current authoritative leaderboard or benchmark publication.
3. Confirm all of the following for each score:
   - exact model/version label, including reasoning level or agent scaffold;
   - benchmark subset and version;
   - evaluation mode, pass@k, tool policy, date range, and harness where applicable;
   - score scale expected by the manifest schema;
   - stable source URL and observation date.
4. Create a JSON evidence file using the format in `README.md`.
5. Preview the import. Review every proposed change and conflict.
6. Use `--apply` only after review. Use `--replace` only when the new and existing scores are truly comparable and the new evidence supersedes the old value.
7. Review manifest source/provenance changes and run repository validation.

## Safety rules

- Never fuzzy-match model names. Map the leaderboard label to an exact existing manifest ID through human review.
- Never treat a newer webpage as proof that a score is comparable with an older one.
- Do not convert an Elo/rating into a percentage.
- `terminalBench` is stored on a 0–1 scale; the percentage fields use 0–100. `webDevArena` is a non-negative rating, not a percentage, and must not be rescaled.
- A leaderboard is authoritative only for the evaluation it reports, not for model specs or pricing.
- Keep unresolved or ambiguous results out of manifests.
- The importer defaults to preview and refuses to overwrite non-null scores without `--replace`.

## Validation

```bash
node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs evidence.json
node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs evidence.json --apply
pnpm test:validate
pnpm data-health:check
```

Run `pnpm check` and `pnpm test:ci` before release handoff.
