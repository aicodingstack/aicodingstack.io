import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CLILandingPage } from '@/components/product/CLILandingPage'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getCLILandingContent } from '@/lib/content/cli-landing-pages'
import { getCLI, getRelatedProducts } from '@/lib/data/fetchers'
import { clisData as clis } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import {
  buildTypedProductName,
  generateSoftwareDetailMetadata,
  METADATA_DEFAULTS,
} from '@/lib/metadata'
import { generateFAQPageSchema, generateSoftwareDetailSchema } from '@/lib/metadata/schemas'

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

  const landingContent = getCLILandingContent(cli.id, locale as Locale)
  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const tComponent = await getTranslations({ locale, namespace: 'components.product' })
  const licenseStr = cli.license ? translateLicenseText(cli.license, tShared) : ''
  const typeDescription = tShared('categories.singular.cli')
  const metadataProductName = buildTypedProductName(cli.name, typeDescription)

  return await generateSoftwareDetailMetadata({
    locale: locale as Locale,
    category: 'clis',
    slug,
    titleOverride: tComponent('cliLanding.meta.title', {
      product: metadataProductName,
      year: METADATA_DEFAULTS.currentYear,
    }),
    descriptionOverride: landingContent.answer,
    product: {
      name: cli.name,
      description: landingContent.answer,
      vendor: cli.vendor,
      platforms: cli.platforms,
      pricing: cli.pricing,
      license: licenseStr,
    },
    typeDescription,
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

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const landingContent = getCLILandingContent(cli.id, locale as Locale)

  // Transform URLs for component props
  const websiteUrl = cli.websiteUrl || cli.resourceUrls?.download || undefined
  const downloadUrl = cli.resourceUrls?.download || undefined
  const pricingUrl = cli.resourceUrls?.pricing ?? undefined

  // Generate JSON-LD schema
  const schema = await generateSoftwareDetailSchema({
    product: {
      name: cli.name,
      description: landingContent.answer,
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
  const faqSchema = await generateFAQPageSchema(
    landingContent.faq.items.map(item => ({
      question: item.question,
      answer: item.answer,
    }))
  )

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.clis'), href: '/clis' },
    { name: cli.name, href: `clis/${cli.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      <JsonLd data={faqSchema} />
      <Breadcrumb items={breadcrumbItems} />

      <main>
        <CLILandingPage
          cli={cli}
          content={landingContent}
          locale={locale}
          githubStars={getGithubStars(cli.githubUrl)}
          pricingUrl={pricingUrl}
          relatedProducts={relatedProducts}
        />
      </main>
    </PageLayout>
  )
}
