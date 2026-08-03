import type { Locale } from '@/i18n/config'
import type { CLILandingContent } from '@/lib/content/cli-landing-markdown'
import landingPages from '../../../data/generated/cli-landing-pages.json'

export type { CLILandingContent } from '@/lib/content/cli-landing-markdown'

const contentByLocale = landingPages as Record<Locale, Record<string, CLILandingContent>>

export function getCLILandingContent(slug: string, locale: Locale): CLILandingContent {
  const content = contentByLocale[locale]?.[slug]
  if (!content) {
    throw new Error(`Missing CLI landing-page content for ${slug} (${locale})`)
  }
  return content
}
