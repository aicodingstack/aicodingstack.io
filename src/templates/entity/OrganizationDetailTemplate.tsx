import type { ReactNode } from 'react'
import { ProductHero } from '@/components/product'
import { generateVendorSchema } from '@/lib/metadata/schemas'
import type { ManifestProvider, ManifestTranslations, ManifestVendor } from '@/types/manifests'
import { EntityCommunityLinks, EntityPlatformLinks } from '../sections'
import { EntityDetailTemplate } from './EntityDetailTemplate'

export type OrganizationEntity = Pick<
  ManifestVendor | ManifestProvider,
  'id' | 'name' | 'description' | 'verified' | 'websiteUrl'
> & {
  docsUrl?: string | null
  translations?: ManifestTranslations
  type?: string
  communityUrls?: ManifestVendor['communityUrls']
  platformUrls?: ManifestProvider['platformUrls']
  applyKeyUrl?: ManifestProvider['applyKeyUrl']
}

export interface OrganizationDetailTemplateProps {
  organization: OrganizationEntity
  locale: string
  schema?: ReturnType<typeof generateVendorSchema> extends Promise<infer T> ? T : never
  breadcrumbs: Array<{ name: string; href: string }>
  backToHref: string
  backToTitle: string
  categoryLabel: string
  translations: {
    // ProductHero
    type?: string
    typeValue?: string
    visitWebsite?: string
    documentation?: string
    getApiKey?: string
    // Platform links (for providers)
    platformLinksTitle?: string
    huggingfaceTitle?: string
    huggingfaceDesc?: string
    artificialAnalysisTitle?: string
    artificialAnalysisDesc?: string
    openrouterTitle?: string
    openrouterDesc?: string
    // Community links
    communityLinksTitle?: string
    linkedinTitle?: string
    linkedinDesc?: string
    twitterTitle?: string
    twitterDesc?: string
    githubTitle?: string
    githubDesc?: string
    youtubeTitle?: string
    youtubeDesc?: string
    discordTitle?: string
    discordDesc?: string
    redditTitle?: string
    redditDesc?: string
    blogTitle?: string
    blogDesc?: string
  }
  // Optional sections for provider pages
  showPlatformLinks?: boolean
  // Optional sections for vendor pages
  showCommunityLinks?: boolean
  // Additional child sections (e.g., products grid, models grid)
  children?: ReactNode
}

/**
 * OrganizationDetailTemplate - Extends EntityDetailTemplate
 *
 * Mirrors: Schema.org Organization type
 *
 * Unified template for organization detail pages (Vendors and Model Providers).
 * Both entity types represent organizations with similar structure:
 * - Vendor: Product company (IDEs, CLIs, Extensions)
 * - Provider: AI model API provider
 *
 * @example Usage for Vendor
 * ```tsx
 * <OrganizationDetailTemplate
 *   organization={vendor}
 *   locale={locale}
 *   schema={vendorSchema}
 *   breadcrumbs={breadcrumbs}
 *   backToHref="/vendors"
 *   backToTitle="All Vendors"
 *   categoryLabel="VENDOR"
 *   translations={translations}
 *   showCommunityLinks={true}
 * />
 * ```
 *
 * @example Usage for Provider
 * ```tsx
 * <OrganizationDetailTemplate
 *   organization={provider}
 *   locale={locale}
 *   schema={providerSchema}
 *   breadcrumbs={breadcrumbs}
 *   backToHref="/model-providers"
 *   backToTitle="All Providers"
 *   categoryLabel="PROVIDER"
 *   translations={translations}
 *   showPlatformLinks={true}
 *   showCommunityLinks={true}
 * />
 * ```
 */
