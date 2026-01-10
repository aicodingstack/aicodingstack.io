'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { stackCounts } from '@/lib/generated/metadata'

type StackId = 'ides' | 'clis' | 'extensions' | 'models' | 'model-providers' | 'vendors'

interface StackTabsProps {
  activeStack: StackId
  locale: string
}

function StackTabs({ activeStack, locale: _locale }: StackTabsProps) {
  const tShared = useTranslations('shared')

  const tabs = useMemo(() => {
    return [
      { id: 'ides' as StackId, title: tShared('categories.plural.ides'), path: `/ides` },
      { id: 'clis' as StackId, title: tShared('categories.plural.clis'), path: `/clis` },
      {
        id: 'extensions' as StackId,
        title: tShared('categories.plural.extensions'),
        path: `/extensions`,
      },
      { id: 'models' as StackId, title: tShared('categories.plural.models'), path: `/models` },
      {
        id: 'model-providers' as StackId,
        title: tShared('categories.plural.modelProviders'),
        path: `/model-providers`,
      },
      { id: 'vendors' as StackId, title: tShared('categories.plural.vendors'), path: `/vendors` },
    ]
  }, [tShared])

  return (
    <div className="border-b border-[var(--color-border)] mb-[var(--spacing-lg)]">
      <nav className="flex gap-[var(--spacing-xs)] overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.id === activeStack
          const count = stackCounts[tab.id] || 0

          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`
                px-[var(--spacing-md)] py-[var(--spacing-sm)]
                text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${
                  isActive
                    ? 'border-[var(--color-text)] text-[var(--color-text)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
                }
              `}
            >
              {tab.title}
              {count > 0 && (
                <span
                  className={`ml-[var(--spacing-xs)] text-xs ${
                    isActive
                      ? 'text-[var(--color-text-secondary)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  ({count})
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default memo(StackTabs)
