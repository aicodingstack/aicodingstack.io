'use client'

import { Home } from 'lucide-react'

import { useTranslations } from 'next-intl'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import ComparisonTable, { type ComparisonColumn } from '@/components/product/ComparisonTable'

import { Link } from '@/i18n/navigation'

import { BENCHMARK_KEYS, formatBenchmarkValue } from '@/lib/benchmarks'
import { modelsData as models } from '@/lib/generated'

type Props = {
  locale: string
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

// Helper to wrap content in a span with alignment
function wrapWithAlign(
  content: string | React.ReactNode,
  align: 'left' | 'center' | 'right' = 'left'
): React.ReactNode {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return <span className={`${alignClass} w-full inline-block`}>{content}</span>
}

// Format token count to K units
function formatTokenCount(value: unknown): React.ReactNode {
  if (typeof value !== 'number') return wrapWithAlign('-', 'right')
  const kValue = (value / 1000).toFixed(0)
  return wrapWithAlign(`${Number(kValue).toLocaleString()}K`, 'right')
}

// Create a token pricing column renderer
function createTokenPricingRenderer(field: 'input' | 'output' | 'cache') {
  return (_: unknown, item: Record<string, unknown>) => {
    const tokenPricing = item.tokenPricing as Record<string, number | null> | undefined
    const value = tokenPricing?.[field]
    return wrapWithAlign(
      value !== null && value !== undefined ? `$${value.toFixed(2)}` : '-',
      'right'
    )
  }
}

// All possible input modality values
const INPUT_MODALITIES: readonly string[] = ['text', 'image', 'file'] as const

// All possible capability values
const CAPABILITIES: readonly string[] = [
  'function-calling',
  'tool-choice',
  'structured-outputs',
  'reasoning',
] as const

// Create abbreviation renderer with all possible values
function createAbbreviationsRenderer(allValues: readonly string[]) {
  return (value: unknown): React.ReactNode => {
    const actualValues = Array.isArray(value) ? (value as string[]) : []
    const actualSet = new Set(actualValues)

    return (
      <span className="flex gap-1">
        {allValues.map(v => {
          const initial = v.charAt(0).toUpperCase()
          const tooltip = v
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          const isActive = actualSet.has(v)

          return (
            <span
              key={v}
              className={`inline-flex items-center justify-center px-1 py-[1px] text-xs leading-none border border-[var(--color-border)] rounded cursor-default ${isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] opacity-30'}`}
              title={tooltip}
            >
              {initial}
            </span>
          )
        })}
      </span>
    )
  }
}

// Platform link configuration
const PLATFORM_LINK_CONFIG: readonly {
  key: string
  initial: string
  urlKey: 'huggingface' | 'artificialAnalysis' | 'openrouter'
}[] = [
  { key: 'huggingface', initial: 'H', urlKey: 'huggingface' },
  { key: 'artificialAnalysis', initial: 'A', urlKey: 'artificialAnalysis' },
  { key: 'openrouter', initial: 'O', urlKey: 'openrouter' },
] as const

// Create platform link element
function createPlatformLink(
  link: (typeof PLATFORM_LINK_CONFIG)[number],
  url: string | null | undefined,
  label: string
) {
  const baseClasses =
    'inline-flex items-center justify-center px-1 py-[1px] text-xs leading-none border border-[var(--color-border)] rounded'
  if (url) {
    return (
      <a
        key={link.initial}
        href={url}
        target="_blank"
        rel="noopener"
        className={`${baseClasses} text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors`}
        title={label}
      >
        {link.initial}
      </a>
    )
  }
  return (
    <span
      key={link.initial}
      className={`${baseClasses} text-[var(--color-text-muted)] opacity-30`}
      title={label}
    >
      {link.initial}
    </span>
  )
}

// Pricing column configuration
const PRICING_CONFIG: readonly { field: 'input' | 'output' | 'cache'; labelKey: string }[] = [
  { field: 'input', labelKey: 'pricingInput' },
  { field: 'output', labelKey: 'pricingOutput' },
  { field: 'cache', labelKey: 'pricingCache' },
] as const

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
          <span className="flex gap-1">
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors"
                title={t('linkTitles.officialWebsite')}
              >
                <Home className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span
                className="inline-flex items-center justify-center text-[var(--color-text-muted)] opacity-30"
                title={t('linkTitles.officialWebsite')}
              >
                <Home className="w-3.5 h-3.5" />
              </span>
            )}
            {PLATFORM_LINK_CONFIG.map(link =>
              createPlatformLink(link, platformUrls?.[link.urlKey], tCommunity(link.key))
            )}
          </span>
        )
      },
    },
    {
      key: 'size',
      label: t('columns.modelSize'),
      render: (value: unknown) => {
        if (!value) return wrapWithAlign('-', 'right')
        return wrapWithAlign(value as string, 'right')
      },
    },
    {
      key: 'contextWindow',
      label: t('columns.contextLength'),
      render: formatTokenCount,
    },
    {
      key: 'maxOutput',
      label: t('columns.maxOutput'),
      render: formatTokenCount,
    },
    ...PRICING_CONFIG.map(({ field, labelKey }) => ({
      key: `tokenPricing${field.charAt(0).toUpperCase() + field.slice(1)}`,
      label: t(`columns.${labelKey}`),
      title: `${t(`columns.${labelKey}`)} (/M)`,
      render: createTokenPricingRenderer(field),
    })),
    {
      key: 'inputModalities',
      label: t('columns.inputModalities'),
      render: createAbbreviationsRenderer(INPUT_MODALITIES),
    },
    {
      key: 'capabilities',
      label: t('columns.capabilities'),
      render: createAbbreviationsRenderer(CAPABILITIES),
    },
    ...BENCHMARK_KEYS.map(key => ({
      key,
      label: t(`columns.${camelToKebab(key)}`),
      render: (_: unknown, item: Record<string, unknown>) => {
        const benchmarks = item.benchmarks as Record<string, number | null> | undefined
        const value = benchmarks?.[key]
        if (value === null || value === undefined) return wrapWithAlign('-', 'center')
        return wrapWithAlign(formatBenchmarkValue(key, value), 'center')
      },
    })),
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
