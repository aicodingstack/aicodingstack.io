import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getExtension } from '@/lib/data/fetchers'
import { extensionsData as extensions } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { ProductDetailTemplate } from '@/templates'

export const revalidate = 3600

export async function generateStaticParams() {
  return extensions.map(extension => ({
    slug: extension.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const extension = await getExtension(slug, locale as Locale)

  if (!extension) {
    return { title: 'Extension Not Found | AI Coding Stack' }
  }

  const tGlobal = await getTranslations({ locale })
  const licenseStr = extension.license ? translateLicenseText(extension.license, tGlobal) : ''

  // Convert supportedIdes to platforms format for metadata generation
  const platforms = extension.supportedIdes?.map(ideSupport => ({
    os: ideSupport.ideId,
  }))

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'extensions',
    slug,
    product: {
      name: extension.name,
      description: extension.description,
      vendor: extension.vendor,
      platforms,
      pricing: extension.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI Coding Assistant Extension',
  })
}

export default async function ExtensionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const extension = await getExtension(slug, locale as Locale)

  if (!extension) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.extensionDetail' })
  const tGlobal = await getTranslations({ locale })

  return (
    <ProductDetailTemplate
      product={extension}
      productType="extension"
      locale={locale as Locale}
      category="extensions"
      translations={{
        categoryLabel: t('categoryLabel'),
        allProductsLabel: t('allExtensions'),
        breadcrumbs: {
          home: tGlobal('shared.common.aiCodingStack'),
          category: tGlobal('shared.stacks.extensions'),
        },
        productHero: {
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          supportedIdes: t('supportedIdes'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          download: t('download'),
        },
      }}
    />
  )
}
