import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getIDE } from '@/lib/data/fetchers'
import { idesData as ides } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { ProductDetailTemplate } from '@/templates'

export const revalidate = 3600

export async function generateStaticParams() {
  return ides.map(ide => ({
    slug: ide.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const ide = await getIDE(slug, locale as Locale)

  if (!ide) {
    return { title: 'IDE Not Found | AI Coding Stack' }
  }

  const tGlobal = await getTranslations({ locale })
  const licenseStr = ide.license ? translateLicenseText(ide.license, tGlobal) : ''

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'ides',
    slug,
    product: {
      name: ide.name,
      description: ide.description,
      vendor: ide.vendor,
      platforms: ide.platforms,
      pricing: ide.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI-Powered IDE for Developers',
  })
}

export default async function IDEPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const ide = await getIDE(slug, locale as Locale)

  if (!ide) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.ideDetail' })
  const tGlobal = await getTranslations({ locale })

  return (
    <ProductDetailTemplate
      product={ide}
      productType="ide"
      locale={locale as Locale}
      category="ides"
      translations={{
        categoryLabel: t('categoryLabel'),
        allProductsLabel: t('allIDEs'),
        breadcrumbs: {
          home: tGlobal('shared.common.aiCodingStack'),
          category: tGlobal('shared.stacks.ides'),
        },
        productHero: {
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          platforms: t('platforms'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          download: t('download'),
        },
      }}
    />
  )
}
