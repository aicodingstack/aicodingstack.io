# Data Health Report

Snapshot date: 2026-07-30. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 242 |
| Records with structured sources | 231 |
| Verified records | 176 |
| Verified with complete provenance | 176 |
| Stale verified records | 0 |
| Non-English values identical to English | 1190 |
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
| de | 416 | 106 | 25.5% |
| es | 416 | 98 | 23.6% |
| fr | 416 | 108 | 26% |
| id | 416 | 142 | 34.1% |
| ja | 416 | 100 | 24% |
| ko | 416 | 108 | 26% |
| pt | 416 | 108 | 26% |
| ru | 416 | 117 | 28.1% |
| tr | 416 | 119 | 28.6% |
| zh-Hans | 416 | 92 | 22.1% |
| zh-Hant | 416 | 92 | 22.1% |

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
