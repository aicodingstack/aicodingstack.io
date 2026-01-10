import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CommunityLinks } from '@/components/product/CommunityLinks'
import { ProductCommands } from '@/components/product/ProductCommands'
import { ProductHero } from '@/components/product/ProductHero'
import { ProductPricing } from '@/components/product/ProductPricing'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { ResourceLinks } from '@/components/product/ResourceLinks'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getCLI, getRelatedProducts } from '@/lib/data/fetchers'
import { clisData as clis } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

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

  const tShared = await getTranslations({ locale })
  const licenseStr = cli.license ? translateLicenseText(cli.license, tShared) : ''

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

  const tPage = await getTranslations({ locale, namespace: 'pages.stacks.cliDetail' })
  const tShared = await getTranslations({ locale })

  // Transform URLs for component props
  const websiteUrl = cli.websiteUrl || cli.resourceUrls?.download || undefined
  const docsUrl = cli.docsUrl || undefined
  const downloadUrl = cli.resourceUrls?.download || undefined
  const pricingUrl = cli.resourceUrls?.pricing ?? undefined

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
      license: cli.license ? translateLicenseText(cli.license, tShared) : undefined,
    },
    category: 'clis',
    locale: locale as Locale,
  })

  // Fetch related products
  const relatedProducts = await getRelatedProducts(cli.relatedProducts || [], locale as Locale)

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('shared.terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('shared.categories.plural.clis'), href: '/clis' },
    { name: cli.name, href: `clis/${cli.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={cli.name}
          description={cli.description}
          vendor={cli.vendor}
          category="CLI"
          categoryLabel={tPage('categoryLabel')}
          verified={cli.verified ?? false}
          latestVersion={cli.latestVersion}
          license={cli.license}
          githubStars={getGithubStars('clis', cli.id)}
          platforms={cli.platforms?.map(p => p.os)}
          websiteUrl={websiteUrl}
          docsUrl={docsUrl}
          downloadUrl={downloadUrl}
        />

        <RelatedProducts products={relatedProducts} />

        <ProductPricing pricing={cli.pricing} pricingUrl={pricingUrl} />

        <ResourceLinks resourceUrls={cli.resourceUrls} />

        <CommunityLinks communityUrls={cli.communityUrls} />

        <ProductCommands install={cli.installCommand} launch={cli.launchCommand} />

        <BackToNavigation href="/clis" title={tPage('allCLIs')} />
      </main>
    </PageLayout>
  )
}
