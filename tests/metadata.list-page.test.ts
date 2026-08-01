import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getTranslations } = vi.hoisted(() => ({ getTranslations: vi.fn() }))

vi.mock('next-intl/server', () => ({ getTranslations }))

import { generateListPageMetadata } from '@/lib/metadata'
import { METADATA_CATEGORIES } from '@/lib/metadata/config'

describe('list page metadata routes', () => {
  beforeEach(() => {
    const translate = Object.assign(
      (key: string) =>
        key === 'title'
          ? 'LLM API Providers for AI Coding'
          : 'Compare LLM API providers for coding.',
      { has: (key: string) => key === 'meta.description' }
    )

    getTranslations.mockResolvedValue(translate)
  })

  const categoryRoutes = [
    ['ides', 'ides'],
    ['clis', 'clis'],
    ['desktops', 'desktops'],
    ['extensions', 'extensions'],
    ['models', 'models'],
    ['modelProviders', 'model-providers'],
    ['vendors', 'vendors'],
    ['articles', 'articles'],
    ['docs', 'docs'],
  ] as const

  it('covers every metadata category', () => {
    expect(categoryRoutes.map(([category]) => category)).toEqual([...METADATA_CATEGORIES])
  })

  it.each(categoryRoutes)('maps the %s category to /%s', async (category, publicPath) => {
    const metadata = await generateListPageMetadata({
      locale: 'en',
      category,
      translationNamespace: 'pages.modelProviders',
    })

    expect(metadata.alternates?.canonical).toBe(`/${publicPath}`)
    expect(metadata.alternates?.languages).toMatchObject({
      en: `/${publicPath}`,
      'zh-Hans': `/zh-Hans/${publicPath}`,
    })
    expect((metadata.openGraph as { url?: string })?.url).toBe(
      `https://aicodingstack.io/${publicPath}`
    )
    expect(metadata.keywords).toBeUndefined()
  })
})
