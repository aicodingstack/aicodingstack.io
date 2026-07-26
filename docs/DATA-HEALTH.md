# Data Health Report

Snapshot date: 2026-07-26. Regenerate with `npm run data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 231 |
| Records with structured sources | 140 |
| Verified records | 126 |
| Verified with complete provenance | 109 |
| Stale verified records | 0 |
| Non-English values identical to English | 1520 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 10.5% |
| Products with pricing | 66/67 |
| Errors / warnings / info | 0 / 17 / 91 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 0 | 0 | 0 |
| clis | 27 | 4 | 3 | 0 |
| desktops | 12 | 0 | 0 | 0 |
| extensions | 19 | 3 | 2 | 0 |
| models | 113 | 112 | 100 | 0 |
| providers | 12 | 4 | 3 | 0 |
| vendors | 39 | 3 | 1 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 383 | 133 | 34.7% |
| es | 383 | 127 | 33.2% |
| fr | 383 | 137 | 35.8% |
| id | 383 | 171 | 44.6% |
| ja | 383 | 123 | 32.1% |
| ko | 383 | 143 | 37.3% |
| pt | 383 | 136 | 35.5% |
| ru | 383 | 150 | 39.2% |
| tr | 383 | 152 | 39.7% |
| zh-Hans | 383 | 125 | 32.6% |
| zh-Hant | 383 | 123 | 32.1% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| missing-sources | 91 |
| verified-without-provenance | 17 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | verified-without-provenance | clis/kilo-code-cli | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | extensions/kilo-code | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/glm-4-6 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/glm-4-6v | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-4-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-4o | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-1-codex | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-codex | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/minimax-m2 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/minimax-m2-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/qwen3-coder-30b-a3b | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/qwen3-coder-480b-a35b | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | providers/siliconflow | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | vendors/kilo | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | vendors/siliconflow | Verified record is missing sources, review date, reviewer, or confidence. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
