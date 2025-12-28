export const locales = [
  'en',
  'de',
  'es',
  'fr',
  'id',
  'ja',
  'ko',
  'pt',
  'ru',
  'tr',
  'zh-Hans',
  'zh-Hant',
] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  ru: 'Русский',
  tr: 'Türkçe',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
}

/**
 * Map locale codes to OpenGraph locale format
 * Used for og:locale meta tags
 */
export const localeToOgLocale: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
  id: 'id_ID',
  ja: 'ja_JP',
  ko: 'ko_KR',
  pt: 'pt_PT',
  ru: 'ru_RU',
  tr: 'tr_TR',
  'zh-Hans': 'zh_CN',
  'zh-Hant': 'zh_TW',
}
