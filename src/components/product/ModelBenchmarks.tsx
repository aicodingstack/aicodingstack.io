import { useTranslations } from 'next-intl'
import { BENCHMARK_KEYS, formatBenchmarkValue, hasBenchmarks } from '@/lib/benchmarks'
import type { ManifestModel } from '@/types/manifests'

export interface ModelBenchmarksProps {
  benchmarks: ManifestModel['benchmarks']
}

/**
 * ModelBenchmarks Section
 *
 * Displays performance benchmark scores for AI models.
 */
export function ModelBenchmarks({ benchmarks }: ModelBenchmarksProps) {
  const t = useTranslations('components.benchmarks')
  if (!benchmarks || !hasBenchmarks(benchmarks)) {
    return null
  }

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
          {BENCHMARK_KEYS.map(key => {
            const value = benchmarks?.[key]
            if (value === null || value === undefined) return null

            return (
              <div key={key} className="border border-[var(--color-border)] p-[var(--spacing-md)]">
                <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                  {t(key)}
                </h3>
                <p className="text-lg font-semibold tracking-tight mb-1">
                  {formatBenchmarkValue(key, value)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{t(`${key}Desc`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
