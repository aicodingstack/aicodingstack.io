# Data Health Report

Snapshot date: 2026-08-30. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 270 |
| Records with structured sources | 270 |
| Verified records | 270 |
| Verified with complete provenance | 270 |
| Stale verified records | 94 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 8.7% |
| Products with pricing | 70/71 |
| Community URLs with provenance | 336/336 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 94 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 0 |
| clis | 30 | 30 | 30 | 0 |
| desktops | 13 | 13 | 13 | 0 |
| extensions | 19 | 19 | 19 | 0 |
| models | 134 | 134 | 134 | 94 |
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
| stale-verification | 94 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | stale-verification | models/claude-fable-5 | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-4-5 | Last reviewed 43 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-6 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-7 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-8 | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-5 | Last reviewed 34 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20240620 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20241022 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-7 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-6 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-5 | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-3-2 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-2 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-small-2 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-0-flash | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-flash-lite | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-2-5-pro | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-1-pro-preview | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-5-flash | Last reviewed 39 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-6-flash | Last reviewed 39 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-flash | Last reviewed 39 days ago; threshold is 30 days. |
| warning | stale-verification | models/gemini-3-pro | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5-air | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-5v | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-6v | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-4-7-flash | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5-turbo | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/glm-5v-turbo | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4-1-nano | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-4o-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-1-codex-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2 | Last reviewed 43 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-2-codex | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-3-codex | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-4-nano | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-sol | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-6-terra | Last reviewed 41 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-codex | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/gpt-5-nano | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-1-fast | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-20 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-4-fast | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/grok-code-fast-1 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k2-6 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/kimi-k3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-1 | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/minimax-m2-7 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/mistral-medium-3-5 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/mistral-small-4 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/o3 | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/o3-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/o4-mini | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-5-122b-a10b | Last reviewed 34 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-5-35b-a3b | Last reviewed 34 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-5-397b-a17b | Last reviewed 34 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-6-27b | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-6-35b-a3b | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-6-max-preview | Last reviewed 35 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-6-plus | Last reviewed 40 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-7-max | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-7-plus | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-coder-30b-a3b | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-coder-480b-a35b | Last reviewed 33 days ago; threshold is 30 days. |
| warning | stale-verification | models/qwen3-coder-next | Last reviewed 40 days ago; threshold is 30 days. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
