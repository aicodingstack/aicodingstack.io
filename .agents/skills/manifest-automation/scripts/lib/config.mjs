#!/usr/bin/env node

/**
 * Configuration and constants for manifest automation
 */

// Supported manifest types
export const MANIFEST_TYPES = ['cli', 'extension', 'ide', 'model', 'provider', 'vendor']

// Schema path mapping
export const SCHEMA_PATHS = {
  cli: 'manifests/$schemas/cli.schema.json',
  extension: 'manifests/$schemas/extension.schema.json',
  ide: 'manifests/$schemas/ide.schema.json',
  model: 'manifests/$schemas/model.schema.json',
  provider: 'manifests/$schemas/provider.schema.json',
  vendor: 'manifests/$schemas/vendor.schema.json',
}

// Manifest output path mapping
export const MANIFEST_PATHS = {
  cli: name => `manifests/clis/${name}.json`,
  extension: name => `manifests/extensions/${name}.json`,
  ide: name => `manifests/ides/${name}.json`,
  model: name => `manifests/models/${name}.json`,
  provider: name => `manifests/providers/${name}.json`,
  vendor: name => `manifests/vendors/${name}.json`,
}

// Workflow file mapping
export const WORKFLOW_PATHS = {
  cli: '.agents/skills/manifest-automation/scripts/workflows/cli-workflow.md',
  extension: '.agents/skills/manifest-automation/scripts/workflows/extension-workflow.md',
  ide: '.agents/skills/manifest-automation/scripts/workflows/ide-workflow.md',
  model: '.agents/skills/manifest-automation/scripts/workflows/model-workflow.md',
  provider: '.agents/skills/manifest-automation/scripts/workflows/provider-workflow.md',
  vendor: '.agents/skills/manifest-automation/scripts/workflows/vendor-workflow.md',
}

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  defaultTimeout: 10000, // 10 seconds
}

// Field categories for smart merge
export const FIELD_CATEGORIES = {
  // May update only after verification against a current authoritative source.
  AUTO_UPDATE: [
    'latestVersion',
    'websiteUrl',
    'docsUrl',
    'resourceUrls.changelog',
    'resourceUrls.download',
    'tokenPricing',
    'size',
    'contextWindow',
    'maxOutput',
  ],

  // Preserve identity, relationships, and localized copy for manual review.
  PRESERVE: ['id', 'name', 'translations', 'relatedProducts', 'vendor', 'provider'],

  // Smart merge: add new, keep existing
  MERGE_ADDITIVE: ['communityUrls', 'platformUrls', 'supportedIdes', 'platforms'],

  // Present both for Claude to decide
  CONDITIONAL: [
    'description',
    'license',
    'pricing',
    'releaseDate',
    'lifecycle',
    'sources',
    'lastVerifiedAt',
    'verifiedBy',
    'confidence',
  ],
}

// Platform OS enum values
export const PLATFORM_OS = ['macos', 'windows', 'linux', 'web']

// IDE enum values for extensions
export const IDE_TYPES = ['vscode', 'cursor', 'windsurf', 'trae', 'zed', 'jetbrains']

// Common URL patterns for community links
export const COMMUNITY_URL_PATTERNS = {
  linkedin: ['linkedin.com/company/', 'linkedin.com/in/'],
  twitter: ['twitter.com/', 'x.com/'],
  github: ['github.com/'],
  youtube: ['youtube.com/@', 'youtube.com/c/', 'youtube.com/channel/'],
  discord: ['discord.gg/', 'discord.com/invite/'],
  reddit: ['reddit.com/r/'],
  blog: [
    // Generic patterns - need validation
    '/blog',
    'blog.',
    'medium.com/',
  ],
}

// URL validation patterns
export const URL_PATTERNS = {
  https: /^https:\/\/.+/,
  github: /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/,
  vscodeMarketplace: /^https:\/\/marketplace\.visualstudio\.com\/items\?itemName=.+/,
  jetbrainsPlugins: /^https:\/\/plugins\.jetbrains\.com\/plugin\/.+/,
  openVsx: /^https:\/\/open-vsx\.org\/extension\/.+/,
  huggingface: /^https:\/\/huggingface\.co\/.+/,
  artificialAnalysis: /^https:\/\/artificialanalysis\.ai\/.+/,
  openrouter: /^https:\/\/openrouter\.ai\/.+/,
}

// Common documentation URL patterns
export const DOCS_URL_PATTERNS = ['/docs', '/documentation', '/api', '/guides', 'docs.']

// Common pricing URL patterns
export const PRICING_URL_PATTERNS = ['/pricing', '/plans', '/buy', '/subscribe', 'pricing.']

// Common download URL patterns
export const DOWNLOAD_URL_PATTERNS = ['/download', '/downloads', '/get', '/install', 'download.']
