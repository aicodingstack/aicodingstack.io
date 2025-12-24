/**
 * Shared types for Next.js route params that include locale.
 */
export type LocaleParams = Promise<{ locale: string }>

export type LocalePageProps = {
  /**
   * Route params containing the locale.
   */
  params: LocaleParams
}
