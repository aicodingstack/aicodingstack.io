# Data Trust and Verification

AI Coding Stack uses `verified` to mean that a record was reviewed by the project team against authoritative sources. It does not mean the vendor endorsed the record, that every field is independently audited, or that rapidly changing pricing and benchmark values remain current forever.

## Provenance fields

All entity schemas support these optional fields:

- `sources`: HTTPS sources for the full record or selected fields;
- `lastVerifiedAt`: the most recent review date in `YYYY-MM-DD` format;
- `verifiedBy`: the GitHub handle or automation identifier responsible for the review;
- `confidence`: `high`, `medium`, or `low`, based on source authority, completeness, and recency.

Example:

```json
{
  "verified": true,
  "sources": [
    {
      "url": "https://example.com/docs/model",
      "title": "Official model documentation",
      "fields": ["contextWindow", "maxOutput", "capabilities"]
    },
    {
      "url": "https://example.com/pricing",
      "title": "Official API pricing",
      "fields": ["tokenPricing"]
    }
  ],
  "lastVerifiedAt": "2026-07-18",
  "verifiedBy": "@maintainer",
  "confidence": "high"
}
```

## Current rollout state

Legacy records may have `verified: true` without structured provenance because the boolean predates these fields. Treat those badges as evidence of a prior team review, not as a current freshness guarantee. They are being backfilled category by category; no source or review date should be invented merely to complete the fields. The first official-source batch covers OpenAI, Anthropic, and Google providers plus one representative model from each. The second batch covers the Claude Code CLI and IDE integration plus Gemini Code Assist, including current product editions and release information.

For new entries and material updates, a `verified: true` change should include at least one authoritative source, `lastVerifiedAt`, `verifiedBy`, and `confidence`. Official product documentation and pricing pages are preferred over third-party summaries. Benchmark fields should cite the benchmark owner or an official model report.

## Freshness policy

Run `npm run data-health:report` after manifest or translation changes and commit both generated snapshots. CI runs `npm run data-health:check` to reject invalid or stale snapshots.

The current review thresholds are 30 days for models and providers, 60 days for IDEs, CLIs, and extensions, and 90 days for vendors. Threshold findings remain warnings so that legacy debt stays visible without blocking unrelated work. Dangling product relationships are errors because they always point to nonexistent records and can break navigation. Network reachability is checked by the separate scheduled URL workflow; source authority and field coverage remain pull-request review responsibilities.
