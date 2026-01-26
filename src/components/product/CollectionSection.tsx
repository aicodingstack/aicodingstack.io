import type { CollectionSection as CollectionSectionType } from '@/lib/collections'

interface CollectionSectionProps {
  id: string
  section: CollectionSectionType
}

/**
 * Renders a collection section with its title, description, and subsections
 */
export default function CollectionSection({ id, section }: CollectionSectionProps) {
  // For specifications section, use special 2-column layout where Agent Protocols spans full height
  const isSpecifications = id === 'specifications'
  const hasAgentProtocols =
    isSpecifications && section.sections.some(s => s.title.includes('Agent Protocols'))

  return (
    <section id={id} className="mb-[var(--spacing-xl)] scroll-mt-[100px]">
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
            ? 'grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-[var(--spacing-md)]'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]'
        }
      >
        {section.sections.map((subSection, _index) => {
          const isAgentProtocols = subSection.title.includes('Agent Protocols')
          const colSpanClass =
            hasAgentProtocols && isAgentProtocols ? 'lg:col-span-1 lg:row-span-2' : ''

          return (
            <div
              key={subSection.title}
              className={`border border-[var(--color-border)] p-[var(--spacing-md)] ${colSpanClass}`}
            >
              <h3 className="text-lg font-semibold tracking-tight mb-[var(--spacing-md)]">
                {subSection.title}
              </h3>
              <ul className="space-y-[var(--spacing-md)]">
                {subSection.items.map(item => (
                  <li key={item.url}>
                    <a href={item.url} target="_blank" rel="noopener" className="group block">
                      <div className="text-base font-medium text-[var(--color-text)] group-hover:underline">
                        {item.name}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] font-light mt-[var(--spacing-xs)]">
                        {item.description}
                      </p>
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
