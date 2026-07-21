import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CommunityLinks } from '@/components/product/CommunityLinks'
import { ProductHero } from '@/components/product/ProductHero'
import { VendorModels } from '@/components/product/VendorModels'
import { VendorProducts } from '@/components/product/VendorProducts'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getVendor } from '@/lib/data/fetchers'
import {
  clisData as clis,
  desktopsData as desktops,
  extensionsData as extensions,
  idesData as ides,
  modelsData as models,
  vendorsData as vendors,
} from '@/lib/generated'
import { localizeManifestItem } from '@/lib/manifest-i18n'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateVendorSchema } from '@/lib/metadata/schemas'
import { vendorMatches } from '@/lib/vendor-identity'
import type {
  ManifestCLI,
  ManifestDesktop,
  ManifestExtension,
  ManifestIDE,
  ManifestModel,
  ManifestVendor,
} from '@/types/manifests'

export const revalidate = 3600

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

/**
 * Find and localize all items for a given vendor.
 * This is shared by products (IDEs, CLIs, Extensions) and models.
 */
function findVendorItems<TLocalized>(
  items: { vendor: string }[],
  vendor: ManifestVendor,
  locale: Locale
): TLocalized[] {
  const localized = items
    .filter(item => vendorMatches(vendor, item.vendor))
    .map(item => localizeManifestItem(item as unknown as Record<string, unknown>, locale as Locale))
    .filter((m): m is NonNullable<typeof m> => m !== null)

  return localized as unknown as TLocalized[]
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

  const tShared = await getTranslations({ locale, namespace: 'shared' })

  // Generate JSON-LD schema
  const schema = await generateVendorSchema({
    vendor: {
      name: vendor.name,
      description: vendor.description,
      websiteUrl: vendor.websiteUrl || '',
    },
    locale: locale as Locale,
  })

  // Find all products by this vendor
  const vendorIdes = findVendorItems<ManifestIDE>(ides, vendor, locale as Locale).map(ide => ({
    ...ide,
    type: 'ide' as const,
  }))

  const vendorClis = findVendorItems<ManifestCLI>(clis, vendor, locale as Locale).map(cli => ({
    ...cli,
    type: 'cli' as const,
  }))

  const vendorDesktops = findVendorItems<ManifestDesktop>(desktops, vendor, locale as Locale).map(
    desktop => ({ ...desktop, type: 'desktop' as const })
  )

  const vendorExtensions = findVendorItems<ManifestExtension>(
    extensions,
    vendor,
    locale as Locale
  ).map(ext => ({ ...ext, type: 'extension' as const }))

  const vendorProducts = [...vendorIdes, ...vendorClis, ...vendorDesktops, ...vendorExtensions]

  // Find all models by this vendor
  const vendorModels = findVendorItems<ManifestModel>(models, vendor, locale as Locale)

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.vendors'), href: '/vendors' },
    { name: vendor.name, href: `vendors/${vendor.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <ProductHero
          name={vendor.name}
          description={vendor.description}
          category="VENDOR"
          categoryLabel={tShared('categories.singular.vendor')}
          verified={vendor.verified ?? false}
          websiteUrl={vendor.websiteUrl}
          docsUrl={null}
        />

        <VendorProducts products={vendorProducts} />

        <VendorModels models={vendorModels} />

        <CommunityLinks communityUrls={vendor.communityUrls} />

        <BackToNavigation href="/vendors" title={tShared('categories.all.vendors')} />
      </main>
    </PageLayout>
  )
}
