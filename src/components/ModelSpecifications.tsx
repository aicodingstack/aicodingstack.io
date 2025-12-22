import { formatTokenCount } from '@/lib/format'
import type { ManifestModel } from '@/types/manifests'

export interface ModelSpecificationsProps {
  model: Pick<ManifestModel, 'size' | 'contextWindow' | 'maxOutput' | 'tokenPricing'>
  translations: {
    title: string
    modelSize: string
    contextWindow: string
    maxOutput: string
    pricing: string
    input: string
    output: string
    cache: string
  }
}

/**
 * ModelSpecifications Section
 *
 * Displays technical specifications for AI models including size,
 * context window, max output, and token pricing.
 */
export function ModelSpecifications({ model, translations }: ModelSpecificationsProps) {
  const hasContent =
    model.size ||
    model.contextWindow ||
    model.maxOutput ||
    model.tokenPricing?.input !== null ||
    model.tokenPricing?.output !== null ||
    model.tokenPricing?.cache !== null

  if (!hasContent) {
    return null
  }

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          {translations.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
          {model.size && (
            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {translations.modelSize}
              </h3>
              <p className="text-lg font-semibold tracking-tight">{model.size}</p>
            </div>
          )}

          <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
            <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
              {translations.contextWindow}
            </h3>
            <p className="text-lg font-semibold tracking-tight">
              {formatTokenCount(model.contextWindow)}
            </p>
          </div>

          <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
            <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
              {translations.maxOutput}
            </h3>
            <p className="text-lg font-semibold tracking-tight">
              {formatTokenCount(model.maxOutput)}
            </p>
          </div>

          {model.tokenPricing && (
            <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
              <h3 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]">
                {translations.pricing}
              </h3>
              <div className="space-y-1">
                {model.tokenPricing.input !== null && model.tokenPricing.input !== undefined && (
                  <p className="text-sm">
                    <span className="text-[var(--color-text-muted)] text-xs">
                      {translations.input}{' '}
                    </span>
                    <span className="font-semibold tracking-tight">
                      ${model.tokenPricing.input}/M
                    </span>
                  </p>
                )}
                {model.tokenPricing.output !== null && model.tokenPricing.output !== undefined && (
                  <p className="text-sm">
                    <span className="text-[var(--color-text-muted)] text-xs">
                      {translations.output}{' '}
                    </span>
                    <span className="font-semibold tracking-tight">
                      ${model.tokenPricing.output}/M
                    </span>
                  </p>
                )}
                {model.tokenPricing.cache !== null && model.tokenPricing.cache !== undefined && (
                  <p className="text-sm">
                    <span className="text-[var(--color-text-muted)] text-xs">
                      {translations.cache}{' '}
                    </span>
                    <span className="font-semibold tracking-tight">
                      ${model.tokenPricing.cache}/M
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
