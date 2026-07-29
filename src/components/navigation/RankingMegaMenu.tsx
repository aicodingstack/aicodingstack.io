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

export const rankingMenuItems = [
  {
    href: '/model-intelligence-index',
    titleKey: 'header.modelIntelligenceIndex',
    descriptionKey: 'header.modelIntelligenceIndexDesc',
  },
  {
    href: '/model-price-intelligence-index',
    titleKey: 'header.modelPriceIntelligenceIndex',
    descriptionKey: 'header.modelPriceIntelligenceIndexDesc',
  },
  {
    href: '/open-source-rank',
    titleKey: 'header.openSourceRank',
    descriptionKey: 'header.openSourceRankDesc',
  },
] as const

export const RankingMegaMenu = memo(function RankingMegaMenu({
  isOpen,
  onClose,
}: RankingMegaMenuProps) {
  const tComponent = useTranslations('components.common')

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-[-2rem] pt-[var(--spacing-xs)] w-[400px] z-50">
      {/* Invisible bridge area to prevent menu from closing */}
      <div className="h-[var(--spacing-xs)]" />

      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg animate-fadeIn">
        <div className="p-[var(--spacing-md)]">
          {rankingMenuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`${featuredLinkClass} ${index > 0 ? 'mt-[var(--spacing-xs)]' : ''}`}
            >
              <div className="font-medium mb-[var(--spacing-xs)]">{tComponent(item.titleKey)}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {tComponent(item.descriptionKey)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
})
