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
import { getDesktop, getRelatedProducts } from '@/lib/data/fetchers'
import { desktopsData as desktops } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

export const revalidate = 3600

export async function generateStaticParams() {
  return desktops.map(desktop => ({ slug: desktop.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const desktop = await getDesktop(slug, locale as Locale)
  if (!desktop) return { title: 'Desktop App Not Found | AI Coding Stack' }

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'desktops',
    slug,
    product: {
      name: desktop.name,
      description: desktop.description,
      vendor: desktop.vendor,
      platforms: desktop.platforms,
      pricing: desktop.pricing,
      license: translateLicenseText(desktop.license, tShared),
    },
    typeDescription: 'Desktop Coding Agent for Developers',
  })
}

export default async function DesktopPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const desktop = await getDesktop(slug, locale as Locale)
  if (!desktop) notFound()

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const websiteUrl = desktop.websiteUrl || desktop.resourceUrls.download || undefined
  const downloadUrl = desktop.resourceUrls.download || undefined
  const pricingUrl = desktop.resourceUrls.pricing ?? undefined
  const schema = await generateSoftwareDetailSchema({
    product: {
      name: desktop.name,
      description: desktop.description,
      vendor: desktop.vendor,
      websiteUrl,
      downloadUrl,
      version: desktop.latestVersion,
      platforms: desktop.platforms,
      pricing: desktop.pricing,
      license: translateLicenseText(desktop.license, tShared),
    },
    category: 'desktops',
    locale: locale as Locale,
  })
  const relatedProducts = await getRelatedProducts(desktop.relatedProducts || [], locale as Locale)
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.desktops'), href: '/desktops' },
    { name: desktop.name, href: `/desktops/${desktop.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />
      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={desktop.name}
          description={desktop.description}
          vendor={desktop.vendor}
          category="DESKTOP"
          categoryLabel={tShared('categories.singular.desktop')}
          verified={desktop.verified ?? false}
          latestVersion={desktop.latestVersion}
          license={desktop.license}
          githubStars={getGithubStars('desktops', desktop.id)}
          platforms={desktop.platforms.map(platform => platform.os)}
          websiteUrl={websiteUrl}
          docsUrl={desktop.docsUrl || undefined}
          downloadUrl={downloadUrl}
        />
        <RelatedProducts products={relatedProducts} />
        <ProductPricing pricing={desktop.pricing} pricingUrl={pricingUrl} />
        <ResourceLinks resourceUrls={desktop.resourceUrls} />
        <CommunityLinks communityUrls={desktop.communityUrls} />
        <ProductCommands install={desktop.installCommand} launch={desktop.launchCommand} />
        <BackToNavigation href="/desktops" title={tShared('categories.all.desktops')} />
      </main>
    </PageLayout>
  )
}
