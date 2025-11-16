export const locales = ['en', 'zh-Hans', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
  de: 'Deutsch',
};

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  'zh-Hans': '中文',
  de: 'DE',
};

/**
 * Map locale codes to OpenGraph locale format
 * Used for og:locale meta tags
 */
export const localeToOgLocale: Record<Locale, string> = {
  en: 'en_US',
  'zh-Hans': 'zh_CN',
  de: 'de_DE',
};
