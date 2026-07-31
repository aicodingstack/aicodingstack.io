import type { CollectionSection as CollectionSectionType } from '@/lib/collections'
import { getCollectionItemAnchor } from '@/lib/collections'

interface CollectionSectionProps {
  id: string
  locale: string
  section: CollectionSectionType
  labels: {
    opensInNewTab: string
    published: string
    verified: string
    publicPreview: string
  }
}

/**
 * Renders a collection section with its title, description, and subsections
 */
export default function CollectionSection({ id, locale, section, labels }: CollectionSectionProps) {
  // For specifications section, use special 2-column layout where Agent Protocols spans full height
  const isSpecifications = id === 'specifications'
  const hasAgentProtocols =
    isSpecifications && section.sections.some(subSection => subSection.id === 'agent-protocols')
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`))

  return (
    <section id={id} className="mb-[var(--spacing-xl)] scroll-mt-[140px] lg:scroll-mt-[100px]">
      <div className="mb-[var(--spacing-lg)] border-l-2 border-[var(--color-border-strong)] pl-[var(--spacing-md)]">
        <h2 className="text-lg font-medium tracking-tight mb-[var(--spacing-xs)] text-[var(--color-text)]">
          {section.title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] font-light">
          {section.description}
        </p>
      </div>

      <div
        className={
          hasAgentProtocols
            ? 'grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-[var(--spacing-md)]'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]'
        }
      >
        {section.sections.map(subSection => {
          const isAgentProtocols = subSection.id === 'agent-protocols'
          const colSpanClass =
            hasAgentProtocols && isAgentProtocols ? 'lg:col-span-1 lg:row-span-2' : ''

          return (
            <div
              key={subSection.id}
              className={`border border-[var(--color-border)] p-[var(--spacing-md)] ${colSpanClass}`}
            >
              <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-md)]">
                {subSection.title}
              </h3>
              <ul className="space-y-[var(--spacing-md)]">
                {subSection.items.map(item => (
                  <li
                    id={getCollectionItemAnchor(id, subSection.id, item.id)}
                    key={item.id}
                    className="scroll-mt-[140px]"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-border-strong)]"
                    >
                      <div className="text-base font-medium text-[var(--color-text)] underline decoration-[var(--color-border-strong)] underline-offset-4">
                        {item.name}
                        <span className="sr-only"> ({labels.opensInNewTab})</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] font-light mt-[var(--spacing-xs)]">
                        {item.description}
                      </p>
                      {(item.publishedAt || item.lastVerifiedAt || item.status) && (
                        <div className="mt-[var(--spacing-xs)] flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                          {item.publishedAt && (
                            <span>
                              {labels.published}:{' '}
                              <time dateTime={item.publishedAt}>
                                {formatDate(item.publishedAt)}
                              </time>
                            </span>
                          )}
                          {item.lastVerifiedAt && (
                            <span>
                              {labels.verified}:{' '}
                              <time dateTime={item.lastVerifiedAt}>
                                {formatDate(item.lastVerifiedAt)}
                              </time>
                            </span>
                          )}
                          {item.status === 'public-preview' && (
                            <span className="border border-[var(--color-border)] px-1.5">
                              {labels.publicPreview}
                            </span>
                          )}
                        </div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
