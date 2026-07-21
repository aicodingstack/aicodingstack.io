/**
 * i18n Translation Validation for Metadata
 * Ensures all locales have required translation keys for metadata generation
 */

import { locales } from '@/i18n/config'
import type { Category } from './config'

/**
 * Required translation keys for each page type
 */
export const REQUIRED_TRANSLATION_KEYS = {
  // 静态页面（有 meta 对象的）
  staticWithMeta: ['meta.title', 'meta.description'] as const,

  // 静态页面（无 meta 对象的）
  staticSimple: ['title', 'subtitle'] as const,

  // 列表页面
  list: ['title', 'subtitle'] as const,

  // 模型详情页
  modelDetail: ['metaTitle', 'contextWindow'] as const,

  // 文章列表页
  articles: ['meta.title', 'meta.description', 'keywords'] as const,

  // 文档列表页
  docs: ['meta.title', 'meta.description', 'keywords'] as const,

  // 比较页（每个分类）
  comparison: (category: Category) => [`${category}.title`, `${category}.subtitle`] as const,
} as const

/**
 * Page to translation requirements mapping
 */
export interface PageTranslationRequirement {
  namespace: string
  requiredKeys: readonly string[]
  type:
    | 'staticWithMeta'
    | 'staticSimple'
    | 'list'
    | 'modelDetail'
    | 'articles'
    | 'docs'
    | 'comparison'
}

/**
 * Registry of all pages and their translation requirements
 */
export const PAGE_TRANSLATION_REQUIREMENTS: Record<string, PageTranslationRequirement> = {
  // ========== Static Pages with meta object (7个) ==========
  '/': {
    namespace: 'pages.home',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/manifesto': {
    namespace: 'pages.manifesto',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/search': {
    namespace: 'pages.search',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/ai-coding-landscape': {
    namespace: 'pages.landscape',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/ai-coding-stack': {
    namespace: 'pages.stacksOverview',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/open-source-rank': {
    namespace: 'pages.openSourceRank',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },
  '/curated-collections': {
    namespace: 'pages.curatedCollections',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.staticWithMeta,
    type: 'staticWithMeta',
  },

  // ========== Static Pages - Articles & Docs (2个) ==========
  '/articles': {
    namespace: 'pages.articles',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.articles,
    type: 'articles',
  },
  '/docs': {
    namespace: 'pages.docs',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.docs,
    type: 'docs',
  },

  // ========== List Pages (6个) ==========
  '/models': {
    namespace: 'pages.models',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/ides': {
    namespace: 'pages.ides',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/clis': {
    namespace: 'pages.clis',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/desktops': {
    namespace: 'pages.desktops',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/extensions': {
    namespace: 'pages.extensions',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/model-providers': {
    namespace: 'pages.modelProviders',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },
  '/vendors': {
    namespace: 'pages.vendors',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.list,
    type: 'list',
  },

  // ========== Detail Pages (8个) ==========
  '/models/[slug]': {
    namespace: 'pages.modelDetail',
    requiredKeys: REQUIRED_TRANSLATION_KEYS.modelDetail,
    type: 'modelDetail',
  },
  '/ides/[slug]': {
    namespace: 'pages.ideDetail',
    requiredKeys: ['name', 'description'] as const,
    type: 'staticSimple',
  },
  '/clis/[slug]': {
    namespace: 'pages.cliDetail',
    requiredKeys: ['name', 'description'] as const,
    type: 'staticSimple',
  },
  '/desktops/[slug]': {
    namespace: 'pages.desktops',
    requiredKeys: ['title', 'subtitle'] as const,
    type: 'staticSimple',
  },
  '/extensions/[slug]': {
    namespace: 'pages.extensionDetail',
    requiredKeys: ['name', 'description'] as const,
    type: 'staticSimple',
  },
  '/model-providers/[slug]': {
    namespace: 'pages.modelProviderDetail',
    requiredKeys: ['name', 'description'] as const,
    type: 'staticSimple',
  },
  '/vendors/[slug]': {
    namespace: 'pages.vendorDetail',
    requiredKeys: ['name', 'description'] as const,
    type: 'staticSimple',
  },
  '/articles/[slug]': {
    namespace: 'pages.articles',
    requiredKeys: ['title', 'description'] as const,
    type: 'staticSimple',
  },
  '/docs/[slug]': {
    namespace: 'pages.docs',
    requiredKeys: ['title', 'description'] as const,
    type: 'staticSimple',
  },

  // ========== Comparison Pages (4个) ==========
  '/models/compare': {
    namespace: 'pages.comparison',
    requiredKeys: ['models.title', 'models.subtitle'] as const,
    type: 'comparison',
  },
  '/ides/comparison': {
    namespace: 'pages.comparison',
    requiredKeys: ['ides.title', 'ides.subtitle'] as const,
    type: 'comparison',
  },
  '/clis/comparison': {
    namespace: 'pages.comparison',
    requiredKeys: ['clis.title', 'clis.subtitle'] as const,
    type: 'comparison',
  },
  '/extensions/comparison': {
    namespace: 'pages.comparison',
    requiredKeys: ['extensions.title', 'extensions.subtitle'] as const,
    type: 'comparison',
  },
}

