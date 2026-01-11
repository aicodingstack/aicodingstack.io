'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { Link } from '@/i18n/navigation'

interface StackMegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  name: string
  href: string
}

interface FeaturedLink {
  href: string
  titleKey: string
  descKey: string
  marginBottom?: 'sm' | 'md'
}

interface MenuColumn {
  titleKey: string
  items: MenuItem[]
}

// Shared CSS classes for reusability
const featuredLinkClass =
  'block p-[var(--spacing-sm)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] transition-all'
const menuItemLinkClass =
  'block px-[var(--spacing-xs)] py-1 text-sm hover:bg-[var(--color-hover)] transition-colors'
const columnTitleClass =
  'text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-[var(--spacing-xs)]'

/**
 * Featured link component for prominent menu items
 */
const FeaturedLink = memo(function FeaturedLink({
  href,
  titleKey,
  descKey,
  marginBottom = 'sm',
  onClose,
  tComponents,
}: FeaturedLink & { onClose: () => void; tComponents: ReturnType<typeof useTranslations> }) {
  const marginClass = marginBottom === 'md' ? 'mb-[var(--spacing-md)]' : 'mb-[var(--spacing-sm)]'

  return (
    <Link href={href} onClick={onClose} className={`${featuredLinkClass} ${marginClass}`}>
      <div className="font-medium mb-[var(--spacing-xs)]">{tComponents(titleKey)}</div>
      <div className="text-xs text-[var(--color-text-secondary)]">{tComponents(descKey)}</div>
    </Link>
  )
})

/**
 * Menu column component for grouped menu items
 */
const MenuColumn = memo(function MenuColumn({
  titleKey,
  items,
  onClose,
  tComponents,
}: MenuColumn & { onClose: () => void; tComponents: ReturnType<typeof useTranslations> }) {
  return (
    <div>
      <h4 className={columnTitleClass}>{tComponents(titleKey)}</h4>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.href}>
            <Link href={item.href} onClick={onClose} className={menuItemLinkClass}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
})

export const StackMegaMenu = memo(function StackMegaMenu({ isOpen, onClose }: StackMegaMenuProps) {
  const tComponent = useTranslations('components.common.header')
  const tShared = useTranslations('shared')

  // Memoize menu sections to avoid recreating on every render
  const menuSections = useMemo(
    () => ({
      development: [
        { name: tShared('categories.plural.ides'), href: '/ides' },
        { name: tShared('categories.plural.clis'), href: '/clis' },
        { name: tShared('categories.plural.extensions'), href: '/extensions' },
      ] as MenuItem[],
      intelligence: [
        { name: tShared('categories.plural.models'), href: '/models' },
        { name: tShared('categories.plural.modelProviders'), href: '/model-providers' },
      ] as MenuItem[],
    }),
    [tShared]
  )

  // Memoize featured links configuration
  const featuredLinks = useMemo<FeaturedLink[]>(() => [], [])

  // Memoize menu columns configuration
  const menuColumns = useMemo<MenuColumn[]>(
    () => [
      { titleKey: 'developmentTools', items: menuSections.development },
      { titleKey: 'intelligence', items: menuSections.intelligence },
    ],
    [menuSections]
  )

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-[-2rem] pt-[var(--spacing-xs)] w-[570px] z-50">
      {/* Invisible bridge area to prevent menu from closing */}
      <div className="h-[var(--spacing-xs)]" />

      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg animate-fadeIn">
        <div className="p-[var(--spacing-md)]">
          {/* Featured Links */}
          {featuredLinks.map(link => (
            <FeaturedLink key={link.href} {...link} onClose={onClose} tComponents={tComponent} />
          ))}

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
            {menuColumns.map(column => (
              <MenuColumn
                key={column.titleKey}
                {...column}
                onClose={onClose}
                tComponents={tComponent}
              />
            ))}
          </div>

          {/* All Vendors - separated by top border */}
          <div className="mt-[var(--spacing-md)] pt-[var(--spacing-sm)] border-t border-[var(--color-border)]">
            <Link
              href="/vendors"
              onClick={onClose}
              className="block px-[var(--spacing-xs)] py-1 text-sm hover:bg-[var(--color-hover)] transition-colors"
            >
              {tShared('categories.plural.vendors')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})