export async function OrganizationDetailTemplate({
  organization,
  locale,
  schema,
  breadcrumbs,
  backToHref,
  backToTitle,
  categoryLabel,
  translations,
  showPlatformLinks = false,
  showCommunityLinks = false,
  children,
}: OrganizationDetailTemplateProps) {
  // Generate schema if not provided
  const orgSchema =
    schema ||
    (await generateVendorSchema({
      vendor: {
        name: organization.name,
        description: organization.description,
        websiteUrl: organization.websiteUrl || '',
      },
      locale: locale as 'en' | 'zh-Hans' | 'de' | 'ko',
    }))

  // Build platform links configuration (for providers)
  const platformLinks = [
    {
      key: 'huggingface',
      title: translations.huggingfaceTitle || 'Hugging Face',
      description: translations.huggingfaceDesc || 'View on Hugging Face',
    },
    {
      key: 'artificialAnalysis',
      title: translations.artificialAnalysisTitle || 'Artificial Analysis',
      description: translations.artificialAnalysisDesc || 'View benchmarks',
    },
    {
      key: 'openrouter',
      title: translations.openrouterTitle || 'OpenRouter',
      description: translations.openrouterDesc || 'View on OpenRouter',
    },
  ]

  // Build community links configuration (for vendors and providers)
  const communityLinks = [
    {
      key: 'linkedin',
      title: translations.linkedinTitle || 'LinkedIn',
      description: translations.linkedinDesc || 'Connect on LinkedIn',
    },
    {
      key: 'twitter',
      title: translations.twitterTitle || 'Twitter',
      description: translations.twitterDesc || 'Follow on Twitter',
    },
    {
      key: 'github',
      title: translations.githubTitle || 'GitHub',
      description: translations.githubDesc || 'View GitHub',
    },
    {
      key: 'youtube',
      title: translations.youtubeTitle || 'YouTube',
      description: translations.youtubeDesc || 'Watch on YouTube',
    },
    {
      key: 'discord',
      title: translations.discordTitle || 'Discord',
      description: translations.discordDesc || 'Join Discord',
    },
    {
      key: 'reddit',
      title: translations.redditTitle || 'Reddit',
      description: translations.redditDesc || 'Join Reddit',
    },
    {
      key: 'blog',
      title: translations.blogTitle || 'Blog',
      description: translations.blogDesc || 'Read blog posts',
    },
  ]

  return (
    <EntityDetailTemplate
      entity={{
        id: organization.id,
        name: organization.name,
        description: organization.description,
        translations: organization.translations || {},
        verified: organization.verified ?? false,
        websiteUrl: organization.websiteUrl ?? '',
        docsUrl: organization.docsUrl,
      }}
      locale={locale}
      schema={orgSchema}
      breadcrumbs={breadcrumbs}
      backToHref={backToHref}
      backToTitle={backToTitle}
    >
      {/* ProductHero */}
      <ProductHero
        name={organization.name}
        description={organization.description}
        category="VENDOR"
        categoryLabel={categoryLabel}
        verified={organization.verified ?? false}
        type={organization.type}
        websiteUrl={organization.websiteUrl}
        docsUrl={(organization.docsUrl ?? null) as string | null}
        applyKeyUrl={organization.applyKeyUrl}
        labels={{
          type: translations.type,
          typeValue: translations.typeValue,
          visitWebsite: translations.visitWebsite,
          documentation: translations.documentation,
          getApiKey: translations.getApiKey,
        }}
      />

      {/* Platform Links (for providers) */}
      {showPlatformLinks && organization.platformUrls && (
        <EntityPlatformLinks
          platformUrls={organization.platformUrls}
          title={translations.platformLinksTitle || 'Find on AI Platforms'}
          links={platformLinks}
          layout="horizontal"
          gridCols="grid-cols-1 md:grid-cols-3"
        />
      )}

      {/* Community Links (for vendors and providers) */}
      {showCommunityLinks && organization.communityUrls && (
        <EntityCommunityLinks
          communityUrls={organization.communityUrls}
          title={translations.communityLinksTitle || 'Community'}
          links={communityLinks}
          layout="vertical"
          gridCols="grid-cols-2 md:grid-cols-4"
        />
      )}

      {/* Additional child sections (products, models, etc.) */}
      {children}
    </EntityDetailTemplate>
  )
}
