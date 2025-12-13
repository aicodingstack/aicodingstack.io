# Scripts Documentation

This directory contains utility scripts for managing and validating the AI Coding Stack project. Scripts are organized into four categories:

- **`validate/`** - Validation scripts that check data integrity
- **`generate/`** - Generation scripts that create derived files
- **`refactor/`** - Refactoring scripts that reorganize or reformat data
- **`fetch/`** - Data fetching scripts that retrieve external data

## Directory Structure

```
scripts/
├── validate/
│   ├── index.mjs              # Entry point for all validation scripts
│   ├── validate-manifests.mjs
│   ├── validate-github-stars.mjs
│   └── validate-urls.mjs
├── generate/
│   ├── index.mjs              # Entry point for all generation scripts
│   ├── generate-manifest-indexes.mjs
│   └── generate-metadata.mjs
├── refactor/
│   ├── index.mjs              # Entry point for all refactoring scripts
│   └── sort-manifest-fields.mjs
└── fetch/
    ├── index.mjs              # Entry point for all fetch scripts
    └── fetch-github-stars.mjs
```

## Usage

### Running All Scripts in a Category

Each category has an entry point script (`index.mjs`) that can run all scripts in that category:

```bash
# Run all validation tests
npm run test:validate

# Run all generation scripts
npm run generate

# Run all refactoring scripts
npm run refactor

# Run all fetch scripts
npm run fetch
```

### Running Individual Scripts

You can also run individual scripts by passing the script name to the entry point:

```bash
# Validation tests
npm run test:validate
npm run test:urls

# Generation scripts
npm run generate:manifests
npm run generate:metadata

# Refactoring scripts
npm run refactor:sort-fields

# Fetch scripts
npm run fetch:github-stars
```

Or directly using Node:

```bash
# Run validation tests
node ./node_modules/vitest/vitest.mjs run tests/validate --reporter=verbose

# Run generation/fetch scripts
node scripts/generate/index.mjs metadata
node scripts/fetch/index.mjs github-stars
```

## Validation (Test-based)

Validation is implemented as **Vitest-based automated tests** under `tests/validate/`.

### Run all validations (recommended)

```bash
npm run test:validate
```

**What it checks:**
- JSON syntax validity
- Schema compliance for each manifest type
- Required fields presence
- Field format validation (URLs, enums, etc.)
- Filename matches the `id` field in the manifest

**Manifest types validated:**
- `manifests/clis/*.json` - CLI tools
- `manifests/ides/*.json` - IDEs
- `manifests/extensions/*.json` - Editor extensions
- `manifests/providers/*.json` - API providers
- `manifests/models/*.json` - LLM models
- `manifests/vendors/*.json` - Vendor information
- `manifests/collections.json` - Collections data

### Run GitHub stars consistency validation

```bash
npm run test:validate
```

**What it checks:**
- All entries in `github-stars.json` have corresponding manifest files
- All manifest files are present in `github-stars.json`
- No orphaned entries in either direction

**Categories validated:**
- `extensions`
- `clis`
- `ides`

**Common issues:**
- Orphaned entries: Entries in `github-stars.json` without manifest files
- Missing entries: Manifest files without corresponding `github-stars.json` entries

**How to fix:**
1. Remove orphaned entries from `data/github-stars.json`
2. Add missing entries to `data/github-stars.json` (set value to `null` if unknown)
3. Or remove unused manifest files if they are not needed

### Run URL validation (networked; CI-oriented)

```bash
npm run test:urls
```

**What it checks:**
- URL accessibility (HTTP status codes)
- Network connectivity
- URL format validity

**Note:** This check makes HTTP requests and can be flaky; it is typically run in CI and configured as non-blocking.

## Generation Scripts

### generate-manifest-indexes.mjs

Generates TypeScript index files from individual manifest files.

```bash
npm run generate:manifests
```

**What it generates:**
- `src/lib/generated/ides.ts` - IDE manifest index
- `src/lib/generated/clis.ts` - CLI manifest index
- `src/lib/generated/models.ts` - Model manifest index
- `src/lib/generated/providers.ts` - Provider manifest index
- `src/lib/generated/extensions.ts` - Extension manifest index
- `src/lib/generated/vendors.ts` - Vendor manifest index
- `src/lib/generated/index.ts` - Main manifest index
- `src/lib/generated/github-stars.ts` - GitHub stars data

### generate-metadata.mjs

Generates TypeScript metadata files from MDX content and manifest data.

```bash
npm run generate:metadata
```

**What it generates:**
- `src/lib/generated/metadata.ts` - Articles, docs, FAQ, and collections metadata
- `src/lib/generated/articles.ts` - Article components and metadata
- `src/lib/generated/docs.ts` - Doc components and metadata
- `src/lib/generated/manifesto.ts` - Manifesto component loader

## Refactoring Scripts

### sort-manifest-fields.mjs

Sorts fields in manifest JSON files according to their schema definitions.

```bash
npm run refactor:sort-fields
```

**What it does:**
- Reorders fields in manifest files to match schema property order
- Ensures consistent field ordering across all manifests
- Handles nested objects and arrays

## Data Fetching Scripts

### fetch-github-stars.mjs

Fetches GitHub star counts for projects listed in manifests.

```bash
npm run fetch:github-stars
```

**What it does:**
- Reads `githubUrl` from manifest files
- Fetches star counts from GitHub API
- Updates `data/github-stars.json` with latest counts

**Environment variables:**
- `GITHUB_TOKEN` - Optional GitHub token to avoid rate limits (recommended)

**Note:** Without a GitHub token, you may hit rate limits (60 requests/hour).

## Build Process

The build process runs validation tests and generation scripts automatically:

```bash
npm run build:next
```

This runs in order:
1. `test:validate` - Validate repository data integrity (schemas, translations, alignment, etc.)
3. `generate:manifests` - Generate manifest indexes
4. `generate:metadata` - Generate TypeScript metadata
5. Next.js build

## Development Workflow

During development, use:

```bash
npm run dev
```

This will:
1. Generate manifest indexes
2. Generate metadata
3. Start Next.js development server

## CI/CD Integration

For CI/CD pipelines, you can run the validation test suite:

```bash
# Run validations (recommended for CI)
npm run test:validate

# Run all generation scripts
npm run generate

# Run all refactoring scripts
npm run refactor

# Run all fetch scripts (if needed)
npm run fetch
```

Or run individual checks as needed:

```bash
npm run test:validate
npm run generate:manifests
npm run generate:metadata
npm run refactor:sort-fields
```

## Manual Execution

To run tests manually without npm, you can use Vitest directly:

```bash
vitest run tests/validate --reporter=verbose
```
