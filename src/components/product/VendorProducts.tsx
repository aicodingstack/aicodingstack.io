import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { ManifestCLI, ManifestExtension, ManifestIDE } from '@/types/manifests'

type ProductWithType = (ManifestIDE | ManifestCLI | ManifestExtension) & {
  type: 'ide' | 'cli' | 'extension'
}

const PRODUCT_TYPE_LABELS = {
  ide: 'IDE',
  cli: 'CLI',
  extension: 'Extension',
} as const

export function VendorProducts({ products }: { products: ProductWithType[] }) {
  const tShared = useTranslations('shared')

  if (products.length === 0) {
    return null
  }

  return (
    <section className="max-w-8xl mx-auto px-[var(--spacing-md)] my-[var(--spacing-lg)]">
      <h2 className="text-xl font-semibold tracking-tight mb-[var(--spacing-md)]">
        {tShared('terms.products')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/${product.type === 'ide' ? 'ides' : product.type === 'cli' ? 'clis' : 'extensions'}/${product.id}`}
            className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-start justify-between mb-[var(--spacing-xs)]">
              <div className="flex-1">
                <div className="flex items-center gap-[var(--spacing-xs)] mb-[var(--spacing-xs)]">
                  <h3 className="text-base font-semibold tracking-tight">{product.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-background-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {PRODUCT_TYPE_LABELS[product.type]}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-light line-clamp-2">
                  {product.description}
                </p>
              </div>
              <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all ml-[var(--spacing-xs)]">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
