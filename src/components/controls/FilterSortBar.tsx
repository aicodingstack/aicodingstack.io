'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

export interface FilterSortBarProps {
  sortOrder: 'default' | 'name-asc' | 'name-desc'
  onSortChange: (order: 'default' | 'name-asc' | 'name-desc') => void
  licenseFilters: string[]
  onLicenseFiltersChange: (filters: string[]) => void
  platformFilters: string[]
  onPlatformFiltersChange: (platforms: string[]) => void
  availablePlatforms?: string[]
  platformLabel?: string // Custom label for platform filter (e.g., "IDE", "Compatibility")
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function FilterSortBar({
  sortOrder,
  onSortChange,
  licenseFilters,
  onLicenseFiltersChange,
  platformFilters,
  onPlatformFiltersChange,
  availablePlatforms = ['macOS', 'Windows', 'Linux'],
  platformLabel,
  searchQuery = '',
  onSearchChange,
}: FilterSortBarProps) {
  const tComponents = useTranslations('components')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const sortOptions = [
    { value: 'default', label: tComponents('filterSortBar.sortDefault') },
    { value: 'name-asc', label: tComponents('filterSortBar.sortNameAsc') },
    { value: 'name-desc', label: tComponents('filterSortBar.sortNameDesc') },
  ]

  const currentSortLabel =
    sortOptions.find(opt => opt.value === sortOrder)?.label ||
    tComponents('filterSortBar.sortDefault')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleLicense = (license: string) => {
    if (licenseFilters.includes(license)) {
      onLicenseFiltersChange(licenseFilters.filter(l => l !== license))
    } else {
      onLicenseFiltersChange([...licenseFilters, license])
    }
  }

  const togglePlatform = (platform: string) => {
    if (platformFilters.includes(platform)) {
      onPlatformFiltersChange(platformFilters.filter(p => p !== platform))
    } else {
      onPlatformFiltersChange([...platformFilters, platform])
    }
  }

  const hasActiveFilters =
    licenseFilters.length > 0 || platformFilters.length > 0 || searchQuery.length > 0

  const clearFilters = () => {
    onLicenseFiltersChange([])
    onPlatformFiltersChange([])
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  return (
    <div className="mb-[var(--spacing-md)]">
      <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
        {/* Search Box */}
        {onSearchChange && (
          <div className="flex items-center gap-[var(--spacing-xs)] flex-1 min-w-[200px] max-w-2xs">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={tComponents('filterSortBar.search')}
              className="flex-1 px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>
        )}

        {/* Sort Custom Dropdown */}
        <div className="flex items-center gap-[var(--spacing-xs)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            {tComponents('filterSortBar.sort')}
          </span>
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="px-[var(--spacing-sm)] py-1 text-sm border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors flex items-center gap-1"
            >
              {currentSortLabel}
              <span className="text-xs">{isSortOpen ? '▲' : '▼'}</span>
            </button>

            {isSortOpen && (
              <div className="absolute top-full mt-1 left-0 z-10 bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg min-w-[140px]">
                {sortOptions.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value as 'default' | 'name-asc' | 'name-desc')
                      setIsSortOpen(false)
                    }}
                    className={`w-full text-left px-[var(--spacing-sm)] py-1.5 text-sm transition-colors ${
                      sortOrder === option.value
                        ? 'bg-[var(--color-border)] text-[var(--color-text)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* License Filter Buttons */}
        <div className="flex items-center gap-[var(--spacing-xs)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            {tComponents('filterSortBar.license')}
          </span>
          <button
            type="button"
            onClick={() => toggleLicense('open-source')}
            className={`px-[var(--spacing-sm)] py-1 text-sm border transition-colors ${
              licenseFilters.includes('open-source')
                ? 'border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-text)]'
                : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            {tComponents('filterSortBar.openSource')}
          </button>
          <button
            type="button"
            onClick={() => toggleLicense('proprietary')}
            className={`px-[var(--spacing-sm)] py-1 text-sm border transition-colors ${
              licenseFilters.includes('proprietary')
                ? 'border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-text)]'
                : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            {tComponents('filterSortBar.proprietary')}
          </button>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-[var(--spacing-xs)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            {platformLabel || tComponents('filterSortBar.platform')}
          </span>
          {availablePlatforms.map(platform => (
            <button
              type="button"
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-[var(--spacing-sm)] py-1 text-sm border transition-colors ${
                platformFilters.includes(platform)
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-text)]'
                  : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto px-[var(--spacing-sm)] py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            {tComponents('filterSortBar.clearFilters')}
          </button>
        )}
      </div>
    </div>
  )
}
