# Data Health Report

Snapshot date: 2026-07-30. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 242 |
| Records with structured sources | 235 |
| Verified records | 215 |
| Verified with complete provenance | 215 |
| Stale verified records | 0 |
| Non-English values identical to English | 1190 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.5% |
| Products with pricing | 67/67 |
| Community URLs with provenance | 302/302 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 0 / 7 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 7 | 7 | 0 |
| clis | 27 | 18 | 18 | 0 |
| desktops | 12 | 7 | 7 | 0 |
| extensions | 19 | 17 | 17 | 0 |
| models | 123 | 122 | 122 | 0 |
| providers | 12 | 4 | 4 | 0 |
| vendors | 40 | 40 | 40 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 423 | 106 | 25.1% |
| es | 423 | 98 | 23.2% |
| fr | 423 | 108 | 25.5% |
| id | 423 | 142 | 33.6% |
| ja | 423 | 100 | 23.6% |
| ko | 423 | 108 | 25.5% |
| pt | 423 | 108 | 25.5% |
| ru | 423 | 117 | 27.7% |
| tr | 423 | 119 | 28.1% |
| zh-Hans | 423 | 92 | 21.7% |
| zh-Hant | 423 | 92 | 21.7% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| missing-sources | 7 |

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
