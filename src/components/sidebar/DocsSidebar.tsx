'use client'

import { useTranslations } from 'next-intl'
import type { DocSection } from '@/lib/generated/docs'
import Sidebar, { type SidebarItem } from './Sidebar'

type DocsSidebarProps = {
  sections: DocSection[]
  activeSlug?: string
}

// Define custom order for documentation sections
const docOrder = [
  'welcome',
  'getting-started',
  'installation',
  'configuration',
  'usage',
  'api-reference',
  'contributing',
]

export default function DocsSidebar({ sections, activeSlug }: DocsSidebarProps) {
  const tComponent = useTranslations('components.sidebar.docsSidebar')

  // Sort sections by custom order
  const sortedSections = [...sections].sort((a, b) => {
    const aIndex = docOrder.indexOf(a.slug)
    const bIndex = docOrder.indexOf(b.slug)

    // If both are in the custom order, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    // If only a is in the custom order, it comes first
    if (aIndex !== -1) return -1

    // If only b is in the custom order, it comes first
    if (bIndex !== -1) return 1

    // If neither is in the custom order, sort alphabetically
    return a.slug.localeCompare(b.slug)
  })

  const items: SidebarItem[] = sortedSections.map(section => ({
    id: section.slug,
    title: section.title,
    href: `/docs/${section.slug}`,
  }))

  const icon = (
    <svg
      className="w-5 h-5 text-[var(--color-text-muted)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
    >
      <title>Documentation</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )

  return (
    <Sidebar
      items={items}
      activeId={activeSlug}
      title={tComponent('title')}
      label={tComponent('label')}
      icon={icon}
      desktopWidth="lg:w-[250px]"
    />
  )
}
