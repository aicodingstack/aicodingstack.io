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
import { getIDE, getRelatedProducts } from '@/lib/data/fetchers'
import { idesData as ides } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

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

  const tShared = await getTranslations({ locale })
  const licenseStr = ide.license ? translateLicenseText(ide.license, tShared) : ''

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

  const tPage = await getTranslations({ locale, namespace: 'pages.stacks.ideDetail' })
  const tShared = await getTranslations({ locale })

  // Transform URLs for component props
  const websiteUrl = ide.websiteUrl || ide.resourceUrls?.download || undefined
  const docsUrl = ide.docsUrl || undefined
  const downloadUrl = ide.resourceUrls?.download || undefined
  const pricingUrl = ide.resourceUrls?.pricing ?? undefined

  // Generate JSON-LD schema
  const schema = await generateSoftwareDetailSchema({
    product: {
      name: ide.name,
      description: ide.description,
      vendor: ide.vendor,
      websiteUrl,
      downloadUrl,
      version: ide.latestVersion,
      platforms: ide.platforms,
      pricing: ide.pricing,
      license: ide.license ? translateLicenseText(ide.license, tShared) : undefined,
    },
    category: 'ides',
    locale: locale as Locale,
  })

  // Fetch related products
  const relatedProducts = await getRelatedProducts(ide.relatedProducts || [], locale as Locale)

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('shared.terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('shared.categories.plural.ides'), href: '/ides' },
    { name: ide.name, href: `ides/${ide.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={ide.name}
          description={ide.description}
          vendor={ide.vendor}
          category="IDE"
          categoryLabel={tPage('categoryLabel')}
          verified={ide.verified ?? false}
          latestVersion={ide.latestVersion}
          license={ide.license}
          githubStars={getGithubStars('ides', ide.id)}
          platforms={ide.platforms?.map(p => p.os)}
          websiteUrl={websiteUrl}
          docsUrl={docsUrl}
          downloadUrl={downloadUrl}
        />

        <RelatedProducts products={relatedProducts} />

        <ProductPricing pricing={ide.pricing} pricingUrl={pricingUrl} />

        <ResourceLinks resourceUrls={ide.resourceUrls} />

        <CommunityLinks communityUrls={ide.communityUrls} />

        <ProductCommands install={ide.installCommand} launch={ide.launchCommand} />

        <BackToNavigation href="/ides" title={tPage('allIDEs')} />
      </main>
    </PageLayout>
  )
}
