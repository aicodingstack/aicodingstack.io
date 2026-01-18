'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { ManifestCLI, ManifestExtension, ManifestIDE } from '@/types/manifests'

export interface RelatedProductsProps {
  products?: Array<{
    type: 'ide' | 'cli' | 'extension'
    data: ManifestIDE | ManifestCLI | ManifestExtension | null
  }>
}

/**
 * Render a "Related Products" section.
 *
 * This component is intentionally defensive: it filters out null product data and returns `null`
 * when there is nothing meaningful to display, so callers don't need conditional rendering.
 */
export function RelatedProducts({ products = [] }: RelatedProductsProps) {
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')

  // Filter out products with null data
  const validProducts = products.filter(p => p.data !== null)

  if (validProducts.length === 0) {
    return null
  }

  // Get type label
  const getTypeLabel = (type: 'ide' | 'cli' | 'extension') => {
    switch (type) {
      case 'ide':
        return tShared('categories.singular.ide')
      case 'cli':
        return tShared('categories.singular.cli')
      case 'extension':
        return tShared('categories.singular.extension')
    }
  }

  // Get type route
  const getTypeRoute = (type: 'ide' | 'cli' | 'extension') => {
    switch (type) {
      case 'ide':
        return 'ides'
      case 'cli':
        return 'clis'
      case 'extension':
        return 'extensions'
    }
  }

  // Get ASCII art for type
  const getTypeAsciiArt = (type: 'ide' | 'cli' | 'extension') => {
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
    }
  }

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-xl font-semibold tracking-tight mb-[var(--spacing-md)]">
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
