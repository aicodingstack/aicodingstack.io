# Contributing to AI Coding Stack

Thank you for your interest in contributing to AI Coding Stack! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Adding or Updating Metadata](#adding-or-updating-metadata)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Manifest File Guidelines](#manifest-file-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Adding or Updating Metadata

**This is the most common and valuable contribution!** AI Coding Stack maintains metadata for AI coding tools, models, IDEs, CLIs, and providers in JSON manifest files.

#### Quick Start for Metadata Contributions

1. **Check if it exists**: Search the [manifests directory](manifests/) to see if the tool/model already exists
2. **Create an issue**: Use the [Metadata Contribution](https://github.com/aicodingstack/aicodingstack.io/issues/new?template=metadata_contribution.yml) template
3. **Gather information**: Collect official URLs, documentation, and accurate details
4. **Submit**: Either paste JSON in the issue or create a pull request

#### Where to Add Metadata

- **IDEs**: `manifests/ides/` - Integrated Development Environments (Cursor, Windsurf, etc.)
- **CLIs**: `manifests/clis/` - Command-line tools (Claude Code, Codex, etc.)
- **Extensions**: `manifests/extensions/` - Editor plugins and extensions
- **Models**: `manifests/models/` - Language models (GPT-4, Claude, Gemini, etc.)
- **Providers**: `manifests/providers/` - API providers (OpenAI, Anthropic, etc.)
- **Vendors**: `manifests/vendors/` - Companies and organizations

### Reporting Bugs

Found a bug on the website? Please:

1. **Search existing issues** to avoid duplicates
2. **Create a bug report** using the [Bug Report template](https://github.com/aicodingstack/aicodingstack.io/issues/new?template=bug_report.yml)
3. **Include details**: Browser, OS, steps to reproduce, screenshots

### Suggesting Features

Have an idea for a new feature?

1. **Search existing feature requests** to avoid duplicates
2. **Create a feature request** using the [Feature Request template](https://github.com/aicodingstack/aicodingstack.io/issues/new?template=feature_request.yml)
3. **Describe the use case** and why it would be valuable

### Code Contributions

Want to contribute code? Great! Please:

1. **Discuss first**: Open an issue to discuss your proposed changes
2. **Fork the repository**: Create your own fork
3. **Create a branch**: Use a descriptive branch name
4. **Make changes**: Follow our coding standards
5. **Test thoroughly**: Ensure all checks pass
6. **Submit a PR**: Use our pull request template

## Development Setup

### Prerequisites

- **Node.js**: 22.x or higher
- **npm**: Latest version
- **Git**: For version control

### Local Setup

```bash
# Clone the repository
git clone https://github.com/aicodingstack/aicodingstack.io.git
cd aicodingstack.io

# Install dependencies
npm ci

# Run validation tests
npm run test:validate

# Generate manifests and metadata
npm run generate:manifests
npm run generate:metadata

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the site.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test:validate` - Run repository validation tests (schemas, translations, alignment, etc.)
- `npm run test:urls` - Check URL accessibility (networked; CI-oriented)
- `npm run biome:check` - Run static analysis
- `npm run type-check` - Run TypeScript checks
- `npm run spell` - Run spell checker
- `npm test` - Run the Vitest suite in watch mode

## Manifest File Guidelines

### JSON Schema

All manifest files must conform to their respective JSON schemas located in `manifests/$schemas/`. The most common schemas are:

- [IDE Schema](manifests/$schemas/ide.schema.json)
- [CLI Schema](manifests/$schemas/cli.schema.json)
- [Model Schema](manifests/$schemas/model.schema.json)
- [Provider Schema](manifests/$schemas/provider.schema.json)

### Examples

The schemas are authoritative and require fields that differ by category. Start from a current, validated manifest rather than copying an abbreviated snippet:

- [IDE example](manifests/ides/cursor.json)
- [Model example](manifests/models/gpt-5-2.json)

Copy the closest existing manifest, update its `$schema`, `id`, content, translations, and URLs, then run the validation commands below.

### Field Requirements

#### Common Fields (Most Types)

- **`$schema`**: Relative path to the category schema
- **`name`**: Official product name
- **`id`**: Lowercase, hyphenated identifier that matches the filename
- **`vendor`**: Company or organization name
- **`description`**: Clear, concise default-language description
- **`translations`**: Localized fields required by the category schema
- **`websiteUrl`**: Official website
- **`docsUrl`**: Documentation URL
- **`sources`**: Authoritative URLs supporting the record or named fields
- **`lastVerifiedAt`**: Date the cited facts were last reviewed
- **`verifiedBy`**: GitHub handle or automation identifier responsible for the review
- **`confidence`**: `high`, `medium`, or `low`, based on source quality and recency

For new or updated records marked `verified: true`, include the provenance fields above. See
[Data Trust and Verification](docs/DATA-TRUST.md) for the badge semantics and rollout policy.

#### Model-Specific Fields
- **`size`**: Model size (e.g., "175B", "70B")
- **`contextWindow`**: Total context window in tokens
- **`maxOutput`**: Maximum output tokens
- **`pricing`**: Pricing information object

### Validation

Before submitting, validate your manifest:

```bash
# Run validation tests
npm run test:validate

# Validate URLs (networked)
npm run test:urls
```

### Best Practices

1. **Use official sources**: Only use information from official documentation
2. **Keep URLs current**: Verify all URLs are accessible
3. **Be concise**: Descriptions should be 1-2 sentences
4. **Use consistent formatting**: Follow existing manifest examples
5. **One file per tool/model**: Don't combine multiple entries
6. **Check for duplicates**: Search before adding new entries

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and meaningful commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Scopes

- `manifest`: Manifest file changes
- `ide`: IDE-related changes
- `cli`: CLI-related changes
- `model`: Model-related changes
- `ui`: UI/UX changes
- `deps`: Dependency updates
- `ci`: CI/CD changes

### Examples

```bash
feat(manifest): add Claude Sonnet 4.5 model
fix(ui): correct mobile navigation overflow
docs: update contribution guidelines
chore(deps): update Next.js to 15.1.0
```

## Pull Request Process

### Before Submitting

1. ✅ **Fork and create a branch** from `main`
2. ✅ **Make your changes** following the guidelines
3. ✅ **Validate locally**:
   ```bash
   npm run test:validate
   npm run biome:check
   npm run type-check
   npm run spell
   npm run build
   ```
4. ✅ **Commit with conventional commits**
5. ✅ **Update documentation** if needed

### Submitting a Pull Request

1. **Push to your fork**
2. **Create a pull request** to the `main` branch
3. **Fill out the PR template** completely
4. **Link related issues** (e.g., "Closes #123")
5. **Wait for CI checks** to pass
6. **Respond to review feedback** promptly

### Review Process

- **Automated checks**: CI must pass (Biome, types, validation, spell check, and build)
- **Maintainer review**: At least 1 approval required
- **Response time**: We aim to review within 3-5 business days
- **Merge**: Once approved, maintainers will merge your PR

### After Merging

- Your contribution will be automatically deployed to production
- You'll be listed as a contributor
- Thank you for making AI Coding Stack better! 🎉

## Community

### Getting Help

- **GitHub Discussions**: [Ask questions](https://github.com/aicodingstack/aicodingstack.io/discussions)
- **Issues**: [Search existing issues](https://github.com/aicodingstack/aicodingstack.io/issues)
- **Documentation**: [Read the docs](https://github.com/aicodingstack/aicodingstack.io/tree/main/docs)

### Stay Updated

- **Watch the repository**: Get notified of new releases
- **Star the project**: Show your support
- **Share**: Help others discover AI Coding Stack

## Recognition

Contributors are recognized in several ways:

- Listed in GitHub's contributors page
- Mentioned in release notes (for significant contributions)
- Featured in the community (for major features)

## Questions?

If you have questions not covered in this guide:

1. Check existing [GitHub Discussions](https://github.com/aicodingstack/aicodingstack.io/discussions)
2. Search [closed issues](https://github.com/aicodingstack/aicodingstack.io/issues?q=is%3Aissue+is%3Aclosed)
3. Open a new discussion or issue

---

Thank you for contributing to AI Coding Stack! Your contributions help developers discover and compare AI coding tools. 🚀
