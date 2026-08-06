# Data Health Report

Snapshot date: 2026-08-06. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 257 |
| Records with structured sources | 257 |
| Verified records | 257 |
| Verified with complete provenance | 257 |
| Stale verified records | 0 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.5% |
| Products with pricing | 69/69 |
| Community URLs with provenance | 334/334 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 0 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 0 |
| clis | 28 | 28 | 28 | 0 |
| desktops | 13 | 13 | 13 | 0 |
| extensions | 19 | 19 | 19 | 0 |
| models | 123 | 123 | 123 | 0 |
| providers | 17 | 17 | 17 | 0 |
| vendors | 48 | 48 | 48 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 483 | 39 | 8.1% |
| es | 483 | 25 | 5.2% |
| fr | 483 | 36 | 7.5% |
| id | 483 | 30 | 6.2% |
| ja | 483 | 23 | 4.8% |
| ko | 483 | 23 | 4.8% |
| pt | 483 | 31 | 6.4% |
| ru | 483 | 23 | 4.8% |
| tr | 483 | 26 | 5.4% |
| zh-Hans | 483 | 22 | 4.6% |
| zh-Hant | 483 | 22 | 4.6% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| None | 0 |

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
