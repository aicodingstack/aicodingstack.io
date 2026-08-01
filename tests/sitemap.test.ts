import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { locales } from '@/i18n/config'
import { METADATA_CATEGORIES, SITE_CONFIG } from '@/lib/metadata/config'
import { getCategoryRoutePath } from '@/lib/metadata/helpers'

describe('sitemap', () => {
  const entries = sitemap()

  it('contains unique canonical URLs only', () => {
    const urls = entries.map(entry => entry.url)

    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every(url => url.startsWith(SITE_CONFIG.url))).toBe(true)
    expect(entries.every(entry => entry.alternates === undefined)).toBe(true)
    expect(entries.every(entry => entry.changeFrequency === undefined)).toBe(true)
    expect(entries.every(entry => entry.priority === undefined)).toBe(true)
  })

  it('uses final canonical URLs for locale homepages', () => {
    const expectedUrls = locales.map(locale =>
      locale === 'en' ? SITE_CONFIG.url : `${SITE_CONFIG.url}/${locale}`
    )
    const sitemapUrls = new Set(entries.map(entry => entry.url))

    for (const url of expectedUrls) {
      expect(sitemapUrls.has(url)).toBe(true)
      expect(sitemapUrls.has(`${url}/`)).toBe(false)
    }
  })

  it('contains every public category route for every locale', () => {
    const sitemapUrls = new Set(entries.map(entry => entry.url))

    for (const category of METADATA_CATEGORIES) {
      const publicPath = getCategoryRoutePath(category)

      for (const locale of locales) {
        const expectedUrl =
          locale === 'en'
            ? `${SITE_CONFIG.url}/${publicPath}`
            : `${SITE_CONFIG.url}/${locale}/${publicPath}`

        expect(sitemapUrls.has(expectedUrl)).toBe(true)
      }
    }
  })

  it('uses verified article dates and omits synthetic modification dates elsewhere', () => {
    for (const entry of entries) {
      if (entry.url.includes('/articles/')) {
        expect(entry.lastModified).toBeInstanceOf(Date)
      } else {
        expect(entry.lastModified).toBeUndefined()
      }
    }
  })
})

describe('robots.txt', () => {
  const robots = readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8')

  it('allows search engines to fetch Next.js rendering assets', () => {
    expect(robots).not.toContain('Disallow: /_next/static/')
  })

  it('declares the production sitemap', () => {
    expect(robots).toContain(`Sitemap: ${SITE_CONFIG.url}/sitemap.xml`)
  })
})
