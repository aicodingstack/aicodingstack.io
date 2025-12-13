import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import {
  ProductCommands,
  ProductHero,
  ProductLinks,
  ProductPricing,
  RelatedProducts,
} from '@/components/product'
import type { Locale } from '@/i18n/config'
import { getRelatedProducts } from '@/lib/data/fetchers'
import { getGithubStars } from '@/lib/generated/github-stars'
import { translateLicenseText } from '@/lib/license'
import { generateSoftwareDetailSchema } from '@/lib/metadata/schemas'
import { transformCommunityUrls, transformResourceUrls } from '@/lib/product-utils'
import type { ManifestCLI, ManifestExtension, ManifestIDE } from '@/types/manifests'

export interface ProductDetailTemplateProps {
  // Product data
  product: ManifestIDE | ManifestCLI | ManifestExtension

  // Product type
  productType: 'ide' | 'cli' | 'extension'

  // Locale
  locale: Locale

  // Translations
  translations: {
    categoryLabel: string
    allProductsLabel: string
    breadcrumbs: {
      home: string
      category: string
    }
    productHero: {
      vendor: string
      version: string
      license: string
      stars: string
      platforms?: string
      supportedIdes?: string
      visitWebsite: string
      documentation: string
      download: string
    }
  }

  // Navigation category
  category: 'ides' | 'clis' | 'extensions'
}

export async function ProductDetailTemplate({
  product,
  productType,
  locale,
  translations,
  category,
}: ProductDetailTemplateProps) {
  const tGlobal = await getTranslations({ locale })

  // Transform URLs (null → undefined)
  const websiteUrl = product.resourceUrls?.download || product.websiteUrl
  const docsUrl = product.docsUrl || undefined
  const downloadUrl = product.resourceUrls?.download || undefined

  const resourceUrls = transformResourceUrls(product.resourceUrls)
  const communityUrls = transformCommunityUrls(product.communityUrls)

  // Generate JSON-LD schema using unified system
  const softwareApplicationSchema = await generateSoftwareDetailSchema({
    product: {
      name: product.name,
      description: product.description,
      vendor: product.vendor,
      websiteUrl,
      downloadUrl,
      version: product.latestVersion,
      platforms: 'platforms' in product ? product.platforms : undefined,
      pricing: product.pricing,
      license: product.license ? translateLicenseText(product.license, tGlobal) : undefined,
    },
    category,
    locale,
    // Extension-specific fields
    applicationSubCategory: productType === 'extension' ? 'AI Assistant' : undefined,
    compatibleWith:
      productType === 'extension' && 'supportedIdes' in product && product.supportedIdes
        ? product.supportedIdes.map(ide => ide.ideId).join(', ')
        : undefined,
  })

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: translations.breadcrumbs.home, href: '/ai-coding-stack' },
    { name: translations.breadcrumbs.category, href: category },
    { name: product.name, href: `${category}/${product.id}` },
  ]

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.relatedProducts || [], locale)

  // Build ProductHero props
  const heroProps = {
    name: product.name,
    description: product.description,
    vendor: product.vendor,
    category: (productType === 'ide' ? 'IDE' : productType === 'cli' ? 'CLI' : 'IDE') as
      | 'CLI'
      | 'IDE'
      | 'MCP'
      | 'PROVIDER'
      | 'MODEL'
      | 'VENDOR',
    categoryLabel: translations.categoryLabel,
    verified: product.verified ?? false,
    latestVersion: product.latestVersion,
    license: product.license,
    githubStars: getGithubStars(category, product.id),
    websiteUrl,
    docsUrl,
    downloadUrl,
    labels: translations.productHero,

    // CLI/IDE: use platforms
    ...('platforms' in product &&
      product.platforms && {
        platforms: product.platforms.map(p => p.os),
      }),

    // Extension: use additionalInfo with supportedIdes
    ...('supportedIdes' in product &&
      product.supportedIdes &&
      product.supportedIdes.length > 0 && {
        additionalInfo: [
          {
            label: translations.productHero.supportedIdes || 'Supported IDEs',
            value: product.supportedIdes.map(ide => ide.ideId).join(', '),
          },
        ],
      }),
  }

  // Determine install/launch commands
  const installCommand =
    productType === 'extension' && 'supportedIdes' in product
      ? product.supportedIdes?.[0]?.installCommand || product.install || undefined
      : 'install' in product
        ? product.install || undefined
        : undefined

  const launchCommand = 'launch' in product && product.launch ? product.launch : undefined

  return (
    <>
      <JsonLd data={softwareApplicationSchema} />
      <Header />

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <ProductHero {...heroProps} />

      {/* Related Products */}
      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}

      {/* Pricing */}
      <ProductPricing pricing={product.pricing} pricingUrl={resourceUrls.pricing} />

      {/* Additional Links */}
      <ProductLinks resourceUrls={resourceUrls} communityUrls={communityUrls} />

      {/* Commands */}
      <ProductCommands install={installCommand} launch={launchCommand} />

      {/* Navigation */}
      <BackToNavigation href={`/${category}`} title={translations.allProductsLabel} />

      <Footer />
    </>
  )
}
