# Data Health Report

Snapshot date: 2026-07-21. Regenerate with `npm run data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 247 |
| Records with structured sources | 149 |
| Verified records | 135 |
| Verified with complete provenance | 117 |
| Stale verified records | 0 |
| Non-English values identical to English | 1506 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.7% |
| Products with pricing | 67/68 |
| Errors / warnings / info | 0 / 18 / 98 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 10 | 0 | 0 | 0 |
| clis | 27 | 2 | 1 | 0 |
| desktops | 12 | 0 | 0 | 0 |
| extensions | 19 | 3 | 2 | 0 |
| models | 125 | 123 | 110 | 0 |
| providers | 13 | 4 | 3 | 0 |
| vendors | 41 | 3 | 1 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 362 | 130 | 35.9% |
| es | 362 | 126 | 34.8% |
| fr | 362 | 136 | 37.6% |
| id | 362 | 170 | 47% |
| ja | 362 | 122 | 33.7% |
| ko | 362 | 141 | 39% |
| pt | 362 | 136 | 37.6% |
| ru | 362 | 150 | 41.4% |
| tr | 362 | 150 | 41.4% |
| zh-Hans | 362 | 124 | 34.3% |
| zh-Hant | 362 | 121 | 33.4% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| missing-sources | 98 |
| verified-without-provenance | 18 |

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
| warning | verified-without-provenance | models/qwen3-coder-plus | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | providers/siliconflow | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | vendors/kilo | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | vendors/siliconflow | Verified record is missing sources, review date, reviewer, or confidence. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
