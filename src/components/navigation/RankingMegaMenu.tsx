'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { Link } from '@/i18n/navigation'

interface RankingMegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Shared CSS classes for reusability
const featuredLinkClass =
  'block p-[var(--spacing-sm)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] transition-all'

export const RankingMegaMenu = memo(function RankingMegaMenu({
  isOpen,
  onClose,
}: RankingMegaMenuProps) {
  const tNav = useTranslations('components.header')

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-[-2rem] pt-[var(--spacing-xs)] w-[400px] z-50">
      {/* Invisible bridge area to prevent menu from closing */}
      <div className="h-[var(--spacing-xs)]" />

      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg animate-fadeIn">
        <div className="p-[var(--spacing-md)]">
          {/* Open Source Ranking Link */}
          <Link href="/open-source-rank" onClick={onClose} className={featuredLinkClass}>
            <div className="font-medium mb-[var(--spacing-xs)]">{tNav('openSourceRank')}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {tNav('openSourceRankDesc')}
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
})
