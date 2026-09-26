# Data Health Report

Snapshot date: 2026-09-26. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 281 |
| Records with structured sources | 281 |
| Verified records | 281 |
| Verified with complete provenance | 281 |
| Stale verified records | 148 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 8.1% |
| Products with pricing | 70/71 |
| Community URLs with provenance | 336/336 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 148 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 0 |
| clis | 30 | 30 | 30 | 0 |
| desktops | 13 | 13 | 13 | 0 |
| extensions | 19 | 19 | 19 | 2 |
| models | 145 | 145 | 145 | 129 |
| providers | 17 | 17 | 17 | 17 |
| vendors | 48 | 48 | 48 | 0 |

## Translation Placeholder Proxy

Exact English matches are a triage signal; product names and technical terms can be intentional.

| Locale | Comparable strings | Exact English matches | Match rate |
| --- | ---: | ---: | ---: |
| de | 484 | 39 | 8.1% |
| es | 484 | 25 | 5.2% |
| fr | 484 | 36 | 7.4% |
| id | 484 | 30 | 6.2% |
| ja | 484 | 23 | 4.8% |
| ko | 484 | 23 | 4.8% |
| pt | 484 | 31 | 6.4% |
| ru | 484 | 23 | 4.8% |
| tr | 484 | 26 | 5.4% |
| zh-Hans | 484 | 22 | 4.5% |
| zh-Hant | 484 | 22 | 4.5% |

## Backlog by Issue Type

| Issue | Count |
| --- | ---: |
| stale-verification | 148 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | stale-verification | extensions/claude-code | Last reviewed 69 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/gemini-code-assist | Last reviewed 69 days ago; threshold is 60 days. |
| warning | stale-verification | models/claude-fable-5 | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-4-5 | Last reviewed 70 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-3 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-1 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-6 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-7 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-8 | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-5 | Last reviewed 61 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20240620 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20241022 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-7 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-6 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-5 | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2-5 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-3-2 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-r1 | Last reviewed 39 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-r1-0528 | Last reviewed 39 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-1 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-2-exp | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-terminus | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-flash-preview | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-pro-preview | Last reviewed 44 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-2 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-small-2 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-0-flash | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash-lite | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-pro | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-1-pro-preview | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-5-flash | Last reviewed 66 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-5-flash-lite | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-6-flash | Last reviewed 66 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-7-flash | Last reviewed 43 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-flash | Last reviewed 66 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-pro | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemma-4-26b-a4b | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemma-4-31b | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5-air | Last reviewed 62 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5v | Last reviewed 62 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6 | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6v | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7-flash | Last reviewed 62 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-1 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-2 | Last reviewed 38 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-3 | Last reviewed 38 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-turbo | Last reviewed 62 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5v-turbo | Last reviewed 62 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1 | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-mini | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-nano | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o-mini | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5 | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1 | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex-mini | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2 | Last reviewed 70 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2-codex | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-3-codex | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-mini | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-nano | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-luna | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-sol | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-terra | Last reviewed 68 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-codex | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-mini | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-nano | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-1-fast | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-20 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-3 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-5 | Last reviewed 46 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-6 | Last reviewed 44 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-fast | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-code-fast-1 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/hy3 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-0905 | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-5 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-6 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-7-code | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-instruct | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-thinking | Last reviewed 57 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k3 | Last reviewed 67 days ago; threshold is 30 days. |
| warning | stale-verification | models/llama-4-maverick | Last reviewed 57 days ago; threshold is 30 days. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
