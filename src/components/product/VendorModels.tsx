import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { formatTokenCount } from '@/lib/format'
import type { ManifestModel } from '@/types/manifests'

export function VendorModels({ models }: { models: ManifestModel[] }) {
  const tShared = useTranslations('shared')

  if (models.length === 0) {
    return null
  }

  return (
    <section className="max-w-8xl mx-auto px-[var(--spacing-md)] my-[var(--spacing-lg)]">
      <h2 className="text-xl font-semibold tracking-tight mb-[var(--spacing-md)]">
        {tShared('categories.plural.models')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
        {models.map(model => (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="block border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-start justify-between mb-[var(--spacing-xs)]">
              <div className="flex-1">
                <h3 className="text-base font-semibold tracking-tight mb-[var(--spacing-xs)]">
                  {model.name}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-light line-clamp-2 mb-[var(--spacing-sm)]">
                  {model.description}
                </p>

                {/* Model specs */}
                <div className="flex flex-wrap gap-[var(--spacing-xs)] text-xs">
                  {model.size && (
                    <span className="px-2 py-0.5 bg-[var(--color-background-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {model.activeParameters
                        ? tShared('modelParameters.totalAndActive', {
                            total: model.size,
                            active: model.activeParameters,
                          })
                        : model.size}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-[var(--color-background-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {formatTokenCount(model.contextWindow)} context
                  </span>
                  {model.maxOutput !== null && (
                    <span className="px-2 py-0.5 bg-[var(--color-background-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {formatTokenCount(model.maxOutput)} output
                    </span>
                  )}
                </div>
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
