'use client'

import { Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { modelsData } from '@/lib/generated'

interface ModelCompareSelectorProps {
  currentModelId: string
  className?: string
}

export function ModelCompareSelector({
  currentModelId,
  className = '',
}: ModelCompareSelectorProps) {
  const tComponent = useTranslations('components.controls')
  const tShared = useTranslations('shared')
  const dropdownId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const lifecycleOrder: Record<string, number> = { latest: 0, maintained: 1, deprecated: 2 }
  const availableModels = modelsData
    .filter(model => {
      if (model.id === currentModelId) return false
      if (!normalizedQuery) return true
      return (
        model.name.toLocaleLowerCase().includes(normalizedQuery) ||
        model.vendor.toLocaleLowerCase().includes(normalizedQuery)
      )
    })
    .sort((a, b) => {
      const orderA = lifecycleOrder[a.lifecycle || 'maintained'] ?? 999
      const orderB = lifecycleOrder[b.lifecycle || 'maintained'] ?? 999
      return orderA - orderB || a.name.localeCompare(b.name)
    })

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-colors"
      >
        <Scale className="h-4 w-4" aria-hidden="true" />
        {tShared('actions.compare')}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label={tComponent('searchDialog.close')}
          />
          <div
            id={dropdownId}
            role="dialog"
            aria-label={tShared('actions.compare')}
            className="absolute top-full right-0 z-50 mt-1 w-[min(320px,calc(100vw-2rem))] max-h-[400px] border border-[var(--color-border-strong)] bg-[var(--color-bg)] shadow-lg"
            onKeyDown={event => {
              if (event.key === 'Escape') setIsOpen(false)
            }}
          >
            <div className="p-2 border-b border-[var(--color-border)]">
              <label htmlFor={`${dropdownId}-search`} className="sr-only">
                {tShared('labels.searchByName')}
              </label>
              <input
                id={`${dropdownId}-search`}
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder={tShared('labels.searchByName')}
                className="w-full px-2 py-1 text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)]"
              />
            </div>

            <div className="overflow-y-auto max-h-[320px]">
              {availableModels.length === 0 ? (
                <div className="p-4 text-sm text-[var(--color-text-muted)] text-center">
                  {tComponent('searchDialog.noResultsFor', { query: searchQuery })}
                </div>
              ) : (
                <ul>
                  {availableModels.map(model => (
                    <li key={model.id}>
                      <Link
                        href={`/models/compare/${currentModelId}-vs-${model.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 text-sm hover:bg-[var(--color-hover)] transition-colors"
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{model.vendor}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
