# Data Health Report

Snapshot date: 2026-10-12. Regenerate with `pnpm data-health:report`.

## Scorecard

| Metric | Value |
| --- | ---: |
| Manifest records | 281 |
| Records with structured sources | 281 |
| Verified records | 281 |
| Verified with complete provenance | 281 |
| Stale verified records | 219 |
| Non-English values identical to English | 300 |
| Dangling product relationships | 0 |
| Model benchmark coverage | 8.1% |
| Products with pricing | 70/71 |
| Community URLs with provenance | 336/336 |
| Duplicated vendor community URLs | 0 |
| Errors / warnings / info | 0 / 219 / 0 |

## Category Breakdown

| Category | Total | Verified | Provenance complete | Stale |
| --- | ---: | ---: | ---: | ---: |
| ides | 9 | 9 | 9 | 9 |
| clis | 30 | 30 | 30 | 28 |
| desktops | 13 | 13 | 13 | 12 |
| extensions | 19 | 19 | 19 | 18 |
| models | 145 | 145 | 145 | 135 |
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
| stale-verification | 219 |

## Priority Queue

Only errors and warnings are listed here. Source migration inventory and translation metrics remain
visible in the scorecards and `data/data-health.json`.

| Severity | Issue | Record | Detail |
| --- | --- | --- | --- |
| warning | stale-verification | clis/amazon-q-developer-cli | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | clis/amp-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/antigravity-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/auggie-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/claude-code-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/cline-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/codebuddy-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/codex-cli | Last reviewed 71 days ago; threshold is 60 days. |
| warning | stale-verification | clis/continue-cli | Last reviewed 76 days ago; threshold is 60 days. |
| warning | stale-verification | clis/cursor-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/droid-cli | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | clis/gemini-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/github-copilot-cli | Last reviewed 70 days ago; threshold is 60 days. |
| warning | stale-verification | clis/gitlab-duo-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/goose | Last reviewed 72 days ago; threshold is 60 days. |
| warning | stale-verification | clis/grok-build | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/junie-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/kilo-code-cli | Last reviewed 76 days ago; threshold is 60 days. |
| warning | stale-verification | clis/kimi-cli | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/kiro-cli | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | clis/kode | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/muse-code | Last reviewed 62 days ago; threshold is 60 days. |
| warning | stale-verification | clis/omp | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/opencode | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/pi | Last reviewed 72 days ago; threshold is 60 days. |
| warning | stale-verification | clis/qoder-cli | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | clis/qwen-code | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | clis/vibe-cli | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/air | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/claude-code-desktop | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/codebuddy | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/codex-app | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/factory-desktop | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/goose | Last reviewed 72 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/minimax-code | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/opencode-desktop | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/qoder | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/stagewise | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/verdent-deck | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | desktops/zcode | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/amp | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/augment-code | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/claude-code | Last reviewed 85 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/cline | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/codex | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/continue | Last reviewed 76 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/droid | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/gemini-code-assist | Last reviewed 85 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/github-copilot | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/jetbrains-junie | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/kilo-code | Last reviewed 76 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/kimi-code | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/mistral-vibe | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/opencode-extension | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/qoder | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/roo-code | Last reviewed 76 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/tabnine | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | extensions/verdent | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | ides/antigravity | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | ides/cursor | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | ides/intellij-idea | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | ides/kiro | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | ides/trae | Last reviewed 73 days ago; threshold is 60 days. |
| warning | stale-verification | ides/vscode | Last reviewed 72 days ago; threshold is 60 days. |
| warning | stale-verification | ides/vscodium | Last reviewed 72 days ago; threshold is 60 days. |
| warning | stale-verification | ides/windsurf | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | ides/zed | Last reviewed 74 days ago; threshold is 60 days. |
| warning | stale-verification | models/claude-fable-5 | Last reviewed 84 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-fable-5-1 | Last reviewed 38 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-3-5 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-haiku-4-5 | Last reviewed 86 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-3 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-1 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-5 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-6 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-7 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-4-8 | Last reviewed 84 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-opus-5 | Last reviewed 77 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20240620 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-5-20241022 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-3-7 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-5 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-4-6 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/claude-sonnet-5 | Last reviewed 84 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2 | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/cursor-composer-2-5 | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-3-2 | Last reviewed 83 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-r1 | Last reviewed 55 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-r1-0528 | Last reviewed 55 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3 | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-1 | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-2-exp | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v3-terminus | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-flash-preview | Last reviewed 73 days ago; threshold is 30 days. |
| warning | stale-verification | models/deepseek-v4-pro-preview | Last reviewed 60 days ago; threshold is 30 days. |
| warning | stale-verification | models/devstral-2 | Last reviewed 83 days ago; threshold is 30 days. |

## Freshness Thresholds

Models and providers: 30 days. IDEs, CLIs, and extensions: 60 days. Vendors: 90 days.

This snapshot is an operational backlog, not a claim that records without findings are independently audited.
Network reachability remains covered by the separate scheduled URL validation workflow.
