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
import { METADATA_CATEGORIES, SITE_CONFIG } from '@/lib/metadata/config'
import { getCategoryRoutePath } from '@/lib/metadata/helpers'

type ManifestItem = {
  id: string
  [key: string]: unknown
}

function getLocalizedUrl(baseUrl: string, path: string, locale: string): string {
  const localizedPath = path === '/' ? '' : path

  if (locale === 'en') {
    return `${baseUrl}${localizedPath}`
  }
  return `${baseUrl}/${locale}${localizedPath}`
}

function generateLocalizedPages(
  baseUrl: string,
  path: string,
  options: Pick<MetadataRoute.Sitemap[0], 'lastModified'> = {}
): MetadataRoute.Sitemap {
  return locales.map(locale => ({
    url: getLocalizedUrl(baseUrl, path, locale),
    ...options,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url
  const categoryPaths = METADATA_CATEGORIES.map(category => `/${getCategoryRoutePath(category)}`)

  // Static pages - generate for all locales
  const staticPaths = [
    '/',
    ...categoryPaths,
    '/ai-coding-stack',
    '/curated-collections',
    '/manifesto',
    '/ai-coding-landscape',
    '/open-source-rank',
    '/model-intelligence-index',
    '/model-price-intelligence-index',
    '/ides/comparison',
    '/clis/comparison',
    '/extensions/comparison',
    '/models/compare',
  ]

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap(path =>
    generateLocalizedPages(baseUrl, path)
  )

  // Article pages - generate for all locales
  const articlePages: MetadataRoute.Sitemap = articles.flatMap(article =>
    generateLocalizedPages(baseUrl, `/articles/${article.slug}`, {
      lastModified: new Date(article.date),
    })
  )

  // Doc pages - generate for all locales
  const docPages: MetadataRoute.Sitemap = docSections.flatMap(doc =>
    generateLocalizedPages(baseUrl, `/docs/${doc.slug}`)
  )

  // IDE detail pages - generate for all locales
  const ideDetailPages: MetadataRoute.Sitemap = (idesData as unknown as ManifestItem[])
    .filter(ide => ide.id)
    .flatMap(ide => generateLocalizedPages(baseUrl, `/ides/${ide.id}`))

  // CLI detail pages - generate for all locales
  const cliDetailPages: MetadataRoute.Sitemap = (clisData as unknown as ManifestItem[])
    .filter(cli => cli.id)
    .flatMap(cli => generateLocalizedPages(baseUrl, `/clis/${cli.id}`))

  const desktopDetailPages: MetadataRoute.Sitemap = (desktopsData as unknown as ManifestItem[])
    .filter(desktop => desktop.id)
    .flatMap(desktop => generateLocalizedPages(baseUrl, `/desktops/${desktop.id}`))

  // Model detail pages - generate for all locales
  const modelDetailPages: MetadataRoute.Sitemap = (modelsData as unknown as ManifestItem[])
    .filter(model => model.id)
    .flatMap(model => generateLocalizedPages(baseUrl, `/models/${model.id}`))

  // Provider detail pages - generate for all locales
  const providerDetailPages: MetadataRoute.Sitemap = (providersData as unknown as ManifestItem[])
    .filter(provider => provider.id)
    .flatMap(provider => generateLocalizedPages(baseUrl, `/model-providers/${provider.id}`))

  const extensionDetailPages: MetadataRoute.Sitemap = (extensionsData as unknown as ManifestItem[])
    .filter(extension => extension.id)
    .flatMap(extension => generateLocalizedPages(baseUrl, `/extensions/${extension.id}`))

  const vendorDetailPages: MetadataRoute.Sitemap = (vendorsData as unknown as ManifestItem[])
    .filter(vendor => vendor.id)
    .flatMap(vendor => generateLocalizedPages(baseUrl, `/vendors/${vendor.id}`))

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
