import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface BackToNavigationProps {
  /**
   * Destination URL for the back link
   */
  href: string

  /**
   * Title text to display (e.g., "All IDEs", "All Models")
   */
  title: string
}

/**
 * BackToNavigation component
 *
 * Provides a consistent "Back to" navigation pattern across product detail pages.
 * Displays a full-width bordered card with hover effects.
 * Automatically handles internationalization for common text like "Back to" and "[INDEX]".
 *
 * @example
 * <BackToNavigation href="/ides" title="All IDEs" />
 */
export function BackToNavigation({ href, title }: BackToNavigationProps) {
  const tComponent = useTranslations('components.navigation.backToNavigation')

  return (
    <section className="pt-[var(--spacing-lg)]">
      <div className="max-w-8xl mx-auto">
        <Link
          href={href}
          className="border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 flex flex-col gap-1 text-center"
        >
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
            ← {tComponent('backTo')}
          </span>
          <span className="text-lg font-semibold tracking-tight">{title}</span>
          <span className="text-xs text-[var(--color-text-muted)]">
            [{tComponent('indexLabel')}]
          </span>
        </Link>
      </div>
    </section>
  )
}
