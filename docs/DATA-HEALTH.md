# Data Health Report

Snapshot date: 2026-08-01. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 248 |
| Records with structured sources | 248 |
| Verified records | 248 |
| Verified with complete provenance | 248 |
| Stale verified records | 0 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.5% |
| Products with pricing | 63/63 |
| Community URLs with provenance | 328/328 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 0 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 8 | 8 | 8 | 0 |
| clis | 25 | 25 | 25 | 0 |
| desktops | 11 | 11 | 11 | 0 |
| extensions | 19 | 19 | 19 | 0 |
| models | 123 | 123 | 123 | 0 |
| providers | 17 | 17 | 17 | 0 |
| vendors | 45 | 45 | 45 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 465 | 39 | 8.4% |
| es | 465 | 25 | 5.4% |
| fr | 465 | 36 | 7.7% |
| id | 465 | 30 | 6.5% |
| ja | 465 | 23 | 4.9% |
| ko | 465 | 23 | 4.9% |
| pt | 465 | 31 | 6.7% |
| ru | 465 | 23 | 4.9% |
| tr | 465 | 26 | 5.6% |
| zh-Hans | 465 | 22 | 4.7% |
| zh-Hant | 465 | 22 | 4.7% |

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
