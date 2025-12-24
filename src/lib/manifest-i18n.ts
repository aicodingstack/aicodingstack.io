import { defaultLocale, type Locale } from '@/i18n/config'

/**
 * Interface for manifest items with translations support
 */
export interface ManifestItemWithTranslations {
  description?: string
  name?: string
  translations?: {
    [locale: string]: {
      description?: string
      name?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

/**
 * Apply localization to a manifest item
 * @param item - The manifest item with potential translations
 * @param locale - The target locale (e.g., 'en', 'zh-Hans')
 * @param fields - Array of field names to localize (default: ['description'])
 * @returns A new object with localized fields
 */
export function localizeManifestItem<T extends Record<string, unknown>>(
  item: T,
  locale: Locale,
  fields: (keyof T)[] = ['description' as keyof T]
): T {
  // If locale is default, return the original item
  if (locale === defaultLocale) {
    return item
  }

  // Create a new object with localized fields
  const localizedItem = { ...item }

  // Check if item has translations
  const translationsData = item.translations as Record<string, Record<string, string>> | undefined
  if (!translationsData || !translationsData[locale]) {
    return item
  }

  // Apply translations for requested fields
  const translations = translationsData[locale]
  for (const field of fields) {
    const fieldStr = String(field)
    if (fieldStr in translations && translations[fieldStr]) {
      ;(localizedItem as Record<string, unknown>)[fieldStr] = translations[fieldStr]
    }
  }

  return localizedItem
}

/**
 * Apply localization to an array of manifest items
 * @param items - Array of manifest items with potential translations
 * @param locale - The target locale (e.g., 'en', 'zh-Hans')
 * @param fields - Array of field names to localize (default: ['description'])
 * @returns A new array with localized items
 */
export function localizeManifestItems<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fields?: (keyof T)[]
): T[] {
  return items.map(item => localizeManifestItem(item, locale, fields))
}
