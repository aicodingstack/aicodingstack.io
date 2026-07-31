'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { Collections } from '@/lib/collections'

interface CollectionScrollbarProps {
  sectionIds: string[]
  collections: Collections
  label: string
}

export default function CollectionScrollbar({
  sectionIds,
  collections,
  label,
}: CollectionScrollbarProps) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '')

  const sections = useMemo(
    () =>
      sectionIds.map(id => ({
        id,
        title: collections[id]?.title || id,
      })),
    [sectionIds, collections]
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionData = sections[i]
        if (!sectionData) continue
        const section = document.getElementById(sectionData.id)
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionData.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  return (
    <aside className="sticky top-[73px] z-20 w-full shrink-0 bg-[var(--color-bg)] lg:top-[100px] lg:w-[240px] lg:self-start">
      <div>
        <nav
          aria-label={label}
          className="flex overflow-x-auto border-y border-[var(--color-border)] py-[var(--spacing-xs)] lg:block lg:space-y-[var(--spacing-xs)] lg:border-0 lg:py-0"
        >
          {sections.map(section => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? 'location' : undefined}
              className={`
                shrink-0 whitespace-nowrap px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-left text-sm
                transition-all lg:block lg:w-full lg:whitespace-normal
                ${
                  activeSection === section.id
                    ? 'bg-[var(--color-hover)] text-[var(--color-text)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)]'
                }
              `}
            >
              {section.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
