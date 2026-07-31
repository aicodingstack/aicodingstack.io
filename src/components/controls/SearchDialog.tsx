'use client'

import { Command } from 'cmdk'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from '@/i18n/navigation'
import type { SearchResult } from '@/lib/search'
import { getAutocompleteSuggestions } from '@/lib/search'

export interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  locale?: string
}

export default function SearchDialog({ isOpen, onClose, locale }: SearchDialogProps) {
  const tShared = useTranslations('shared')
  const tComponent = useTranslations('components.controls')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [mounted, setMounted] = useState(false)

  // Track mounting state for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSuggestions([])
    }
  }, [isOpen])

  // Search suggestions
  useEffect(() => {
    if (query.trim()) {
      const results = getAutocompleteSuggestions(query, locale, 10)
      setSuggestions(results)
    } else {
      setSuggestions([])
    }
  }, [query, locale])

  // Navigate to result
  const navigateToResult = (result: SearchResult) => {
    onClose()
    router.push(result.href)
  }

  // Navigate to search page
  const navigateToSearch = () => {
    if (query.trim()) {
      onClose()
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  if (!isOpen || !mounted) return null

  const dialogContent = (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close search dialog"
      />

      {/* Command Dialog */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <Command
          role="dialog"
          aria-modal="true"
          aria-label={tShared('actions.search')}
          className="w-full max-w-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl overflow-hidden pointer-events-auto"
          shouldFilter={false}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
            }
          }}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
            <svg
              className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0"
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
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={tComponent('searchDialog.placeholder')}
              className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none text-base"
              autoFocus
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-[var(--color-text)] border border-[var(--color-border)] bg-[var(--color-hover)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-[400px] overflow-y-auto">
            {suggestions.length === 0 ? (
              <Command.Item value="empty-state" disabled className="block py-12 text-center">
                <output aria-live="polite" className="block w-full">
                  {query.trim() === '' ? (
                    <div className="text-[var(--color-text-muted)] text-sm">
                      {tComponent('searchDialog.empty')}
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {tComponent('searchDialog.noResultsFor', { query })}
                      </p>
                    </div>
                  )}
                </output>
              </Command.Item>
            ) : (
              <Command.Group>
                {suggestions.map(result => (
                  <Command.Item
                    key={`${result.category}-${result.id}`}
                    value={`${result.name}-${result.description}`}
                    onSelect={() => navigateToResult(result)}
                    className="px-4 py-3 cursor-pointer transition-colors border-b border-[var(--color-border)] last:border-b-0 data-[selected=true]:bg-[var(--color-hover)] aria-selected:bg-[var(--color-hover)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--color-text)] text-sm truncate mb-1">
                          {result.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                          {result.description}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-0.5 text-xs border border-[var(--color-border)] text-[var(--color-text-muted)]">
                          {tShared(
                            `categories.plural.${result.category === 'providers' ? 'modelProviders' : result.category}`
                          )}
                        </span>
                      </div>
                    </div>
                  </Command.Item>
                ))}

                {/* View All Results Option */}
                {query.trim() && (
                  <Command.Item
                    value="view-all-results"
                    onSelect={navigateToSearch}
                    className="px-4 py-3 cursor-pointer transition-colors border-t border-[var(--color-border)] data-[selected=true]:bg-[var(--color-hover)] aria-selected:bg-[var(--color-hover)] text-[var(--color-text-secondary)]"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span>{tComponent('searchDialog.viewAllResults', { query })}</span>
                      <span className="ml-auto text-[var(--color-text-muted)]">→</span>
                    </div>
                  </Command.Item>
                )}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer with keyboard hints */}
          {suggestions.length > 0 && (
            <div className="hidden sm:flex items-center justify-end gap-4 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-hover)] text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-bg)]">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-bg)]">
                  ↓
                </kbd>
                <span>{tComponent('searchDialog.navigate')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-bg)]">
                  ↵
                </kbd>
                <span>{tComponent('searchDialog.select')}</span>
              </div>
            </div>
          )}
        </Command>
      </div>
    </>
  )

  return createPortal(dialogContent, document.body)
}
