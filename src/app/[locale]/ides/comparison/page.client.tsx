'use client'

import { Download, FileText, Github, Home, Linkedin, Twitter, Youtube } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AppleIcon, LinuxIcon, WindowsIcon } from '@/components/controls/PlatformIcons'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import ComparisonTable, { type ComparisonColumn } from '@/components/product/ComparisonTable'
import { Link } from '@/i18n/navigation'
import { idesData as ides } from '@/lib/generated'
import { getGithubStars } from '@/lib/generated/github-stars'
import { renderLicense } from '@/lib/license'
import { formatPrice, type PricingTier } from '@/lib/pricing'

type Props = {
  locale: string
}

export default function IDEComparisonPageClient({ locale: _locale }: Props) {
  const t = useTranslations('pages.comparison')
  const tCommunity = useTranslations('shared.platforms')
  const tGlobal = useTranslations()
  const columns: ComparisonColumn[] = [
    {
      key: 'vendor',
      label: t('columns.vendor'),
    },
    {
      key: 'license',
      label: t('columns.license'),
      render: (value: unknown, item: Record<string, unknown>) =>
        renderLicense(value, item, tGlobal),
    },
    {
      key: 'latestVersion',
      label: t('columns.version'),
    },
    {
      key: 'platforms',
      label: t('columns.platforms'),
      render: (value: unknown) => {
        const platforms = value as Array<{ os: string }> | string[]
        if (!platforms || platforms.length === 0) return '-'

        // Handle both old format (string[]) and new format (Array<{ os: string }>)
        const platformNames = Array.isArray(platforms)
          ? platforms.map(p => (typeof p === 'string' ? p : p.os))
          : []

        return (
          <div className="flex gap-1.5 items-center">
            {platformNames.includes('macOS') && (
              <span title="macOS">
                <AppleIcon />
              </span>
            )}
            {platformNames.includes('Windows') && (
              <span title="Windows">
                <WindowsIcon />
              </span>
            )}
            {platformNames.includes('Linux') && (
              <span title="Linux">
                <LinuxIcon />
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'githubStars',
      label: t('columns.githubStars'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const id = item.id as string
        const stars = getGithubStars('ides', id)
        const communityUrls = item.communityUrls as
          | {
              github?: string
            }
          | undefined
        const githubUrl = communityUrls?.github

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
      label: t('columns.links'),
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
                title={t('linkTitles.officialWebsite')}
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
                title={t('linkTitles.download')}
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
                title={t('linkTitles.documentation')}
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
                title={tCommunity('github')}
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
                title={tCommunity('twitter')}
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
                title={tCommunity('linkedin')}
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
                title={tCommunity('youtube')}
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
      label: t('columns.freePlan'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '-'
        const freePlan = pricing.find(p => p.value === 0)
        return freePlan ? '✓' : '-'
      },
    },
    {
      key: 'pricing-min',
      label: t('columns.startingPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '-'
        const paidPlans = pricing.filter(p => p.value && p.value > 0)
        if (paidPlans.length === 0) return t('pricingValues.freeOnly')
        const minPrice = Math.min(...paidPlans.map(p => p.value as number))
        const minPlan = paidPlans.find(p => p.value === minPrice)
        return minPlan ? formatPrice(minPlan) : '-'
      },
    },
    {
      key: 'pricing-max',
      label: t('columns.maxPrice'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const pricing = item.pricing as PricingTier[]
        if (!pricing || pricing.length === 0) return '-'
        const paidPlans = pricing.filter(p => p.value && p.value > 0)
        if (paidPlans.length === 0) return '-'
        const maxPrice = Math.max(...paidPlans.map(p => p.value as number))
        const maxPlan = paidPlans.find(p => p.value === maxPrice)
        return maxPlan ? formatPrice(maxPlan) : '-'
      },
    },
  ]

  return (
    <>
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.terms.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.categories.plural.ides'), href: '/ides' },
          { name: tGlobal('shared.terms.comparison'), href: '/ides/comparison' },
        ]}
      />

      {/* Page Header */}
      <section className="py-[var(--spacing-lg)] border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {t('ides.title')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            {t('ides.subtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <ComparisonTable
            items={ides as unknown as Record<string, unknown>[]}
            columns={columns}
            itemLinkPrefix={`/ides`}
          />
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <Link
            href="/ides"
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {t('ides.backTo')}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
