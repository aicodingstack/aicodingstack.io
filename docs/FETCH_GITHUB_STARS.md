# GitHub Stars Refresh

The stars refresh reads `githubUrl` from IDE, CLI, and extension manifests, queries the GitHub repository API, and writes the centralized cache at `data/github-stars.json`.

## Run it

Use a token for the normal GitHub API rate limit:

```bash
GITHUB_TOKEN=your_token npm run fetch:github-stars
```

Unauthenticated runs are supported but are limited to 60 requests per hour:

```bash
npm run fetch:github-stars
```

The implementation is `scripts/fetch/fetch-github-stars.ts`; the category runner is `scripts/fetch/index.ts`.

## Data contract

The file follows `manifests/$schemas/github-stars.schema.json`:

```ts
interface GitHubStarsData {
  extensions: Record<string, number | null>
  clis: Record<string, number | null>
  ides: Record<string, number | null>
}
```

Values are stored in thousands with one decimal place, matching the current UI contract; for example, `42.3` means approximately 42,300 stars. A `null` value means the manifest has no usable repository URL or no cached value exists. Transient API failures retain the previous cached value instead of replacing it with `null`.

## Automation

`.github/workflows/update-github-stars.yml` runs weekly and can also be dispatched manually. It:

1. installs the locked dependencies;
2. runs `npm run fetch:github-stars` with `GITHUB_TOKEN`;
3. validates the manifest data;
4. opens a pull request when `data/github-stars.json` changed.

There is only one scheduled owner for this refresh. General scheduled URL checks live in `.github/workflows/scheduled-checks.yml`.

## Troubleshooting

- `403`: provide `GITHUB_TOKEN` or wait for the API limit to reset.
- `404`: check the manifest's `githubUrl` and repository visibility.
- Validation failure: ensure each IDE, CLI, and extension manifest has a matching key and no orphan key remains.
- No pull request: confirm the workflow checked `data/github-stars.json` and that the refreshed values actually differ.

Last reviewed: 2026-07-18.
