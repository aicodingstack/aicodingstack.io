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
  extensionsData as extensions,
  idesData as ides,
  modelsData as models,
  vendorsData as vendors,
} from '@/lib/generated'
import { localizeManifestItem } from '@/lib/manifest-i18n'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
import { generateVendorSchema } from '@/lib/metadata/schemas'
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

  // Generate JSON-LD schema
  const schema = await generateVendorSchema({
    vendor: {
      name: vendor.name,
      description: vendor.description,
      websiteUrl: vendor.websiteUrl || '',
    },
    locale: locale as 'en' | 'zh-Hans' | 'de' | 'ko',
  })

  // Build community links configuration
  const communityLinks = [
    {
      key: 'linkedin',
      title: t('community.linkedin.title'),
      description: t('community.linkedin.description'),
    },
    {
      key: 'twitter',
      title: t('community.twitter.title'),
      description: t('community.twitter.description'),
    },
    {
      key: 'github',
      title: t('community.github.title'),
      description: t('community.github.description'),
    },
    {
      key: 'youtube',
      title: t('community.youtube.title'),
      description: t('community.youtube.description'),
    },
    {
      key: 'discord',
      title: t('community.discord.title'),
      description: t('community.discord.description'),
    },
    {
      key: 'reddit',
      title: t('community.reddit.title'),
      description: t('community.reddit.description'),
    },
    {
      key: 'blog',
      title: t('community.blog.title'),
      description: t('community.blog.description'),
    },
  ]

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

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tGlobal('shared.stacks.vendors'), href: '/vendors' },
    { name: vendor.name, href: `vendors/${vendor.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <Breadcrumb items={breadcrumbItems} />

      <ProductHero
        name={vendor.name}
        description={vendor.description}
        category="VENDOR"
        categoryLabel={t('categoryLabel')}
        verified={vendor.verified ?? false}
        websiteUrl={vendor.websiteUrl}
        docsUrl={vendor.docsUrl ?? null}
        labels={{
          visitWebsite: t('visitWebsite'),
          documentation: t('documentation'),
        }}
      />

      {vendor.communityUrls && (
        <CommunityLinks
          communityUrls={vendor.communityUrls}
          title={t('communityLinks')}
          links={communityLinks}
          layout="vertical"
          gridCols="grid-cols-2 md:grid-cols-4"
        />
      )}

      {/* Vendor Products (IDEs, CLIs, Extensions) */}
      <VendorProducts products={vendorProducts} locale={locale} title={t('products')} />

      {/* Vendor Models */}
      <VendorModels models={vendorModels} locale={locale} title={t('models')} />

      <BackToNavigation href="/vendors" title={t('allVendors')} />
    </PageLayout>
  )
}
