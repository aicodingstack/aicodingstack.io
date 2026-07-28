# Data Health Report

Snapshot date: 2026-07-28. Regenerate with `npm run data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 242 |
| Records with structured sources | 231 |
| Verified records | 176 |
| Verified with complete provenance | 176 |
| Stale verified records | 0 |
| Non-English values identical to English | 1262 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.5% |
| Products with pricing | 63/67 |
| Community URLs with provenance | 302/302 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 0 / 11 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 0 | 0 | 0 |
| clis | 27 | 5 | 5 | 0 |
| desktops | 12 | 0 | 0 | 0 |
| extensions | 19 | 5 | 5 | 0 |
| models | 123 | 122 | 122 | 0 |
| providers | 12 | 4 | 4 | 0 |
| vendors | 40 | 40 | 40 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 411 | 113 | 27.5% |
| es | 411 | 104 | 25.3% |
| fr | 411 | 115 | 28% |
| id | 411 | 149 | 36.3% |
| ja | 411 | 107 | 26% |
| ko | 411 | 115 | 28% |
| pt | 411 | 114 | 27.7% |
| ru | 411 | 124 | 30.2% |
| tr | 411 | 125 | 30.4% |
| zh-Hans | 411 | 98 | 23.8% |
| zh-Hant | 411 | 98 | 23.8% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| missing-sources | 11 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| — | — | — | No priority issues. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
