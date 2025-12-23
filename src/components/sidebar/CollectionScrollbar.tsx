'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Collections } from '@/lib/collections'

interface CollectionScrollbarProps {
  sectionIds: string[]
  collections: Collections
}

export default function CollectionScrollbar({ sectionIds, collections }: CollectionScrollbarProps) {
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

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const offset = 80
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <aside className="hidden lg:block w-[200px] flex-shrink-0">
      <div className="sticky top-[100px]">
        <nav className="space-y-[var(--spacing-xs)]">
          {sections.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`
                w-full text-left text-sm px-[var(--spacing-sm)] py-[var(--spacing-xs)]
                transition-all cursor-pointer
                ${
                  activeSection === section.id
                    ? 'bg-[var(--color-hover)] text-[var(--color-text)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)]'
                }
              `}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
