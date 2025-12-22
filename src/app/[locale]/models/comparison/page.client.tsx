'use client'

import { FileText, Github, Home, Twitter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ComparisonTable, { type ComparisonColumn } from '@/components/ComparisonTable'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { Link } from '@/i18n/navigation'
import { modelsData as models } from '@/lib/generated'

type Props = {
  locale: string
}

export default function ModelComparisonPageClient({ locale: _locale }: Props) {
  const t = useTranslations('pages.comparison')
  const tGlobal = useTranslations()
  const tCommunity = useTranslations('shared.platforms')

  const columns: ComparisonColumn[] = [
    {
      key: 'vendor',
      label: t('columns.vendor'),
    },
    {
      key: 'size',
      label: t('columns.modelSize'),
    },
    {
      key: 'contextWindow',
      label: t('columns.contextLength'),
    },
    {
      key: 'maxOutput',
      label: t('columns.maxOutput'),
    },
    {
      key: 'tokenPricing',
      label: t('columns.pricing'),
      render: (value: unknown) => {
        if (!value || typeof value !== 'object') return '-'
        const pricing = value as {
          input?: number | null
          output?: number | null
          cache?: number | null
        }
        if (pricing.input !== null && pricing.input !== undefined) {
          return `$${pricing.input}/M`
        }
        if (pricing.output !== null && pricing.output !== undefined) {
          return `$${pricing.output}/M`
        }
        return '-'
      },
    },
    {
      key: 'links',
      label: t('columns.links'),
      render: (_: unknown, item: Record<string, unknown>) => {
        const websiteUrl = item.websiteUrl as string | null | undefined
        const platformUrls = item.platformUrls as
          | {
              huggingface?: string | null
              artificialAnalysis?: string | null
              openrouter?: string | null
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
            {platformUrls?.huggingface ? (
              <a
                href={platformUrls.huggingface}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('huggingface')}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {platformUrls?.artificialAnalysis ? (
              <a
                href={platformUrls.artificialAnalysis}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('artificialAnalysis')}
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Github className="w-3.5 h-3.5" />
              </span>
            )}
            {platformUrls?.openrouter ? (
              <a
                href={platformUrls.openrouter}
                target="_blank"
                rel="noopener"
                className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={tCommunity('openrouter')}
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)] opacity-30">
                <Twitter className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <Header />

      <Breadcrumb
        items={[
          { name: tGlobal('shared.common.aiCodingStack'), href: '/ai-coding-stack' },
          { name: tGlobal('shared.stacks.models'), href: '/models' },
          { name: tGlobal('shared.common.comparison'), href: '/models/comparison' },
        ]}
      />

      {/* Page Header */}
      <section className="py-[var(--spacing-lg)] border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-[var(--spacing-sm)]">
            {t('models.title')}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] font-light">
            {t('models.subtitle')}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <ComparisonTable
            items={models as unknown as Record<string, unknown>[]}
            columns={columns}
            itemLinkPrefix={`/models`}
          />
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <Link
            href="/models"
            className="inline-flex items-center gap-[var(--spacing-xs)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {t('models.backTo')}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
