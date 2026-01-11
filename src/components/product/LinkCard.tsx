/**
 * LinkCard Component
 *
 * A reusable card component for displaying external links with consistent styling.
 * Supports horizontal and vertical layouts.
 */

interface LinkCardProps {
  href?: string | null
  title: string
  description: string
  layout?: 'horizontal' | 'vertical'
}

/**
 * Individual link card component
 */
export function LinkCard({ href, title, description, layout = 'horizontal' }: LinkCardProps) {
  const isHorizontal = layout === 'horizontal'
  const hasHref = href && href.trim().length > 0

  if (!hasHref) {
    return (
      <div
        className={`border border-[var(--color-border)] p-[var(--spacing-md)] opacity-40 pointer-events-none ${isHorizontal ? '' : 'text-center'}`}
      >
        {isHorizontal ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
            </div>
            <span className="text-lg text-[var(--color-text-muted)]">→</span>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`border border-[var(--color-border)] p-[var(--spacing-md)] hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5 group ${isHorizontal ? '' : 'text-center'}`}
    >
      {isHorizontal ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
          </div>
          <span className="text-lg text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-1 transition-all">
            →
          </span>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
        </>
      )}
    </a>
  )
}

interface LinkCardGridProps<K extends string> {
  title: string
  links: ReadonlyArray<{
    key: K
    title: string
    description: string
  }>
  urls: { [P in K]?: string | null }
  layout?: 'horizontal' | 'vertical'
  gridCols?: string
}

/**
 * Grid container for link cards
 * Displays all links - empty links show as grayed-out placeholders
 */
export function LinkCardGrid<K extends string>({
  title,
  links,
  urls,
  layout = 'horizontal',
  gridCols = 'grid-cols-1 md:grid-cols-3',
}: LinkCardGridProps<K>) {
  return (
    <section className="my-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          {title}
        </h2>

        <div className={`grid ${gridCols} gap-[var(--spacing-md)] mt-[var(--spacing-lg)]`}>
          {links.map(link => (
            <LinkCard
              key={link.key}
              href={urls[link.key]}
              title={link.title}
              description={link.description}
              layout={layout}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
