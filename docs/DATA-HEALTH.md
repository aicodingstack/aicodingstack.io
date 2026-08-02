# Data Health Report

Snapshot date: 2026-08-02. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 253 |
| Records with structured sources | 253 |
| Verified records | 253 |
| Verified with complete provenance | 253 |
| Stale verified records | 0 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 9.5% |
| Products with pricing | 66/66 |
| Community URLs with provenance | 331/331 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 0 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 0 |
| clis | 27 | 27 | 27 | 0 |
| desktops | 12 | 12 | 12 | 0 |
| extensions | 18 | 18 | 18 | 0 |
| models | 123 | 123 | 123 | 0 |
| providers | 17 | 17 | 17 | 0 |
| vendors | 47 | 47 | 47 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 470 | 39 | 8.3% |
| es | 470 | 25 | 5.3% |
| fr | 470 | 36 | 7.7% |
| id | 470 | 30 | 6.4% |
| ja | 470 | 23 | 4.9% |
| ko | 470 | 23 | 4.9% |
| pt | 470 | 31 | 6.6% |
| ru | 470 | 23 | 4.9% |
| tr | 470 | 26 | 5.5% |
| zh-Hans | 470 | 22 | 4.7% |
| zh-Hant | 470 | 22 | 4.7% |

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
