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

Legacy records may have `verified: true` without structured provenance because the boolean predates these fields. Treat those badges as evidence of a prior team review, not as a current freshness guarantee. They will be backfilled category by category; no source or review date should be invented merely to complete the fields.

For new entries and material updates, a `verified: true` change should include at least one authoritative source, `lastVerifiedAt`, `verifiedBy`, and `confidence`. Official product documentation and pricing pages are preferred over third-party summaries. Benchmark fields should cite the benchmark owner or an official model report.

## Freshness direction

The next data-health automation should report verified records without provenance, records older than their category threshold, broken source URLs, and fields such as pricing or benchmarks with no field-level source. Until that automation is in place, freshness review remains a pull-request responsibility.
