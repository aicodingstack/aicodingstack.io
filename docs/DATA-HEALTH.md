# Data Health Report

Snapshot date: 2026-07-27. Regenerate with `npm run data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 242 |
| Records with structured sources | 151 |
| Verified records | 137 |
| Verified with complete provenance | 120 |
| Stale verified records | 0 |
| Non-English values identical to English | 1262 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.6% |
| Products with pricing | 66/67 |
| Errors / warnings / info | 0 / 17 / 91 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 0 | 0 | 0 |
| clis | 27 | 4 | 3 | 0 |
| desktops | 12 | 0 | 0 | 0 |
| extensions | 19 | 3 | 2 | 0 |
| models | 123 | 122 | 110 | 0 |
| providers | 12 | 4 | 3 | 0 |
| vendors | 40 | 4 | 2 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 410 | 113 | 27.6% |
| es | 410 | 104 | 25.4% |
| fr | 410 | 115 | 28% |
| id | 410 | 149 | 36.3% |
| ja | 410 | 107 | 26.1% |
| ko | 410 | 115 | 28% |
| pt | 410 | 114 | 27.8% |
| ru | 410 | 124 | 30.2% |
| tr | 410 | 125 | 30.5% |
| zh-Hans | 410 | 98 | 23.9% |
| zh-Hant | 410 | 98 | 23.9% |

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
