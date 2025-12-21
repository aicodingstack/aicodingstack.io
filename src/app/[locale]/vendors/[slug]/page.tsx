import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { getVendor } from '@/lib/data/fetchers'
import {
  clisData as clis,
  extensionsData as extensions,
  idesData as ides,
  modelsData as models,
  vendorsData as vendors,
} from '@/lib/generated'
import { localizeManifestItem } from '@/lib/manifest-i18n'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { EntityModelsGrid, EntityProductsGrid, OrganizationDetailTemplate } from '@/templates'
import type { ManifestCLI, ManifestExtension, ManifestIDE, ManifestModel } from '@/types/manifests'

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
  const vendorModels: ManifestModel[] = models
    .filter(model => model.vendor === vendor.name)
    .map(model =>
      localizeManifestItem(model as unknown as Record<string, unknown>, locale as Locale)
    )
    .filter((m): m is NonNullable<typeof m> => m !== null) as unknown as ManifestModel[]

  return (
    <OrganizationDetailTemplate
      organization={vendor}
      locale={locale}
      breadcrumbs={[
        { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
        { name: tGlobal('shared.stacks.vendors'), href: '/vendors' },
        { name: vendor.name, href: `vendors/${vendor.id}` },
      ]}
      backToHref="/vendors"
      backToTitle={t('allVendors')}
      categoryLabel={t('categoryLabel')}
      translations={{
        visitWebsite: t('visitWebsite'),
        communityLinksTitle: t('communityLinks'),
      }}
      showCommunityLinks={true}
    >
      {/* Vendor Products (IDEs, CLIs, Extensions) */}
      <EntityProductsGrid products={vendorProducts} locale={locale} title={t('products')} />

      {/* Vendor Models */}
      <EntityModelsGrid models={vendorModels} locale={locale} title={t('models')} />
    </OrganizationDetailTemplate>
  )
}
