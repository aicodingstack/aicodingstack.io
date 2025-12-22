import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { ProductCommands } from '@/components/product/ProductCommands'
import { ProductHero } from '@/components/product/ProductHero'
import { ProductLinks } from '@/components/product/ProductLinks'
import { ProductPricing } from '@/components/product/ProductPricing'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getCLI, getRelatedProducts } from '@/lib/data/fetchers'
import { clisData as clis } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'
import { transformCommunityUrls, transformResourceUrls } from '@/lib/product-utils'

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

  // Transform URLs
  const websiteUrl = cli.websiteUrl || cli.resourceUrls?.download || undefined
  const docsUrl = cli.docsUrl || undefined
  const downloadUrl = cli.resourceUrls?.download || undefined

  const resourceUrls = transformResourceUrls(cli.resourceUrls)
  const communityUrls = transformCommunityUrls(cli.communityUrls)

  // Generate JSON-LD schema
  const schema = await generateSoftwareDetailSchema({
    product: {
      name: cli.name,
      description: cli.description,
      vendor: cli.vendor,
      websiteUrl,
      downloadUrl,
      version: cli.latestVersion,
      platforms: cli.platforms,
      pricing: cli.pricing,
      license: cli.license ? translateLicenseText(cli.license, tGlobal) : undefined,
    },
    category: 'clis',
    locale: locale as Locale,
  })

  // Fetch related products
  const relatedProducts = await getRelatedProducts(cli.relatedProducts || [], locale as Locale)

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tGlobal('shared.stacks.clis'), href: '/clis' },
    { name: cli.name, href: `clis/${cli.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <ProductHero
        name={cli.name}
        description={cli.description}
        vendor={cli.vendor}
        category="CLI"
        categoryLabel={t('categoryLabel')}
        verified={cli.verified ?? false}
        latestVersion={cli.latestVersion}
        license={cli.license}
        githubStars={getGithubStars('clis', cli.id)}
        platforms={cli.platforms?.map(p => p.os)}
        websiteUrl={websiteUrl}
        docsUrl={docsUrl}
        downloadUrl={downloadUrl}
        labels={{
          vendor: t('vendor'),
          version: t('version'),
          license: t('license'),
          stars: t('stars'),
          platforms: t('platforms'),
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
          download: t('download'),
        }}
      />

      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}

      <ProductPricing pricing={cli.pricing} pricingUrl={resourceUrls.pricing} />

      <ProductLinks resourceUrls={resourceUrls} communityUrls={communityUrls} />

      <ProductCommands install={cli.installCommand} launch={cli.launchCommand} />

      <BackToNavigation href="/clis" title={t('allCLIs')} />
    </PageLayout>
  )
}
