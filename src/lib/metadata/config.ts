/**
 * Metadata Configuration
 * Centralized configuration for site-wide metadata constants and category-specific SEO keywords
 */

import { defaultLocale, locales } from '@/i18n/config'

export const SITE_CONFIG = {
  name: 'AI Coding Stack',
  url: 'https://aicodingstack.io',
  domain: 'aicodingstack.io',
  twitter: {
    site: '@aicodingstack',
    creator: '@aicodingstack',
  },
  defaultLocale,
  supportedLocales: locales,
} as const

export const OG_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  defaultImage: '/og-image.png',
  paths: {
    ides: '/og-images/ides',
    clis: '/og-images/clis',
    desktops: '/og-images/desktops',
    extensions: '/og-images/extensions',
    models: '/og-images/models',
    modelProviders: '/og-images/model-providers',
    vendors: '/og-images/vendors',
    articles: '/og-images/articles',
  },
} as const

export const METADATA_DEFAULTS = {
  currentYear: new Date().getUTCFullYear(),
  titleSeparator: ' - ',
  listSeparator: ' | ',
  siteName: 'AI Coding Stack',
  revalidate: 3600, // 1 hour ISR
} as const

/**
 * SEO Configuration
 * Additional SEO settings including robots directives and verification
 */
export const SEO_CONFIG = {
  /**
   * Site verification codes for search engines
   * Set these via environment variables for security
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  /**
   * Author and publisher information for better SEO
   */
  authors: [{ name: `${SITE_CONFIG.name} Team` }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  /**
   * Category for app stores
   */
  category: 'Technology',
} as const

/**
 * Category-specific SEO keywords
 * These are appended to dynamic keywords for each category
 */
export const CATEGORY_SEO_KEYWORDS = {
  ides: [
    'AI IDE',
    'AI code editor',
    'AI development environment',
    'code completion',
    'AI pair programming',
    'VS Code',
    'Cursor IDE',
    'TRAE',
  ],
  clis: [
    'AI CLI',
    'AI coding assistant',
    'command line AI',
    'terminal AI',
    'CLI tools',
    'developer CLI',
    'Codex',
    'Claude Code',
  ],
  desktops: [
    'desktop coding agent',
    'AI desktop app',
    'agent command center',
    'parallel coding agents',
    'local coding agent',
  ],
  extensions: [
    'AI extension',
    'IDE extension',
    'code editor plugin',
    'developer tools',
    'VS Code extension',
  ],
  models: [
    'coding LLM',
    'AI model',
    'code generation',
    'LLM for coding',
    'DeepSeek',
    'Kimi K2',
    'GLM',
    'Qwen3 Coder',
  ],
  modelProviders: [
    'LLM API',
    'AI API provider',
    'model provider',
    'API service',
    'DeepSeek',
    'Moonshot',
    'SiliconFlow',
    'OpenRouter',
  ],
  vendors: ['AI vendor', 'tool vendor', 'software vendor', 'AI company'],
  articles: ['AI coding', 'development guide', 'tutorial', 'tech article'],
  docs: ['documentation', 'guide', 'how-to', 'reference'],
} as const

/**
 * Category display names for SEO titles
 */
export const CATEGORY_DISPLAY_NAMES = {
  ides: 'AI-Powered IDEs',
  clis: 'AI Coding Assistant CLIs',
  desktops: 'Desktop Coding Agents',
  extensions: 'IDE Extensions',
  models: 'Coding LLM Models',
  modelProviders: 'LLM API Providers',
  vendors: 'Tool Vendors',
} as const

/**
 * Category example tools for SEO titles
 */
export const CATEGORY_EXAMPLES = {
  ides: ['VS Code', 'Cursor', 'TRAE'],
  clis: ['Codex', 'Claude Code'],
  desktops: ['Codex App', 'Claude Code Desktop', 'OpenCode'],
  extensions: ['Copilot', 'Tabnine', 'Codeium'],
  models: ['DeepSeek V3.1', 'Kimi K2', 'GLM 4.5', 'Qwen3 Coder'],
  modelProviders: ['DeepSeek', 'Moonshot', 'SiliconFlow', 'OpenRouter'],
  vendors: [],
} as const

export type Category = keyof typeof CATEGORY_SEO_KEYWORDS
export type Locale = (typeof SITE_CONFIG.supportedLocales)[number]
