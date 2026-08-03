import { describe, expect, it } from 'vitest'
import {
  buildListPageTitle,
  buildTitle,
  generateArticleMetadata,
  generateComparisonMetadata,
  generateDocsMetadata,
  generateListPageMetadata,
  generateModelDetailMetadata,
  generateSoftwareDetailMetadata,
  generateStaticPageMetadata,
} from '@/lib/metadata'

describe('Metadata title helpers', () => {
  it('leaves the site name to the root layout title template by default', () => {
    expect(buildTitle({ title: 'AI Coding Models' })).toBe('AI Coding Models')
  })

  it('builds a concise localized list title without examples or a repeated brand', () => {
    expect(
      buildListPageTitle({
        translatedTitle: 'AI Coding Models',
        year: 2026,
      })
    ).toBe('AI Coding Models 2026')
  })
})

/**
 * Test suite to verify metadata generators produce correct structure
 * after refactoring to use common buildMetadataWithSocial pipeline
 */
describe('Metadata Generators', () => {
  describe('generateListPageMetadata', () => {
    // Skip: requires Next.js server environment for getTranslations
    it.skip('should generate complete metadata with all required fields', async () => {
      const metadata = await generateListPageMetadata({
        locale: 'en',
        category: 'ides',
        translationNamespace: 'pages.ides',
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toBeDefined()
      expect(metadata.description).toBeDefined()

      // Verify alternates
      expect(metadata.alternates).toBeDefined()
      expect(metadata.alternates?.canonical).toBeDefined()
      expect(metadata.alternates?.languages).toBeDefined()

      // Verify OpenGraph
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBeDefined()
      expect(metadata.openGraph?.description).toBeDefined()
      expect(metadata.openGraph?.url).toBeDefined()
      expect(metadata.openGraph?.locale).toBe('en_US')
      expect((metadata.openGraph as { type?: string })?.type).toBe('website')

      // Verify Twitter
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.title).toBeDefined()
      expect(metadata.twitter?.description).toBeDefined()
      expect((metadata.twitter as { card?: string })?.card).toBe('summary_large_image')

      // Verify robots
      expect(metadata.robots).toBeDefined()
    })
  })

  describe('generateSoftwareDetailMetadata', () => {
    it('should generate complete metadata for software products', async () => {
      const metadata = await generateSoftwareDetailMetadata({
        locale: 'en',
        category: 'ides',
        slug: 'cursor',
        product: {
          name: 'Cursor',
          description: 'AI-powered code editor',
          vendor: 'Anysphere',
          platforms: [{ os: 'macOS' }, { os: 'Windows' }],
          license: 'Proprietary',
        },
        typeDescription: 'AI IDE',
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toContain('Cursor')
      expect(metadata.description).toContain('Cursor')
      expect(metadata.keywords).toBeUndefined()

      // Verify OpenGraph type is article for detail pages
      expect((metadata.openGraph as { type?: string })?.type).toBe('article')

      // Verify canonical includes category and slug
      expect(metadata.alternates?.canonical).toContain('ides/cursor')
    })

    it('derives detail routes from camel-case category identifiers', async () => {
      const metadata = await generateSoftwareDetailMetadata({
        locale: 'en',
        category: 'modelProviders',
        slug: 'openrouter',
        product: {
          name: 'OpenRouter',
          description: 'Multi-model API platform',
          vendor: 'OpenRouter',
        },
        typeDescription: 'LLM API Provider',
      })

      expect(metadata.alternates?.canonical).toBe('/model-providers/openrouter')
      expect(metadata.keywords).toBeUndefined()
    })

    it('uses localized title and description overrides without appending English copy', async () => {
      const metadata = await generateSoftwareDetailMetadata({
        locale: 'zh-Hans',
        category: 'clis',
        slug: 'codex-cli',
        titleOverride: 'Codex CLI | 功能与安装指南 2026',
        descriptionOverride: 'Codex CLI 是 OpenAI 的命令行编码 Agent。',
        product: {
          name: 'Codex CLI',
          description: 'English fallback description',
          vendor: 'OpenAI',
          platforms: [{ os: 'macOS' }, { os: 'Windows' }],
          license: 'Apache-2.0',
        },
        typeDescription: 'CLI',
      })

      expect(metadata.title).toBe('Codex CLI | 功能与安装指南 2026')
      expect(metadata.description).toBe('Codex CLI 是 OpenAI 的命令行编码 Agent。')
      expect(metadata.openGraph?.title).toBe('Codex CLI - CLI')
      expect(metadata.openGraph?.description).toBe('Codex CLI 是 OpenAI 的命令行编码 Agent。')
      expect(metadata.twitter?.title).toBe('Codex CLI - CLI')
      expect(metadata.twitter?.description).toBe('Codex CLI 是 OpenAI 的命令行编码 Agent。')
    })
  })

  describe('generateModelDetailMetadata', () => {
    // Skip: requires Next.js server environment for getTranslations
    it.skip('should generate complete metadata for model products', async () => {
      const metadata = await generateModelDetailMetadata({
        locale: 'en',
        slug: 'deepseek-v3',
        model: {
          name: 'DeepSeek V3',
          description: 'Advanced coding model',
          vendor: 'DeepSeek',
          size: '671B',
          contextWindow: 128000,
          maxOutput: 8192,
          tokenPricing: {
            status: 'available',
            primaryOffer: 'global-standard',
            offers: [
              {
                id: 'global-standard',
                currency: 'USD',
                region: 'global',
                serviceTier: 'standard',
                effectiveFrom: null,
                effectiveTo: null,
                tiers: [
                  {
                    condition: null,
                    rates: {
                      input: 0.27,
                      output: 1.1,
                      cacheRead: null,
                      cacheWrite: null,
                    },
                  },
                ],
              },
            ],
          },
        },
        translationNamespace: 'pages.models',
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toContain('DeepSeek V3')
      expect(metadata.description).toContain('DeepSeek V3')
      expect(metadata.description).toContain('DeepSeek')

      // Verify OpenGraph type is article for detail pages
      expect((metadata.openGraph as { type?: string })?.type).toBe('article')

      // Verify canonical includes models path
      expect(metadata.alternates?.canonical).toContain('models/deepseek-v3')
    })
  })

  describe('generateComparisonMetadata', () => {
    // Skip: requires Next.js server environment for getTranslations
    it.skip('should generate complete metadata for comparison pages', async () => {
      const metadata = await generateComparisonMetadata({
        locale: 'en',
        category: 'ides',
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toBeDefined()
      expect(metadata.description).toBeDefined()

      // Verify OpenGraph type is website for comparison pages
      expect((metadata.openGraph as { type?: string })?.type).toBe('website')

      // Verify canonical includes comparison path
      expect(metadata.alternates?.canonical).toContain('ides/comparison')
    })
  })

  describe('generateArticleMetadata', () => {
    it('should generate complete metadata for articles with publishedTime', async () => {
      const metadata = await generateArticleMetadata({
        locale: 'en',
        slug: 'test-article',
        article: {
          title: 'Test Article',
          description: 'Test description',
          date: '2025-01-01',
        },
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toContain('Test Article')

      // Verify OpenGraph has publishedTime
      expect((metadata.openGraph as { type?: string })?.type).toBe('article')
      expect((metadata.openGraph as { publishedTime?: string })?.publishedTime).toBe('2025-01-01')

      // Verify Twitter includes creator
      expect(metadata.twitter?.creator).toBeDefined()
    })
  })

  describe('generateDocsMetadata', () => {
    it('should generate complete metadata for documentation pages', async () => {
      const metadata = await generateDocsMetadata({
        locale: 'en',
        slug: 'getting-started',
        doc: {
          title: 'Getting Started',
          description: 'Learn how to get started',
        },
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toContain('Getting Started')
      expect(metadata.description).toBe('Learn how to get started')

      // Verify OpenGraph type is article for docs
      expect((metadata.openGraph as { type?: string })?.type).toBe('article')

      // Verify canonical includes docs path
      expect(metadata.alternates?.canonical).toContain('docs/getting-started')
    })
  })

  describe('generateStaticPageMetadata', () => {
    it('should generate complete metadata for static pages', async () => {
      const metadata = await generateStaticPageMetadata({
        locale: 'en',
        basePath: 'about',
        title: 'About Us',
        description: 'Learn about our mission',
        ogType: 'website',
        pageType: 'static',
      })

      // Verify basic structure
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe('About Us')
      expect(metadata.description).toBe('Learn about our mission')
      expect(metadata.keywords).toBeUndefined()

      // Verify OpenGraph type
      expect((metadata.openGraph as { type?: string })?.type).toBe('website')

      // Verify canonical
      expect(metadata.alternates?.canonical).toBe('/about')
    })

    it('should support home page type', async () => {
      const metadata = await generateStaticPageMetadata({
        locale: 'en',
        basePath: '',
        title: 'Home',
        description: 'Welcome home',
        pageType: 'home',
      })

      // Verify canonical for root
      expect(metadata.alternates?.canonical).toBe('/')
    })
  })

  describe('Locale handling', () => {
    it('should generate correct OpenGraph locale for different locales', async () => {
      const enMetadata = await generateStaticPageMetadata({
        locale: 'en',
        basePath: 'test',
        title: 'Test',
        description: 'Test',
      })

      const zhMetadata = await generateStaticPageMetadata({
        locale: 'zh-Hans',
        basePath: 'test',
        title: 'Test',
        description: 'Test',
      })

      expect(enMetadata.openGraph?.locale).toBe('en_US')
      expect(zhMetadata.openGraph?.locale).toBe('zh_CN')
    })

    it('should generate language alternates for all locales', async () => {
      const metadata = await generateStaticPageMetadata({
        locale: 'en',
        basePath: 'test',
        title: 'Test',
        description: 'Test',
      })

      const languages = metadata.alternates?.languages
      expect(languages).toBeDefined()
      expect(languages?.en).toBe('/test')
      expect(languages?.['zh-Hans']).toBe('/zh-Hans/test')
      expect(languages?.ja).toBe('/ja/test')
    })
  })

  describe('Canonical URL handling', () => {
    it('should generate correct canonical for default locale', async () => {
      const metadata = await generateStaticPageMetadata({
        locale: 'en',
        basePath: 'docs',
        title: 'Docs',
        description: 'Documentation',
      })

      // Default locale should not have locale prefix in canonical
      expect(metadata.alternates?.canonical).toBe('/docs')
    })

    it('should generate correct canonical for non-default locale', async () => {
      const metadata = await generateStaticPageMetadata({
        locale: 'ja',
        basePath: 'docs',
        title: 'Docs',
        description: 'Documentation',
      })

      // Non-default locale should have locale prefix in canonical
      expect(metadata.alternates?.canonical).toBe('/ja/docs')
    })
  })
})
