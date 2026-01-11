'use client'

import { useTranslations } from 'next-intl'
import { memo, type ReactNode, useCallback, useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'

export type SidebarItem = {
  id: string
  title: string
  href: string
  count?: number
}

type SidebarProps = {
  items: SidebarItem[]
  activeId?: string
  title: string
  label: string
  icon: ReactNode
  desktopWidth?: string
}

function Sidebar({
  items,
  activeId,
  title,
  label,
  icon,
  desktopWidth = 'lg:w-[250px]',
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const tComponent = useTranslations('components.sidebar.sidebar')

  const activeItem = useMemo(() => items.find(item => item.id === activeId), [items, activeId])
  const currentTitle = activeItem?.title || tComponent('selectItem')

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg)] border-t border-[var(--color-border)] shadow-lg">
        <div className="flex items-center justify-between px-[var(--spacing-md)] py-[var(--spacing-sm)]">
          {/* Current Item Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center gap-[var(--spacing-xs)] flex-1 text-left"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
              <div className="text-sm font-medium truncate">{currentTitle}</div>
            </div>
            <svg
              className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform ${
                isSidebarOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="ml-[var(--spacing-sm)] p-[var(--spacing-xs)] hover:bg-[var(--color-hover)] transition-colors rounded"
            aria-label={tComponent('backToTop')}
          >
            <svg
              className="w-6 h-6 text-[var(--color-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>Back to top</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/50 z-30 border-0 p-0 m-0 cursor-default"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Dropdown (Mobile) / Static Sidebar (Desktop) */}
      <aside
        className={`
          fixed lg:static
          ${isSidebarOpen ? 'bottom-[60px]' : 'bottom-[-100%]'}
          left-0 right-0
          ${desktopWidth}
          lg:flex-shrink-0 lg:sticky lg:top-[var(--spacing-lg)] lg:h-fit
          bg-[var(--color-bg)]
          border border-[var(--color-border)]
          z-40 lg:z-auto
          transition-all duration-300 ease-in-out
          lg:translate-y-0
          max-h-[50vh] lg:max-h-none
          overflow-y-auto
          shadow-lg lg:shadow-none
        `}
      >
        <nav className="p-[var(--spacing-md)]">
          <h2 className="hidden lg:flex items-center gap-2 text-sm font-semibold mb-[var(--spacing-md)] text-[var(--color-text-muted)]">
            {icon}
            {title}
          </h2>
          <ul className="space-y-[var(--spacing-xs)]">
            {items.map(item => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  className={`text-sm w-full flex items-center justify-between py-[var(--spacing-sm)] px-[var(--spacing-sm)] transition-all ${
                    activeId === item.id
                      ? 'text-[var(--color-text)] bg-[var(--color-hover)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)]'
                  }`}
                >
                  <span>{item.title}</span>
                  {item.count !== undefined && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-[var(--spacing-xs)]">
                      ({item.count})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default memo(Sidebar)