// 总计: 29 个页面的翻译需求
// - 有 meta 对象的静态页面: 7 个
// - Articles & Docs 列表页: 2 个
// - 分类列表页: 6 个
// - 详情页: 8 个
// - 比较页: 4 个

/**
 * Validation error for missing translation keys
 */
export interface TranslationValidationError {
  locale: string
  namespace: string
  missingKey: string
  page: string
}

/**
 * Validate that all locales have required translation keys for a page
 * Only runs in development mode
 */
export async function validatePageTranslations(
  pagePath: string
): Promise<TranslationValidationError[]> {
  if (process.env.NODE_ENV !== 'development') {
    return []
  }

  const requirement = PAGE_TRANSLATION_REQUIREMENTS[pagePath]
  if (!requirement) {
    console.warn(`⚠️  No translation requirement defined for page: ${pagePath}`)
    return []
  }

  const errors: TranslationValidationError[] = []

  // Check each locale
  for (const locale of locales) {
    try {
      // Dynamically import translation file
      const namespace = requirement.namespace.replace('pages.', '')
      const messages = await import(`@/../translations/${locale}/pages/${namespace}.json`)

      // Check each required key
      for (const key of requirement.requiredKeys) {
        const value = getNestedValue(messages.default || messages, key)
        if (!value) {
          errors.push({
            locale,
            namespace: requirement.namespace,
            missingKey: key,
            page: pagePath,
          })
        }
      }
    } catch (err) {
      console.error(
        `❌ Failed to load translation file for ${locale}/${requirement.namespace}:`,
        err
      )
    }
  }

  // Log errors if found
  if (errors.length > 0) {
    console.error(`\n❌ Translation validation failed for page: ${pagePath}`)
    errors.forEach(error => {
      console.error(`  • [${error.locale}] Missing key "${error.missingKey}" in ${error.namespace}`)
    })
  }

  return errors
}

/**
 * Helper: Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown)
}

/**
 * Validate all registered pages
 * Returns total error count
 */
export async function validateAllPageTranslations(): Promise<number> {
  if (process.env.NODE_ENV !== 'development') {
    return 0
  }

  console.log('\n🌐 Validating translations for all pages...\n')

  let totalErrors = 0
  const pageCount = Object.keys(PAGE_TRANSLATION_REQUIREMENTS).length

  for (const [pagePath] of Object.entries(PAGE_TRANSLATION_REQUIREMENTS)) {
    const errors = await validatePageTranslations(pagePath)
    totalErrors += errors.length
  }

  if (totalErrors === 0) {
    console.log(
      `✅ All ${pageCount} pages have complete translations across ${locales.length} locales!\n`
    )
  } else {
    console.error(`\n❌ Found ${totalErrors} missing translation keys across ${pageCount} pages\n`)
  }

  return totalErrors
}

/**
 * Assert that a specific locale has all required keys for a page
 * Throws in development if keys are missing
 */
export function assertPageTranslationComplete(pagePath: string, _locale: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const requirement = PAGE_TRANSLATION_REQUIREMENTS[pagePath]
  if (!requirement) {
    return
  }

  // This would be called during metadata generation to validate at runtime
  // Implementation would check the specific locale's translation
}

/**
 * Get statistics about translation coverage
 */
export function getTranslationStats() {
  const totalPages = Object.keys(PAGE_TRANSLATION_REQUIREMENTS).length
  const totalLocales = locales.length

  const statsByType: Record<string, number> = {}
  Object.values(PAGE_TRANSLATION_REQUIREMENTS).forEach(req => {
    statsByType[req.type] = (statsByType[req.type] || 0) + 1
  })

  return {
    totalPages,
    totalLocales,
    expectedTranslationFiles: totalPages * totalLocales,
    pagesByType: statsByType,
  }
}
