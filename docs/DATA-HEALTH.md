# Data Health Report

Snapshot date: 2026-09-06. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 274 |
| Records with structured sources | 274 |
| Verified records | 274 |
| Verified with complete provenance | 274 |
| Stale verified records | 134 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 8.5% |
| Products with pricing | 70/71 |
| Community URLs with provenance | 336/336 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 134 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 0 |
| clis | 30 | 30 | 30 | 0 |
| desktops | 13 | 13 | 13 | 0 |
| extensions | 19 | 19 | 19 | 0 |
| models | 138 | 138 | 138 | 117 |
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
| stale-verification | 134 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | stale-verification | models/claude-fable-5 | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-4-5 | Last reviewed 50 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-3 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-1 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-6 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-7 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-8 | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-5 | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20240620 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20241022 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-7 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-6 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-5 | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2-5 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-3-2 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-1 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-2-exp | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-terminus | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-flash | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-flash-preview | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-2 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-small-2 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-0-flash | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash-lite | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-pro | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-1-pro-preview | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-5-flash | Last reviewed 46 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-5-flash-lite | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-6-flash | Last reviewed 46 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-flash | Last reviewed 46 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-pro | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemma-4-26b-a4b | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemma-4-31b | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5-air | Last reviewed 42 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5v | Last reviewed 42 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6v | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7-flash | Last reviewed 42 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-1 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-turbo | Last reviewed 42 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5v-turbo | Last reviewed 42 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-mini | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-nano | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o-mini | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex-mini | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2 | Last reviewed 50 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2-codex | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-3-codex | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-mini | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-nano | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-luna | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-sol | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-terra | Last reviewed 48 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-codex | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-mini | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-nano | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-1-fast | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-20 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-3 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-fast | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-code-fast-1 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/hy3 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-0905 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-6 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-7-code | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-instruct | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-thinking | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k3 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/llama-4-maverick | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/llama-4-scout | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/mimo-v2-5 | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/mimo-v2-5-pro | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/mimo-v2-flash | Last reviewed 37 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-5 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-7 | Last reviewed 47 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m3 | Last reviewed 37 days ago; threshold is 30 days. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
