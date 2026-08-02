# GitHub Stars Refresh

The stars refresh reads the repository keys already tracked in `data/github-stars.json`, queries the GitHub repository API, and updates their raw star counts. Product associations are derived separately from the `githubUrl` fields in IDE, CLI, desktop, and extension manifests.

## Run it

Use a token for the normal GitHub API rate limit:

```bash
GITHUB_TOKEN=your_token pnpm fetch:github-stars
```

Unauthenticated runs are supported but are limited to 60 requests per hour:

```bash
pnpm fetch:github-stars
```

The implementation is `scripts/fetch/fetch-github-stars.ts`; the category runner is `scripts/fetch/index.ts`.

## Data contract

The file follows `manifests/$schemas/github-stars.schema.json`:

```ts
interface GitHubStarsData {
  observedAt: string
  repositories: Record<string, number | null>
}
```

Repository keys use GitHub's `owner/repository` form and values are raw stargazer counts. The UI converts them to compact thousands when needed. A `null` value means no trustworthy count is currently available. Transient API failures retain the previous cached value instead of replacing it with `null`.

Product names, product surfaces, repository roles, licenses, and source-code coverage do not belong in the Stars snapshot. They come from product manifests; use the manifest `sourceCode` override when a repository contains only part of the product source or is used only for feedback or documentation.

## Automation

`.github/workflows/update-github-stars.yml` runs weekly and can also be dispatched manually. It:

1. installs the locked dependencies;
2. runs `pnpm fetch:github-stars` with `GITHUB_TOKEN`;
3. validates the manifest data;
4. opens a pull request when `data/github-stars.json` changed.

There is only one scheduled owner for this refresh. General scheduled URL checks live in `.github/workflows/scheduled-checks.yml`.

## Troubleshooting

- `403`: provide `GITHUB_TOKEN` or wait for the API limit to reset.
- `404`: check the manifest's `githubUrl` and repository visibility.
- Validation failure: ensure every non-null product `githubUrl` maps to a repository key and no repository key is orphaned.
- No pull request: confirm the workflow checked `data/github-stars.json` and that the refreshed values actually differ.

Last reviewed: 2026-08-01.
