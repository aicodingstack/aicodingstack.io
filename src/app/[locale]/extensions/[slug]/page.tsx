import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CommunityLinks } from '@/components/product/CommunityLinks'
import { ProductHero } from '@/components/product/ProductHero'
import { ProductPricing } from '@/components/product/ProductPricing'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { ResourceLinks } from '@/components/product/ResourceLinks'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getExtension, getRelatedProducts } from '@/lib/data/fetchers'
import { extensionsData as extensions } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

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

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const licenseStr = extension.license ? translateLicenseText(extension.license, tShared) : ''

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

  const tShared = await getTranslations({ locale, namespace: 'shared' })

  // Transform URLs for component props
  const websiteUrl = extension.websiteUrl || extension.resourceUrls?.download || undefined
  const docsUrl = extension.docsUrl || undefined
  const downloadUrl = extension.resourceUrls?.download || undefined
  const pricingUrl = extension.resourceUrls?.pricing ?? undefined

  // Generate JSON-LD schema
  const schema = await generateSoftwareDetailSchema({
    product: {
      name: extension.name,
      description: extension.description,
      vendor: extension.vendor,
      websiteUrl,
      downloadUrl,
      version: extension.latestVersion,
      platforms: extension.supportedIdes?.map(ide => ({ os: ide.ideId })),
      pricing: extension.pricing,
      license: extension.license ? translateLicenseText(extension.license, tShared) : undefined,
    },
    category: 'extensions',
    locale: locale as Locale,
    applicationSubCategory: 'AI Assistant',
    compatibleWith: extension.supportedIdes?.map(ide => ide.ideId).join(', ') || undefined,
  })

  // Fetch related products
  const relatedProducts = await getRelatedProducts(
    extension.relatedProducts || [],
    locale as Locale
  )

  // Build additional info for ProductHero (supported IDEs)
  const additionalInfo =
    extension.supportedIdes && extension.supportedIdes.length > 0
      ? [
          {
            label: tShared('terms.supportedIdes'),
            value: extension.supportedIdes.map(ide => ide.ideId).join(', '),
          },
        ]
      : undefined

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.extensions'), href: '/extensions' },
    { name: extension.name, href: `extensions/${extension.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={extension.name}
          manifestId={extension.id}
          description={extension.description}
          vendor={extension.vendor}
          category="EXTENSION"
          categoryLabel={tShared('categories.singular.extension')}
          verified={extension.verified ?? false}
          latestVersion={extension.latestVersion}
          license={extension.license}
          githubStars={getGithubStars(extension.githubUrl)}
          additionalInfo={additionalInfo}
          websiteUrl={websiteUrl}
          docsUrl={docsUrl}
          downloadUrl={downloadUrl}
        />

        <RelatedProducts products={relatedProducts} />

        <ProductPricing pricing={extension.pricing} pricingUrl={pricingUrl} />

        <ResourceLinks resourceUrls={extension.resourceUrls} />

        <CommunityLinks communityUrls={extension.communityUrls} />

        <BackToNavigation href="/extensions" title={tShared('categories.all.extensions')} />
      </main>
    </PageLayout>
  )
}
