'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type {
  ManifestCLI,
  ManifestDesktop,
  ManifestExtension,
  ManifestIDE,
} from '@/types/manifests'

export interface RelatedProductsProps {
  products?: Array<{
    type: 'ide' | 'cli' | 'extension' | 'desktop'
    data: ManifestIDE | ManifestCLI | ManifestExtension | ManifestDesktop | null
  }>
  variant?: 'default' | 'compact'
}

/**
 * Render a "Related Products" section.
 *
 * This component is intentionally defensive: it filters out null product data and returns `null`
 * when there is nothing meaningful to display, so callers don't need conditional rendering.
 */
export function RelatedProducts({ products = [], variant = 'default' }: RelatedProductsProps) {
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')

  // Filter out products with null data
  const validProducts = products.filter(p => p.data !== null)

  if (validProducts.length === 0) {
    return null
  }

  // Get type label
  const getTypeLabel = (type: 'ide' | 'cli' | 'extension' | 'desktop') => {
    switch (type) {
      case 'ide':
        return tShared('categories.singular.ide')
      case 'cli':
        return tShared('categories.singular.cli')
      case 'extension':
        return tShared('categories.singular.extension')
      case 'desktop':
        return tShared('categories.singular.desktop')
    }
  }

  // Get type route
  const getTypeRoute = (type: 'ide' | 'cli' | 'extension' | 'desktop') => {
    switch (type) {
      case 'ide':
        return 'ides'
      case 'cli':
        return 'clis'
      case 'extension':
        return 'extensions'
      case 'desktop':
        return 'desktops'
    }
  }

  // Get ASCII art for type
  const getTypeAsciiArt = (type: 'ide' | 'cli' | 'extension' | 'desktop') => {
    switch (type) {
      case 'ide':
        return `┌─────┐
│ IDE │
└─────┘`
      case 'cli':
        return `┌─────┐
│ CLI │
└─────┘`
      case 'extension':
        return `┌─────┬───┐
│ EXT │ ⚡ │
└─────┴───┘`
      case 'desktop':
        return `┌─────────┐
│ DESKTOP │
└─────────┘`
    }
  }

  if (variant === 'compact') {
    return (
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-md)]">
          {tComponent('relatedProducts.title')}
        </h2>

        <div className="border-t border-[var(--color-border)]">
          {validProducts.map(({ type, data }) => {
            if (!data) return null

            return (
              <Link
                key={`${type}-${data.id}`}
                href={`/${getTypeRoute(type)}/${data.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--spacing-md)] py-[var(--spacing-sm)] border-b border-[var(--color-border)] group"
              >
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    {getTypeLabel(type)} · {data.vendor}
                  </p>
                  <h3 className="font-semibold group-hover:underline underline-offset-4">
                    {data.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-1">
                    {data.description}
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="py-[var(--spacing-xl)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-xl font-semibold tracking-tight mb-[var(--spacing-lg)]">
          {tComponent('relatedProducts.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
          {validProducts.map(({ type, data }) => {
            if (!data) return null

            return (
              <Link
                key={`${type}-${data.id}`}
                href={`/${getTypeRoute(type)}/${data.id}`}
                className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-[var(--spacing-sm)]">
                  <div className="flex items-center gap-[var(--spacing-sm)]">
                    <pre className="text-xs leading-tight text-[var(--color-text-muted)]">
                      {getTypeAsciiArt(type)}
                    </pre>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                        {getTypeLabel(type)}
                      </p>
                      <h3 className="text-lg font-semibold tracking-tight">{data.name}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">{data.vendor}</p>
                    </div>
                  </div>
                  <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-light line-clamp-2">
                  {data.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
