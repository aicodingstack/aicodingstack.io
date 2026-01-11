'use client'

import { Command } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import SearchDialog from '@/components/controls/SearchDialog'
import { RankingMegaMenu } from '@/components/navigation/RankingMegaMenu'
import { StackMegaMenu } from '@/components/navigation/StackMegaMenu'
import { Link } from '@/i18n/navigation'

// Menu item configuration type
interface MenuItem {
  href: string
  translationKey: string
  namespace?: 'header' | 'shared'
  isExternal?: boolean
  hasMegaMenu?: boolean
  megaMenuType?: 'aiCodingStack' | 'ranking'
}

// Common CSS class names - extracted to constants for DRY
const DESKTOP_LINK_CLASSES =
  'text-sm border-b border-transparent hover:border-[var(--color-border-strong)] pb-[var(--spacing-xs)] transition-all'
const MOBILE_LINK_CLASSES =
  'block text-sm py-[var(--spacing-xs)] hover:text-[var(--color-text-secondary)] transition-colors'

function Header() {
  const params = useParams()
  const locale = params?.locale as string | undefined
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<'aiCodingStack' | 'ranking' | null>(null)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const tComponent = useTranslations('components.common.header')
  const tShared = useTranslations('shared')

  // Menu items configuration - memoized to avoid recreation on each render
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { href: '/manifesto', translationKey: 'terms.manifesto', namespace: 'shared' },
      {
        href: '/ai-coding-stack',
        translationKey: 'terms.aiCodingStack',
        namespace: 'shared',
        hasMegaMenu: true,
        megaMenuType: 'aiCodingStack',
      },
      { href: '/ai-coding-landscape', translationKey: 'landscape', namespace: 'header' },
      {
        href: '#',
        translationKey: 'ranking',
        namespace: 'header',
        hasMegaMenu: true,
        megaMenuType: 'ranking',
      },
      { href: '/curated-collections', translationKey: 'terms.collections', namespace: 'shared' },
    ],
    []
  )

  // Event handlers - memoized with useCallback to prevent unnecessary re-renders
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleMegaMenuOpen = useCallback((type: 'aiCodingStack' | 'ranking') => {
    setActiveMegaMenu(type)
  }, [])

  const handleMegaMenuClose = useCallback(() => {
    setActiveMegaMenu(null)
  }, [])

  // Handle keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K (Mac) or CTRL+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchDialogOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Get translated text based on namespace
  const getTranslation = useCallback(
    (item: MenuItem) => {
      return item.namespace === 'shared'
        ? tShared(item.translationKey)
        : tComponent(item.translationKey)
    },
    [tComponent, tShared]
  )

  // Render desktop menu item
  const renderDesktopMenuItem = useCallback(
    (item: MenuItem) => {
      const translatedText = getTranslation(item)

      if (item.hasMegaMenu && item.megaMenuType) {
        const isActive = activeMegaMenu === item.megaMenuType
        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={() => handleMegaMenuOpen(item.megaMenuType!)}
            onMouseLeave={handleMegaMenuClose}
          >
            <Link
              href={item.href}
              className={DESKTOP_LINK_CLASSES}
              aria-expanded={isActive}
              aria-haspopup="true"
            >
              {translatedText}
            </Link>
            {item.megaMenuType === 'aiCodingStack' && (
              <StackMegaMenu isOpen={isActive} onClose={handleMegaMenuClose} />
            )}
            {item.megaMenuType === 'ranking' && (
              <RankingMegaMenu isOpen={isActive} onClose={handleMegaMenuClose} />
            )}
          </li>
        )
      }

      return (
        <li key={item.href}>
          {item.isExternal ? (
            <a href={item.href} target="_blank" rel="noopener" className={DESKTOP_LINK_CLASSES}>
              → {translatedText}
            </a>
          ) : (
            <Link href={item.href} className={DESKTOP_LINK_CLASSES}>
              {translatedText}
            </Link>
          )}
        </li>
      )
    },
    [activeMegaMenu, handleMegaMenuOpen, handleMegaMenuClose, getTranslation]
  )

  // Render mobile menu item
  const renderMobileMenuItem = useCallback(
    (item: MenuItem) => {
      const translatedText = getTranslation(item)
      return (
        <li key={item.href}>
          {item.isExternal ? (
            <a href={item.href} target="_blank" rel="noopener" className={MOBILE_LINK_CLASSES}>
              → {translatedText}
            </a>
          ) : (
            <Link href={item.href} className={MOBILE_LINK_CLASSES} onClick={handleMenuClose}>
              {translatedText}
            </Link>
          )}
        </li>
      )
    },
    [handleMenuClose, getTranslation]
  )

  // Memoized menu button label
  const menuButtonLabel = useMemo(
    () => (isMenuOpen ? tComponent('closeMenu') : tComponent('openMenu')),
    [isMenuOpen, tComponent]
  )

  return (
    <header className="sticky top-0 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)] z-50">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <nav className="flex items-center py-[var(--spacing-sm)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <Image
              src="/icon.svg"
              alt="AI Coding Stack Logo"
              width={24}
              height={24}
              className="inline-block"
            />
            AI Coding Stack
          </Link>

          {/* Desktop Menu - Centered */}
          <div className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-[var(--spacing-md)] list-none">
              {menuItems.map(renderDesktopMenuItem)}
            </ul>
          </div>

          {/* Desktop Search Button - Right aligned */}
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => setIsSearchDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] transition-colors min-w-[140px]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="flex-1 text-left">{tComponent('searchPlaceholder')}</span>
              <kbd className="flex items-center gap-1 px-1.5 py-0.5 text-xs border border-[var(--color-border)]">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </button>
          </div>

          {/* Mobile Menu Buttons - Right aligned */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchDialogOpen(true)}
              className="p-[var(--spacing-xs)] hover:bg-[var(--color-hover)] transition-colors"
              aria-label={tShared('actions.search')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={handleMenuToggle}
              className="p-[var(--spacing-xs)] hover:bg-[var(--color-hover)] transition-colors"
              aria-label={tComponent('toggleMenu')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
              >
                <title>{menuButtonLabel}</title>
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-[var(--spacing-sm)]">
            <ul className="flex flex-col gap-[var(--spacing-sm)] list-none">
              {menuItems.map(renderMobileMenuItem)}
            </ul>
          </div>
        )}
      </div>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        locale={locale}
      />
    </header>
  )
}

export default memo(Header)
