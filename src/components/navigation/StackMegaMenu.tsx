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
  tNav,
}: FeaturedLink & { onClose: () => void; tNav: ReturnType<typeof useTranslations<'header'>> }) {
  const marginClass = marginBottom === 'md' ? 'mb-[var(--spacing-md)]' : 'mb-[var(--spacing-sm)]'

  return (
    <Link href={href} onClick={onClose} className={`${featuredLinkClass} ${marginClass}`}>
      <div className="font-medium mb-[var(--spacing-xs)]">{tNav(titleKey)}</div>
      <div className="text-xs text-[var(--color-text-secondary)]">{tNav(descKey)}</div>
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
  tNav,
}: MenuColumn & { onClose: () => void; tNav: ReturnType<typeof useTranslations<'header'>> }) {
  return (
    <div>
      <h4 className={columnTitleClass}>{tNav(titleKey)}</h4>
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
  const tStacks = useTranslations('shared.stacks')
  const tNav = useTranslations('components.header')

  // Memoize menu sections to avoid recreating on every render
  const menuSections = useMemo(
    () => ({
      development: [
        { name: tStacks('ides'), href: '/ides' },
        { name: tStacks('clis'), href: '/clis' },
        { name: tStacks('extensions'), href: '/extensions' },
      ] as MenuItem[],
      intelligence: [
        { name: tStacks('models'), href: '/models' },
        { name: tStacks('modelProviders'), href: '/model-providers' },
      ] as MenuItem[],
    }),
    [tStacks]
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
            <FeaturedLink key={link.href} {...link} onClose={onClose} tNav={tNav} />
          ))}

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
            {menuColumns.map(column => (
              <MenuColumn key={column.titleKey} {...column} onClose={onClose} tNav={tNav} />
            ))}
          </div>

          {/* All Vendors - separated by top border */}
          <div className="mt-[var(--spacing-md)] pt-[var(--spacing-sm)] border-t border-[var(--color-border)]">
            <Link
              href="/vendors"
              onClick={onClose}
              className="block px-[var(--spacing-xs)] py-1 text-sm hover:bg-[var(--color-hover)] transition-colors"
            >
              {tStacks('vendors')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})
