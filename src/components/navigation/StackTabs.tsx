'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { stackCounts } from '@/lib/generated/metadata'

type StackId =
  | 'ides'
  | 'clis'
  | 'desktops'
  | 'extensions'
  | 'models'
  | 'model-providers'
  | 'vendors'

interface StackTabsProps {
  activeStack: StackId
  locale: string
}

function StackTabs({ activeStack, locale: _locale }: StackTabsProps) {
  const tShared = useTranslations('shared')

  const tabs = useMemo(() => {
    return [
      {
        id: 'ides' as StackId,
        title: tShared('categories.plural.ides'),
        path: `/ides`,
      },
      {
        id: 'clis' as StackId,
        title: tShared('categories.plural.clis'),
        path: `/clis`,
      },
      {
        id: 'desktops' as StackId,
        title: tShared('categories.plural.desktops'),
        path: `/desktops`,
      },
      {
        id: 'extensions' as StackId,
        title: tShared('categories.plural.extensions'),
        path: `/extensions`,
      },
      {
        id: 'models' as StackId,
        title: tShared('categories.plural.models'),
        path: `/models`,
      },
      {
        id: 'model-providers' as StackId,
        title: tShared('categories.plural.modelProviders'),
        path: `/model-providers`,
      },
      {
        id: 'vendors' as StackId,
        title: tShared('categories.plural.vendors'),
        path: `/vendors`,
      },
    ]
  }, [tShared])

  return (
    <div className="mb-[var(--spacing-md)] flex gap-[var(--spacing-xs)] flex-wrap">
      {tabs.map(tab => {
        const isActive = tab.id === activeStack
        const count = stackCounts[tab.id] || 0

        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
              isActive
                ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
            }`}
          >
            {tab.title} ({count})
          </Link>
        )
      })}
    </div>
  )
}

export default memo(StackTabs)
