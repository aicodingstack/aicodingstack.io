# Launch Asset Specs — Press Kit, Store Listings, Go-Live Checklist

Companion pack for [launch-asset-packager](../SKILL.md). Three spec blocks the manifest rows point at, plus the manifest starter template. Character limits and platform policies change — always verify against the official documentation named in each block before submission.

## 1. Press kit section spec (presskit() convention)

Nine sections, per the presskit() industry convention (Rami Ismail's presskit() format, the de-facto standard press pages are built on). Every section gets a manifest row; mark N/A explicitly instead of dropping.

| Section | Contents | Notes |
|---------|----------|-------|
| Factsheet | Company/developer, release date, platforms, price, website, social links, press contact | The release date must match the `memory/launch-registry/` record — one authoritative date |
| Description | Short (1-2 sentence) + long product description | Copy comes from the message house — do not write a second, diverging description here |
| History | Origin story, milestones | Facts only; company claims marked `[needs source]` route to `memory/events/claims.ndjson` via an authorized `operation: propose` request to `registry-events.py` |
| Features | Bulleted feature list | Mirror the message house value pillars; comparative claims need ledger backing |
| Videos | Trailer / demo video, downloadable + embeddable | Demo script beats come from the SKILL.md step 4 shot list |
| Images | Screenshots, product shots, lifestyle images in a downloadable bundle | Original resolution + web-sized; name files predictably |
| Logo & icon | Logo variants (light/dark), app icon, in a downloadable bundle | Include usage notes if the brand has them |
| Awards & recognition | Awards, notable rankings, certifications | Only verifiable items; each entry needs a source |
| Contact | Press contact email, response expectations | A monitored inbox, not a personal address that goes dark on launch day |

## 2. Dual-store listing spec table

Character budgets **per App Store Connect / Play Console official documentation — verify current limits at submission time**. Never take limits from third-party tooling. Show a Measured character count next to every drafted field.

| Store | Field | Budget (chars) | Notes |
|-------|-------|----------------|-------|
| App Store | Name | 30 | Primary ranking surface; approved terms only — research routes to keyword-research |
| App Store | Subtitle | 30 | Message-house one-liner, compressed |
| App Store | Keywords | 100 | Comma-separated, not user-visible |
| App Store | Promotional text | 170 | Editable without a new review — the launch-day update slot |
| App Store | Description | 4,000 | First lines carry the fold |
| Google Play | Title | 30 | |
| Google Play | Short description | 80 | The listing's above-the-fold pitch |
| Google Play | Full description | 4,000 | |
| Both | Screenshots / previews / other fields (release notes, in-app events, custom product pages) | — | Counts, pixel dimensions, and durations change — take them from the current official spec pages; do not hardcode |

**Review-policy red line**: no incentivized store reviews — no "leave a review, get X" in any asset, FAQ answer, or in-product prompt. Review incentives are permitted only on platforms whose policies explicitly allow them (e.g. G2-class business-review platforms), never the app stores. Store precheck items (placeholder text, dead URLs, future-functionality promises) are the upstream of the RAMP `M1` veto — see [ramp-benchmark.md](../../../../references/ramp-benchmark.md).

## 3. Technical go-live checklist

Manifest rows only — **execution and verification belong to [technical-seo-checker](../../../../seo-geo/tune/technical-seo-checker/SKILL.md) and [serp-markup-builder](../../../../seo-geo/implement/serp-markup-builder/SKILL.md)**. Each row records status + the executing skill.

| Item | Passes when | Executing skill |
|------|-------------|-----------------|
| robots flip | Staging `Disallow` removed; production robots.txt allows crawl of the launch surfaces | technical-seo-checker |
| Sitemap | Generated, referenced in robots.txt, submitted (Search Console; optional index push via `scripts/connectors/indexpush.py` — dry-run default, `--live` to submit) | technical-seo-checker |
| OG / social cards | OG + Twitter-card tags present and rendering on every launch URL | serp-markup-builder |
| Rich snippets | Schema markup valid on the launch surfaces | serp-markup-builder |
| Analytics + UTM | Conversion events fire and UTM conventions are applied on every launch surface (Measured, own `~~web analytics`) | technical-seo-checker verifies; upstream of RAMP `P1` |
| Pricing page | Live and matching the announced stage — upstream of the RAMP `R1` stage-truth check run by the auditor | manifest tracks; auditor verifies |
| Link sweep | No 404s or redirects-to-nowhere among announced URLs | technical-seo-checker |

## 4. Manifest starter template

One row per channel-artifact; status is one of `missing` / `draft` / `final` / `approved`. Status counts reported to the user are Measured (counted off this table).

| Artifact | Channel / surface | Spec source | Owner | Due | Status |
|----------|-------------------|-------------|-------|-----|--------|
| Press kit (9 sections) | Press page | §1 above | | | missing |
| Store listing fields | App Store / Play | §2 above | | | missing |
| Demo video + script | Site, stores, social | SKILL.md step 4 | | | missing |
| Screenshot set | Stores, press, social | SKILL.md step 4 | | | missing |
| Launch FAQ | Support / community | SKILL.md step 6 | | | missing |
| Go-live checklist | Site | §3 above | | | missing |
| Localization variants | Non-EN channels (where the audience requires) | Per-channel spec | | | missing |

Freeze = version + date assigned, pointer submitted to `memory/events/launches.ndjson` via an authorized `operation: propose` request to `registry-events.py`. Gaps (missing rows for the declared tier, budget overruns, unverified go-live items) go into the handoff summary for [launch-readiness-auditor](../../../mobilize/launch-readiness-auditor/SKILL.md).
