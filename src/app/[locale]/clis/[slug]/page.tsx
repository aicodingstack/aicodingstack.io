import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/JsonLd'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CLILandingPage } from '@/components/product/CLILandingPage'
import { CommunityLinks } from '@/components/product/CommunityLinks'
import { ProductCommands } from '@/components/product/ProductCommands'
import { ProductHero } from '@/components/product/ProductHero'
import { ProductPricing } from '@/components/product/ProductPricing'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { ResourceLinks } from '@/components/product/ResourceLinks'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getCLILandingContent } from '@/lib/content/cli-landing-pages'
import { getCLI, getRelatedProducts } from '@/lib/data/fetchers'
import { clisData as clis } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailMetadata } from '@/lib/metadata'
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

  const tShared = await getTranslations({ locale, namespace: 'shared' })
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

  const tShared = await getTranslations({ locale, namespace: 'shared' })
  const landingContent = cli.landingPage ? getCLILandingContent(cli.id, locale as Locale) : null

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
  const faqSchema = landingContent
    ? await generateFAQPageSchema(
        landingContent.faq.items.map(item => ({
          question: item.question,
          answer: item.answer,
        }))
      )
    : null

  // Breadcrumb items
  const breadcrumbItems = [
    { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
    { name: tShared('categories.plural.clis'), href: '/clis' },
    { name: cli.name, href: `clis/${cli.id}` },
  ]

  return (
    <PageLayout schema={schema}>
      {faqSchema && <JsonLd data={faqSchema} />}
      <Breadcrumb items={breadcrumbItems} />

      <main>
        {landingContent ? (
          <CLILandingPage
            cli={cli}
            content={landingContent}
            locale={locale}
            githubStars={getGithubStars(cli.githubUrl)}
            pricingUrl={pricingUrl}
            relatedProducts={relatedProducts}
          />
        ) : (
          <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
            <ProductHero
              name={cli.name}
              description={cli.description}
              vendor={cli.vendor}
              category="CLI"
              categoryLabel={tShared('categories.singular.cli')}
              verified={cli.verified ?? false}
              deprecated={cli.deprecated ?? false}
              latestVersion={cli.latestVersion}
              license={cli.license}
              githubStars={getGithubStars(cli.githubUrl)}
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

            <BackToNavigation href="/clis" title={tShared('categories.all.clis')} />
          </div>
        )}
      </main>
    </PageLayout>
  )
}
