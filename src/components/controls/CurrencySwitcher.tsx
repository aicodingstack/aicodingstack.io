'use client'

import { CircleDollarSign } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { type CurrencyPreference, useCurrency } from '@/components/CurrencyProvider'

const preferences: CurrencyPreference[] = ['native', 'CNY', 'USD']

export default function CurrencySwitcher() {
  const locale = useLocale()
  const tComponent = useTranslations('components.controls')
  const { exchangeRate, preference, rateStatus, setPreference } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const preferenceLabel = (value: CurrencyPreference) => {
    if (value === 'native') return tComponent('currencySwitcher.native')
    return tComponent(value === 'CNY' ? 'currencySwitcher.cny' : 'currencySwitcher.usd')
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="footer-control-button"
        title={tComponent('currencySwitcher.label')}
        aria-label={tComponent('currencySwitcher.label')}
        aria-expanded={isOpen}
      >
        <CircleDollarSign className="footer-control-icon" />
        {preference === 'native' ? tComponent('currencySwitcher.nativeShort') : preference}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={tComponent('currencySwitcher.label')}
          className="absolute bottom-full left-0 mb-1 min-w-[220px] bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg z-10"
        >
          {preferences.map(value => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={value === preference}
              key={value}
              onClick={() => {
                setPreference(value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-xs hover:bg-[var(--color-hover)] transition-colors ${
                value === preference ? 'bg-[var(--color-hover)] font-medium' : 'font-light'
              }`}
            >
              {preferenceLabel(value)}
              {value === preference && ' ✓'}
            </button>
          ))}

          {preference !== 'native' && (
            <div className="border-t border-[var(--color-border)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[0.6875rem] leading-relaxed text-[var(--color-text-muted)]">
              {rateStatus === 'loading' && !exchangeRate
                ? tComponent('currencySwitcher.loadingRate')
                : exchangeRate
                  ? tComponent('currencySwitcher.referenceRate', {
                      date: new Intl.DateTimeFormat(locale).format(
                        new Date(`${exchangeRate.date}T00:00:00Z`)
                      ),
                      rate: new Intl.NumberFormat(locale, {
                        maximumFractionDigits: 4,
                      }).format(exchangeRate.usdToCny),
                    })
                  : tComponent('currencySwitcher.rateUnavailable')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
