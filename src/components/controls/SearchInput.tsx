'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { SearchResult } from '@/lib/search'
import { getAutocompleteSuggestions } from '@/lib/search'

export interface SearchInputProps {
  initialQuery?: string
  placeholder?: string
  onSearch?: (query: string) => void
}

export default function SearchInput({
  initialQuery = '',
  placeholder,
  onSearch,
}: SearchInputProps) {
  const tShared = useTranslations('shared')
  const tComponent = useTranslations('components.controls.searchInput')
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUserInteracted = useRef(false)

  const placeholderText = placeholder || tComponent('placeholder')

  // Debounce search suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        const results = getAutocompleteSuggestions(query)
        setSuggestions(results)
        // Only auto-open dropdown if user has interacted with the input
        if (hasUserInteracted.current && results.length > 0) {
          setIsOpen(true)
        }
        setSelectedIndex(-1)
      }, 300)
    } else {
      setSuggestions([])
      setIsOpen(false)
      setSelectedIndex(-1)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    // Mark as user interaction to allow dropdown to open
    hasUserInteracted.current = true
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setIsOpen(false)
      if (onSearch) {
        onSearch(searchQuery.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex].name)
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    }
  }

  const handleSuggestionClick = (result: SearchResult) => {
    handleSearch(result.name)
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            hasUserInteracted.current = true
            if (query.trim() && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholderText}
          className="w-full px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1 left-0 right-0 z-50 bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg max-h-[400px] overflow-y-auto"
        >
          {suggestions.map((result, index) => (
            <button
              type="button"
              key={`${result.category}-${result.id}`}
              onClick={() => handleSuggestionClick(result)}
              className={`w-full text-left px-[var(--spacing-sm)] py-2 transition-colors border-b border-[var(--color-border)] last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-[var(--color-border)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--color-text)] text-sm truncate">
                    {result.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1">
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
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
