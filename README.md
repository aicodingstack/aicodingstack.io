# AI Coding Stack

<p align="center">
  <img src="https://raw.githubusercontent.com/aicodingstack/aicodingstack.io/refs/heads/main/public/icon.svg" alt="AI Coding Stack Icon" width="160" />
</p>

[![CI Status](https://img.shields.io/github/actions/workflow/status/aicodingstack/aicodingstack.io/ci.yml?style=flat-square&label=CI)](https://github.com/aicodingstack/aicodingstack.io/actions/workflows/ci.yml)
[![Deploy Status](https://img.shields.io/github/actions/workflow/status/aicodingstack/aicodingstack.io/deploy-production.yml?style=flat-square&label=Deploy)](https://github.com/aicodingstack/aicodingstack.io/actions/workflows/deploy-production.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
<br>
[![Twitter Follow](https://img.shields.io/twitter/follow/aicodingstack?style=flat-square&logo=x&label=Follow)](https://x.com/aicodingstack)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://aicodingstack.io/discord)

> Your AI Coding Ecosystem Hub - Discover, Compare, Build Faster

Live Site: [https://aicodingstack.io](https://aicodingstack.io) | [Contributing](CONTRIBUTING.md) | [Discussions](https://github.com/aicodingstack/aicodingstack.io/discussions)

AI Coding Stack is a comprehensive directory and community-maintained metadata repository for AI-powered coding tools, models, and platforms.

## Features

- **Comprehensive Directory**: Browse and discover AI coding tools across multiple categories (IDEs, CLIs, Extensions, Models, Providers, and Vendors)
- **Smart Comparison**: Compare tools side-by-side with detailed specifications and pricing
- **Search & Discovery**: Powerful search functionality to find the right tools for your needs
- **Open Source Rankings**: Track and compare GitHub stars and community engagement
- **AI Coding Landscape**: Visual overview of the entire AI coding ecosystem
- **Curated Collections**: Hand-picked tool collections for specific use cases
- **Community-Driven**: Open-source metadata maintained by the developer community
- **Always Updated**: Latest version tracking and up-to-date information
- **Multilingual**: Support for 12 languages including English, German, Simplified & Traditional Chinese, Korean, Spanish, French, Indonesian, Japanese, Portuguese, Russian, and Turkish

## Data Structure

All metadata for AI coding tools is organized in JSON manifest files within the `manifests/` directory. Each tool, model, or platform has its own manifest file following a structured schema.

### Adding or Updating Metadata

To add a new tool or update existing information:

1. **Find the right category**: Locate the appropriate directory in `manifests/`
2. **Add or update a JSON file**: Create a new manifest file or edit an existing one
3. **Follow the schema**: Each category has a JSON schema for validation
4. **Submit a PR**: Open a pull request with your changes

### Manifest Categories

All metadata is stored as JSON files in the `manifests/` directory:

- **IDEs** (`manifests/ides/`) - AI-powered integrated development environments
  - Example: Cursor, Windsurf, VS Code with AI features
- **CLIs** (`manifests/clis/`) - Command-line AI coding assistants
  - Example: Claude Code CLI, Codex, GitHub Copilot CLI
- **Extensions** (`manifests/extensions/`) - AI code assistant plugins and extensions
  - Example: GitHub Copilot, Cline, Continue, Roo Code
- **Models** (`manifests/models/`) - Large language models for coding
  - Example: GPT-4, Claude Opus, DeepSeek V3, Qwen3 Coder
- **Providers** (`manifests/providers/`) - LLM API providers and platforms
  - Example: OpenAI, Anthropic, DeepSeek, OpenRouter, SiliconFlow
- **Vendors** (`manifests/vendors/`) - Companies and organizations behind the tools

### Manifest File Structure

Each manifest file is a JSON object following a specific schema. Here's a basic example for a CLI tool:

```json
{
  "$schema": "../$schemas/cli.schema.json",
  "id": "tool-id",
  "name": "Tool Name",
  "description": "Brief description of the tool",
  "websiteUrl": "https://example.com",
  "docsUrl": "https://docs.example.com",
  "vendor": "Vendor Name",
  "latestVersion": "1.0.0",
  "githubUrl": "https://github.com/vendor/tool",
  "translations": {
    "de": {
      "description": "Kurze Beschreibung des Tools"
    }
  }
}
```

### Adding Translations

You can add multilingual support by including a `translations` field:

```json
{
  "description": "English description",
  "translations": {
    "de": {
      "description": "Deutsche Beschreibung"
    },
    "zh-Hans": {
      "description": "简体中文描述"
    },
    "ko": {
      "description": "한국어 설명"
    }
  }
}
```

### Validation

All manifest files are automatically validated against JSON schemas. Make sure your JSON:
- Follows the schema for the category
- Has valid URLs (HTTPS only)
- Includes all required fields
- Is properly formatted

## Project Structure

- `manifests/` - **JSON metadata files** for all tools and platforms (this is where you contribute!)
- `content/` - MDX documentation, guides, articles, and FAQs (multilingual)
- `src/` - Next.js application source code
- `public/` - Static assets and resources
- `scripts/` - Validation and data processing scripts
- `translations/` - i18n translation files for all supported languages

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **Internationalization**: next-intl
- **Content**: MDX for documentation
- **Deployment**: Cloudflare Workers (via OpenNext for Cloudflare)

## Contributing

We welcome contributions! Please check the manifest files in `manifests/` to add or update tool information. See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines and schema references.

## Contact

- **Issues & Bugs:** [GitHub Issues](https://github.com/aicodingstack/aicodingstack.io/issues)
- **Discussions:** [GitHub Discussions](https://github.com/aicodingstack/aicodingstack.io/discussions)
- **Security:** security@aicodingstack.io
- **General:** hello@aicodingstack.io

## License

Apache 2.0

## Website

Visit [aicodingstack.io](https://aicodingstack.io) to explore the directory.
