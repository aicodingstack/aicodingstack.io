# Organic Search Opportunity Map

**Measurement window:** April 27–July 26, 2026

**Search market:** Google, English-led with localized landing pages

**Primary goal:** Increase non-brand impressions, top-10 rankings, and organic click-through rate

## Search Performance Baseline

Google Search Console reported:

| Metric | Value |
|---|---:|
| Clicks | 2 |
| Impressions | 601 |
| Click-through rate | 0.3% |
| Average position | 39.2 |

The strongest existing landing pages were:

| Landing page | Clicks | Impressions | Average position | Opportunity |
|---|---:|---:|---:|---|
| `/models` | 1 | 67 | 13.5 | Highest-priority striking-distance page |
| `/model-providers` | 0 | 16 | 14.3 | Striking-distance category page |
| `/` | 1 | 46 | 36.3 | Broad discovery page |
| `/zh-Hant/ides/vscode` | 0 | 108 | 32.6 | High-impression product page |
| `/ides/kiro` | 0 | 77 | 59.8 | Brand/product content opportunity |
| `/zh-Hant/vendors/xai` | 0 | 29 | 33.8 | Brand/vendor content opportunity |

## Keyword-to-Landing-Page Map

Search volume is marked `N/A` because no reliable keyword-volume provider was available. Search Console impressions are first-party observations, not monthly search volume.

| Search theme | Observed queries | Intent | Measured signal | Target landing page | Action |
|---|---|---|---|---|---|
| AI coding models | `AI coding models`, `LLM for coding`, model names | Commercial investigation | `/models`: 67 impressions, position 13.5 | `/models` | Improve title, description, comparison guidance, and links to model comparison/providers |
| Model API providers | `model provider`, `LLM API provider` | Commercial investigation | `/model-providers`: 16 impressions, position 14.3 | `/model-providers` | Expand comparison criteria and provider-selection guidance |
| VS Code with AI | `vscode ai` (69 impressions), `visual code ai ide` (12) | Product discovery | Query positions 24.7 and 19.4 | `/ides/vscode` and localized equivalents | Add AI feature coverage and clarify the relationship between VS Code and AI extensions |
| Codex CLI | `codex cli` (8 impressions), `codex-cli`, `does codex have a cli` | Navigational and informational | Positions 14.9–16.0 | `/clis/codex-cli` | Add a direct answer, setup overview, supported workflows, and official-source references |
| Kiro IDE | `aws kiro` (18), `kiro ai` (17), `kiro ide` (13), `kiro aws` (10) | Product discovery | Positions 53.9–68.7 | `/ides/kiro` | Expand AWS/Kiro entity context, use cases, pricing, and comparison links |
| AI coding tools | `aicoding`, `ai coding stack`, `coding stack` | Broad discovery | Homepage: 46 impressions, position 36.3 | `/` | Target directory and comparison intent in the title and description |
| AI coding stack | `ai coding stack`, `coding stack` | Category education | Query positions 40.0–53.7 | `/ai-coding-stack` | Keep as the ecosystem/category architecture page to avoid homepage cannibalization |
| OpenCode | `open code`, `opencode` | Navigational | Positions 9.0–10.0 | Relevant OpenCode detail page | Preserve exact entity naming and strengthen internal links |

## SERP and Content-Gap Findings

For broad commercial searches, current results are dominated by dated, comparison-led pages with a quick answer, consistent evaluation criteria, pricing, best-fit guidance, trade-offs, and a comparison table. Representative results include:

- [Every AI Coding Tool Compared: The 2026 Matrix](https://www.developersdigest.tech/blog/ai-coding-tools-comparison-matrix-2026)
- [The Best AI Coding Assistants in 2026, Compared](https://daily.dev/blog/best-ai-coding-assistants-comparison/)
- [The 9 best AI coding tools in 2026](https://zapier.com/blog/ai-coding-tools/)
- [Best LLM for Coding in 2026: Ranked by Benchmarks](https://www.tembo.io/blog/best-llm-for-coding)

AI Coding Stack has stronger structured catalog data than many editorial competitors, but its category pages provide less decision guidance. The defensible gap is a source-backed comparison layer built on the existing manifests:

1. Define stable comparison criteria for each category.
2. Explain which fields matter for different workflows.
3. Link category guidance to the existing comparison tools and verified detail pages.
4. Publish recommendation content only when the supporting data and methodology are explicit.

## Prioritized Work

| Priority | Work item | Rationale | Status |
|---|---|---|---|
| P0 | Remove repeated brand names and excessive examples from page titles | Existing list titles exceed normal snippet length and repeat `AI Coding Stack` | Implemented in working tree |
| P0 | Optimize `/models` for comparison intent | It is the strongest striking-distance page | Implemented in working tree |
| P0 | Complete `/models/compare` metadata | The comparison route lacked canonical, hreflang, robots, and complete social metadata | Implemented in working tree |
| P0 | Reposition homepage metadata around “AI coding tools directory and comparisons” | Aligns the broad landing page with non-brand discovery intent | Implemented in working tree |
| P1 | Expand `/model-providers` selection guidance | Average position 14.3 indicates near-term potential | Planned |
| P1 | Expand `/clis/codex-cli` with a direct answer and setup coverage | Multiple queries rank between positions 14.9 and 16.0 | Planned |
| P1 | Expand `/ides/vscode` for “VS Code AI” intent | Highest observed product-query impressions | Planned |
| P1 | Expand `/ides/kiro` for AWS/Kiro entity coverage | Multiple related queries already receive impressions | Planned |
| P2 | Create a source-backed cross-category comparison guide | Broad SERPs reward tested comparison and best-fit guidance | Planned |

## On-Page Audit: `/models`

The baseline score applies the repository's weighted on-page rubric to the production page observed during the measurement period. The working-tree score reflects the implemented metadata and guidance changes; production scoring remains unchanged until deployment.

| Section | Weight | Baseline | Working tree | Finding |
|---|---:|---:|---:|---|
| Title tag | 15 | 4 | 14 | Baseline title was long, stale, and repeated the brand; working title is concise and localized |
| Meta description | 5 | 2 | 5 | Baseline description was too short; working description explains comparison criteria |
| Header structure | 10 | 8 | 9 | One H1 and lifecycle H2s; working tree adds a descriptive comparison H2 |
| Content quality | 25 | 12 | 17 | Catalog data is useful; working tree adds decision guidance but is not yet a full editorial guide |
| Keyword optimization | 15 | 9 | 13 | Working copy covers coding models, context, pricing, lifecycle, providers, and comparison |
| Internal/external links | 10 | 8 | 9 | Working tree adds contextual links to comparison and provider pages |
| Image optimization | 10 | 10 | 10 | The catalog does not depend on content images; route-level social imagery is separate |
| Page-level technical | 10 | 9 | 10 | Canonical and locale alternates remain intact; the comparison destination now receives complete metadata |
| **Overall** | **100** | **62 (C)** | **87 (A)** | Production changes after the GitHub Actions deployment |

## Measurement Plan

After deployment, compare 28-day periods in Search Console:

- `/models`: impressions, CTR, and average position
- `/models/compare`: indexed state and query discovery
- Homepage: non-brand impressions for AI coding tool terms
- `/clis/codex-cli`, `/ides/vscode`, and `/ides/kiro`: query-level position and CTR

The first decision threshold is movement into positions 4–10 for `/models`. The next content batch should use the first 28 days of post-deployment data rather than assumed keyword volume.
