# Benchmark evidence importer

The importer applies reviewed evidence; it does not browse or scrape leaderboards.

## Input format

```json
{
  "records": [
    {
      "modelId": "exact-existing-manifest-id",
      "modelLabel": "Exact label shown by the leaderboard",
      "benchmark": "sweBench",
      "benchmarkVersion": "SWE-bench Verified, leaderboard/harness version",
      "evaluation": "Agent scaffold, reasoning setting, pass@k, tool policy, or other conditions",
      "score": 74.4,
      "sourceUrl": "https://authoritative.example/leaderboard",
      "sourceTitle": "Official leaderboard title",
      "observedAt": "2026-07-21",
      "verifiedBy": "github-handle-or-agent-id"
    }
  ]
}
```

Supported benchmark keys are the exact manifest fields: `sweBench`, `terminalBench`, `mmmu`, `mmmuPro`, `webDevArena`, `sciCode`, and `liveCodeBench`.

Every descriptive field is required so the generated source title retains the evaluation context that the scalar benchmark schema cannot otherwise represent.

## Commands

```bash
# Preview; never writes
node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs /path/to/evidence.json

# Apply additions or null-to-score changes
node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs /path/to/evidence.json --apply

# Explicitly allow replacement of an existing non-null score
node .agents/skills/benchmark-fetcher/scripts/fetch-benchmarks.mjs /path/to/evidence.json --apply --replace
```

The importer validates exact model IDs, score ranges, dates, HTTPS sources, duplicate records, and overwrite conflicts. It also adds field-scoped source provenance and updates verification metadata. Always inspect the Git diff afterward.
