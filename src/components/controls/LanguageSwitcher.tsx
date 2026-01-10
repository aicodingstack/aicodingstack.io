'use client'

import { Languages } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { type Locale, localeNames, locales } from '@/i18n/config'

// Type definition for Cookie Store API
interface CookieStoreSetOptions {
  name: string
  value: string
  path?: string
  expires?: number
  sameSite?: string
}

interface CookieStoreAPI {
  set(options: CookieStoreSetOptions): Promise<void>
}

async function setCookie(
  name: string,
  value: string,
  options: {
    path: string
    maxAge: number
    sameSite: 'Lax' | 'Strict' | 'None'
  }
) {
  if (typeof window === 'undefined') return

  // Try to use Cookie Store API if available
  const cookieStore = (window as { cookieStore?: CookieStoreAPI }).cookieStore
  if (cookieStore) {
    try {
      await cookieStore.set({
        name,
        value,
        path: options.path,
        expires: Date.now() + options.maxAge * 1000,
        sameSite: options.sameSite.toLowerCase(),
      })
      return
    } catch {
      // Fall through to legacy method if Cookie Store API fails
    }
  }

  // Fallback to document.cookie for browsers that don't support Cookie Store API
  // This is necessary for iOS Safari and older browsers
  const cookie = `${name}=${value}; path=${options.path}; max-age=${options.maxAge}; SameSite=${options.sameSite}`
  // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support (iOS Safari, older browsers)
  document.cookie = cookie
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const tComponents = useTranslations('components')
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

  const switchLocale = async (newLocale: Locale) => {
    // Store the user's locale preference
    if (typeof window !== 'undefined') {
      await setCookie('NEXT_LOCALE', newLocale, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'Lax',
      })
      localStorage.setItem('aicodingstack-locale', newLocale)
    }

    // Get the current path without locale prefix
    // Check if pathname starts with a locale
    let pathnameWithoutLocale = pathname
    locales.forEach(loc => {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        pathnameWithoutLocale = pathname.slice(`/${loc}`.length) || '/'
      }
    })

    // Construct the new path
    let newPath: string
    if (newLocale === 'en') {
      // For English (default locale), navigate to root path without locale prefix
      newPath = pathnameWithoutLocale
    } else {
      // For other locales, add the locale prefix
      newPath = `/${newLocale}${pathnameWithoutLocale}`
    }

    // Use window.location for more reliable navigation in production
    if (typeof window !== 'undefined') {
      window.location.href = newPath
    } else {
      router.push(newPath)
      router.refresh()
    }

    setIsOpen(false)
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="footer-control-button"
        title={tComponents('footer.selectLanguage')}
        aria-label={tComponents('footer.selectLanguage')}
        aria-expanded={isOpen}
      >
        <Languages className="footer-control-icon" />
        {localeNames[locale]}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 min-w-[160px] bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg">
          {locales.map(loc => (
            <button
              type="button"
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-xs hover:bg-[var(--color-hover)] transition-colors ${
                loc === locale ? 'bg-[var(--color-hover)] font-medium' : 'font-light'
              }`}
            >
              {localeNames[loc]}
              {loc === locale && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
