import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getCLI } from '@/lib/data/fetchers'
import { clisData as clis } from '@/lib/generated'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { ProductDetailTemplate } from '@/templates'

export const revalidate = 3600

export async function generateStaticParams() {
  return clis.map(cli => ({
    slug: cli.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const cli = await getCLI(slug, locale as Locale)

  if (!cli) {
    return { title: 'CLI Not Found | AI Coding Stack' }
  }

  const tGlobal = await getTranslations({ locale })
  const licenseStr = cli.license ? translateLicenseText(cli.license, tGlobal) : ''

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'clis',
    slug,
    product: {
      name: cli.name,
      description: cli.description,
      vendor: cli.vendor,
      platforms: cli.platforms,
      pricing: cli.pricing,
      license: licenseStr,
    },
    typeDescription: 'AI Coding Assistant CLI',
  })
}

export default async function CLIPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const cli = await getCLI(slug, locale as Locale)

  if (!cli) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.cliDetail' })
  const tGlobal = await getTranslations({ locale })

  return (
    <ProductDetailTemplate
      product={cli}
      productType="cli"
      locale={locale as Locale}
      category="clis"
      translations={{
        categoryLabel: t('categoryLabel'),
        allProductsLabel: t('allCLIs'),
        breadcrumbs: {
          home: tGlobal('shared.common.aiCodingStack'),
          category: tGlobal('shared.stacks.clis'),
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
