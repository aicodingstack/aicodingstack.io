'use client'

import { Download, FileText, Github, Home, Linkedin, Twitter, Youtube } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import ComparisonTable, { type ComparisonColumn } from '@/components/product/ComparisonTable'
import { PricingSummaryValue } from '@/components/product/ProductPricing'
import { Link } from '@/i18n/navigation'
import { withVendorCommunityUrlsForCatalog } from '@/lib/community-urls'
import { extensionsData, vendorsData } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { renderLicense } from '@/lib/license'
import type { PricingTier } from '@/lib/pricing'
import type { ManifestExtension, ManifestVendor } from '@/types/manifests'

const extensions = withVendorCommunityUrlsForCatalog(
  extensionsData as unknown as ManifestExtension[],
  vendorsData as unknown as ManifestVendor[]
)

type Props = {
  locale: string
}

export default function ExtensionComparisonPageClient({ locale: _locale }: Props) {
  const tPage = useTranslations('pages.comparison')
  const tShared = useTranslations('shared')

  const columns: ComparisonColumn[] = [
    {
      key: 'vendor',
      label: tShared('categories.singular.vendor'),
    },
    {
      key: 'license',
      label: tShared('terms.license'),
      render: (value: unknown, item: Record<string, unknown>) =>
        renderLicense(value, item, tShared),
    },
    {
      key: 'latestVersion',
      label: tShared('terms.version'),
    },
    {
      key: 'supportedIdes',
      label: tShared('terms.supportedIdes'),
      render: (value: unknown) => {
        const supportedIdes = value as Array<{ ideId: string }> | undefined
        if (!supportedIdes || supportedIdes.length === 0) return '-'
        return (
          <div className="flex flex-wrap gap-1 text-xs">
            {supportedIdes.map(item => (
              <span
                key={item.ideId}
                className="px-1.5 py-0.5 bg-[var(--color-hover)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)]"
              >
                {item.ideId}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      key: 'githubStars',
      label: tShared('terms.stars'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const id = item.id as string
        const stars = getGithubStars('extensions', id)
        const githubUrl = item.githubUrl as string | null | undefined

        if (stars === null || stars === undefined)
          return <span className="text-right block">-</span>

        const starsText = `${stars.toFixed(1)}k`

        if (githubUrl) {
          return (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener"
              className="text-right block hover:text-[var(--color-text-secondary)] transition-colors hover:underline"
            >
              {starsText}
            </a>
          )
        }

        return <span className="text-right block">{starsText}</span>
      },
    },
    {
      key: 'links',
      label: tPage('columns.links'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const websiteUrl = item.websiteUrl as string | undefined
        const docsUrl = item.docsUrl as string | undefined
        const resourceUrls = item.resourceUrls as
          | {
              download?: string
            }
          | undefined
        const communityUrls = item.communityUrls as
          | {
              github?: string
              twitter?: string
              linkedin?: string
              youtube?: string
              reddit?: string
            }
          | undefined

        return (
          <div className="flex gap-2 items-center">
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('terms.visitWebsite')}
              >
                <Home className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Home className="w-3.5 h-3.5" />
              </span>
            )}
            {resourceUrls?.download ? (
              <a
                href={resourceUrls.download}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('actions.download')}
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Download className="w-3.5 h-3.5" />
              </span>
            )}
            {docsUrl ? (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('terms.documentation')}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.github ? (
              <a
                href={communityUrls.github}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('platforms.github')}
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Github className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.twitter ? (
              <a
                href={communityUrls.twitter}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('platforms.twitter')}
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Twitter className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.linkedin ? (
              <a
                href={communityUrls.linkedin}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('platforms.linkedin')}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Linkedin className="w-3.5 h-3.5" />
              </span>
            )}
            {communityUrls?.youtube ? (
              <a
                href={communityUrls.youtube}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tShared('platforms.youtube')}
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Youtube className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'pricing-free',
      label: tPage('columns.freePlan'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '✓' // Extensions without pricing info are typically free
        const freePlan = pricing.find(p => p.value === 0)
        return freePlan || pricing.length === 0 ? '✓' : '-'
      },
    },
    {
      key: 'pricing-min',
      label: tPage('columns.startingPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        return <PricingSummaryValue pricing={pricing} boundary="min" />
      },
    },
    {
      key: 'pricing-max',
      label: tPage('columns.maxPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        return <PricingSummaryValue pricing={pricing} boundary="max" />
      },
    },
  ]

  return (
    <>
      <Header />

      <Breadcrumb
        items={[
          { name: tShared('terms.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tShared('categories.plural.extensions'), href: '/extensions' },
          { name: tShared('terms.comparison'), href: '/extensions/comparison' },
        ]}
      />

      {/* Page Header */}
      <section className="py-[var(--spacing-lg)] border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {tPage('extensions.title')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            {tPage('extensions.subtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <ComparisonTable
            items={extensions as unknown as Record<string, unknown>[]}
            columns={columns}
            itemLinkPrefix={`/extensions`}
            nameColumnLabel={tShared('labels.name')}
          />
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <Link
            href="/extensions"
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {tPage('extensions.backTo')}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
