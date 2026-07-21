import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './config'

/**
 * Routing configuration for next-intl
 * Defines available locales, default locale, and locale prefix strategy
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true,
})
