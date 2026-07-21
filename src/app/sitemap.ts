import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import {
  clisData,
  desktopsData,
  extensionsData,
  idesData,
  modelsData,
  providersData,
  vendorsData,
} from '@/lib/generated'
import { articles } from '@/lib/generated/articles'
import { docSections } from '@/lib/generated/docs'
import { SITE_CONFIG } from '@/lib/metadata/config'

type ManifestItem = {
  id: string
  [key: string]: unknown
}

function getLocalizedUrl(baseUrl: string, path: string, locale: string): string {
  if (locale === 'en') {
    return `${baseUrl}${path}`
  }
  return `${baseUrl}/${locale}${path}`
}

function generateLocalizedPages(
  baseUrl: string,
  path: string,
  options: Omit<MetadataRoute.Sitemap[0], 'url' | 'alternates'>
): MetadataRoute.Sitemap {
  return locales.map(locale => ({
    url: getLocalizedUrl(baseUrl, path, locale),
    alternates: {
      languages: Object.fromEntries(locales.map(loc => [loc, getLocalizedUrl(baseUrl, path, loc)])),
    },
    ...options,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url
  const currentDate = new Date()

  // Use build time for more accurate lastModified
  const buildDate = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME) : currentDate

  // Static pages - generate for all locales
  const staticPaths = [
    { path: '/', priority: 1, changeFreq: 'weekly' as const },
    { path: '/ides', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/clis', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/desktops', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/extensions', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/models', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/model-providers', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/vendors', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/articles', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/ai-coding-stack', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/docs', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/curated-collections', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/manifesto', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/ai-coding-landscape', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/open-source-rank', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/ides/comparison', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/clis/comparison', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/extensions/comparison', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/models/compare', priority: 0.7, changeFreq: 'weekly' as const },
  ]

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, priority, changeFreq }) =>
    generateLocalizedPages(baseUrl, path, {
      lastModified: buildDate,
      changeFrequency: changeFreq,
      priority,
    })
  )

  // Article pages - generate for all locales
  const articlePages: MetadataRoute.Sitemap = articles.flatMap(article =>
    generateLocalizedPages(baseUrl, `/articles/${article.slug}`, {
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })
  )

  // Doc pages - generate for all locales
  const docPages: MetadataRoute.Sitemap = docSections.flatMap(doc =>
    generateLocalizedPages(baseUrl, `/docs/${doc.slug}`, {
      lastModified: buildDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  )

  // IDE detail pages - generate for all locales
  const ideDetailPages: MetadataRoute.Sitemap = (idesData as unknown as ManifestItem[])
    .filter(ide => ide.id)
    .flatMap(ide =>
      generateLocalizedPages(baseUrl, `/ides/${ide.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  // CLI detail pages - generate for all locales
  const cliDetailPages: MetadataRoute.Sitemap = (clisData as unknown as ManifestItem[])
    .filter(cli => cli.id)
    .flatMap(cli =>
      generateLocalizedPages(baseUrl, `/clis/${cli.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  const desktopDetailPages: MetadataRoute.Sitemap = (desktopsData as unknown as ManifestItem[])
    .filter(desktop => desktop.id)
    .flatMap(desktop =>
      generateLocalizedPages(baseUrl, `/desktops/${desktop.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  // Model detail pages - generate for all locales (更频繁更新)
  const modelDetailPages: MetadataRoute.Sitemap = (modelsData as unknown as ManifestItem[])
    .filter(model => model.id)
    .flatMap(model =>
      generateLocalizedPages(baseUrl, `/models/${model.id}`, {
        lastModified: buildDate,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })
    )

  // Provider detail pages - generate for all locales
  const providerDetailPages: MetadataRoute.Sitemap = (providersData as unknown as ManifestItem[])
    .filter(provider => provider.id)
    .flatMap(provider =>
      generateLocalizedPages(baseUrl, `/model-providers/${provider.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  const extensionDetailPages: MetadataRoute.Sitemap = (extensionsData as unknown as ManifestItem[])
    .filter(extension => extension.id)
    .flatMap(extension =>
      generateLocalizedPages(baseUrl, `/extensions/${extension.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  const vendorDetailPages: MetadataRoute.Sitemap = (vendorsData as unknown as ManifestItem[])
    .filter(vendor => vendor.id)
    .flatMap(vendor =>
      generateLocalizedPages(baseUrl, `/vendors/${vendor.id}`, {
        lastModified: buildDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

  return [
    ...staticPages,
    ...articlePages,
    ...docPages,
    ...ideDetailPages,
    ...cliDetailPages,
    ...desktopDetailPages,
    ...modelDetailPages,
    ...providerDetailPages,
    ...extensionDetailPages,
    ...vendorDetailPages,
  ]
}
