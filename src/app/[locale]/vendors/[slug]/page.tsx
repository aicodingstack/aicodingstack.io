import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { LinkCardGrid, ProductHero } from '@/components/product'
import { VendorModels } from '@/components/vendor/VendorModels'
import { VendorProducts } from '@/components/vendor/VendorProducts'
import type { Locale } from '@/i18n/config'
import { getVendor } from '@/lib/data/fetchers'
import {
  clisData as clis,
  extensionsData as extensions,
  idesData as ides,
  modelsData as models,
  vendorsData as vendors,
} from '@/lib/generated'
import { localizeManifestItem, localizeManifestItems } from '@/lib/manifest-i18n'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import type { ManifestCLI, ManifestExtension, ManifestIDE, ManifestModel } from '@/types/manifests'

export const revalidate = 3600

// Community link metadata for localization
const COMMUNITY_LINK_METADATA: Record<string, { titleKey: string; descriptionKey: string }> = {
  linkedin: { titleKey: 'linkedin', descriptionKey: 'connectLinkedIn' },
  twitter: { titleKey: 'twitter', descriptionKey: 'followTwitter' },
  github: { titleKey: 'github', descriptionKey: 'viewGitHub' },
  youtube: { titleKey: 'youtube', descriptionKey: 'watchYouTube' },
  discord: { titleKey: 'discord', descriptionKey: 'joinDiscord' },
  reddit: { titleKey: 'reddit', descriptionKey: 'joinReddit' },
}

export async function generateStaticParams() {
  return vendors.map(vendor => ({
    slug: vendor.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const vendor = await getVendor(slug, locale as Locale)

  if (!vendor) {
    return { title: 'Vendor Not Found | AI Coding Stack' }
  }

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'vendors',
    slug,
    product: {
      name: vendor.name,
      description: vendor.description,
      vendor: vendor.name,
    },
    typeDescription: 'AI Technology Company',
  })
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const vendor = await getVendor(slug, locale as Locale)

  if (!vendor) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'pages.vendorDetail' })
  const tGlobal = await getTranslations({ locale })

  const websiteUrl = vendor.websiteUrl

  // Find all products by this vendor
  // Note: Products store vendor.name, not vendor.id, so we match against vendor.name
  const vendorIdes = ides
    .filter(ide => ide.vendor === vendor.name)
    .map(ide => ({
      ...localizeManifestItem(ide as unknown as Record<string, unknown>, locale as Locale),
      type: 'ide' as const,
    })) as (ManifestIDE & { type: 'ide' })[]

  const vendorClis = clis
    .filter(cli => cli.vendor === vendor.name)
    .map(cli => ({
      ...localizeManifestItem(cli as unknown as Record<string, unknown>, locale as Locale),
      type: 'cli' as const,
    })) as (ManifestCLI & { type: 'cli' })[]

  const vendorExtensions = extensions
    .filter(ext => ext.vendor === vendor.name)
    .map(ext => ({
      ...localizeManifestItem(ext as unknown as Record<string, unknown>, locale as Locale),
      type: 'extension' as const,
    })) as (ManifestExtension & { type: 'extension' })[]

  const vendorProducts = [...vendorIdes, ...vendorClis, ...vendorExtensions]

  // Find all models by this vendor
  // Note: Models also store vendor.name, not vendor.id
  const vendorModels = localizeManifestItems(
    models.filter(model => model.vendor === vendor.name) as unknown as Record<string, unknown>[],
    locale as Locale
  ) as ManifestModel[]

  // Schema.org structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: vendor.name,
    description: vendor.description,
    url: vendor.websiteUrl,
  }

  return (
    <>
      <JsonLd data={organizationSchema} />
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.vendors'), href: 'vendors' },
          { name: vendor.name, href: `vendors/${vendor.id}` },
        ]}
      />

      {/* Hero Section */}
      <ProductHero
        name={vendor.name}
        description={vendor.description}
        category="VENDOR"
        categoryLabel={t('categoryLabel')}
        verified={vendor.verified ?? false}
        websiteUrl={websiteUrl}
      />

      {/* Community Links */}
      {vendor.communityUrls &&
        Object.entries(vendor.communityUrls).filter(([, url]) => url).length > 0 && (
          <LinkCardGrid
            title={t('communityLinks')}
            links={Object.entries(vendor.communityUrls)
              .filter(([, url]) => url)
              .map(([key]) => {
                const metadata = COMMUNITY_LINK_METADATA[key]
                return {
                  key,
                  title: metadata ? t(metadata.titleKey) : key,
                  description: metadata ? t(metadata.descriptionKey) : '',
                }
              })}
            urls={vendor.communityUrls}
            layout="vertical"
            gridCols="grid-cols-2 md:grid-cols-4"
          />
        )}

      {/* Vendor Products (IDEs, CLIs, Extensions) */}
      <VendorProducts products={vendorProducts} locale={locale} title={t('products')} />

      {/* Vendor Models */}
      <VendorModels models={vendorModels} locale={locale} title={t('models')} />

      {/* Navigation */}
      <BackToNavigation href="/vendors" title={t('allVendors')} />

      <Footer />
    </>
  )
}
