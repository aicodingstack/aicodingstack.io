# Data Health Report

Snapshot date: 2026-07-18. Regenerate with `npm run data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 134 |
| Records with structured sources | 6 |
| Verified records | 39 |
| Verified with complete provenance | 6 |
| Stale verified records | 0 |
| Non-English values identical to English | 1411 |
| Dangling product relationships | 5 |
| Model benchmark coverage | 28.1% |
| Products with pricing | 48/48 |
| Errors / warnings / info | 0 / 38 / 128 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 13 | 0 | 0 | 0 |
| clis | 20 | 2 | 0 | 0 |
| extensions | 15 | 3 | 0 | 0 |
| models | 33 | 28 | 3 | 0 |
| providers | 13 | 4 | 3 | 0 |
| vendors | 40 | 2 | 0 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 329 | 120 | 36.5% |
| es | 329 | 116 | 35.3% |
| fr | 329 | 126 | 38.3% |
| id | 329 | 160 | 48.6% |
| ja | 329 | 117 | 35.6% |
| ko | 329 | 133 | 40.4% |
| pt | 329 | 126 | 38.3% |
| ru | 329 | 142 | 43.2% |
| tr | 329 | 142 | 43.2% |
| zh-Hans | 329 | 116 | 35.3% |
| zh-Hant | 329 | 113 | 34.3% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| missing-sources | 128 |
| verified-without-provenance | 33 |
| dangling-related-product | 5 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | dangling-related-product | extensions/droid | References missing clis/factory. |
| warning | dangling-related-product | extensions/qoder | References missing ides/qoder-ide. |
| warning | dangling-related-product | ides/intellij-idea | References missing clis/idea. |
| warning | dangling-related-product | ides/vscode | References missing clis/code. |
| warning | dangling-related-product | ides/zed | References missing clis/zed. |
| warning | verified-without-provenance | clis/claude-code-cli | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | clis/kilo-code-cli | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | extensions/claude-code | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | extensions/gemini-code-assist | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | extensions/kilo-code | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/claude-opus-4 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/claude-opus-4-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/claude-opus-4-5 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/claude-sonnet-4 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/claude-sonnet-4-5 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gemini-2-5-flash | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gemini-2-5-pro | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gemini-3-pro | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/glm-4-6 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/glm-4-6v | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/glm-4-7 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-4-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-4o | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-1-codex | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/gpt-5-codex | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/grok-code-fast-1 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/kimi-k2-0905 | Verified record is missing sources, review date, reviewer, or confidence. |
| warning | verified-without-provenance | models/kimi-k2-thinking | Verified record is missing sources, review date, reviewer, or confidence. |
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
