import { LinkCardGrid } from '@/components/product/LinkCard'

export interface PlatformUrls {
  huggingface?: string | null
  artificialAnalysis?: string | null
  openrouter?: string | null
  [key: string]: string | null | undefined
}

export interface PlatformLinksProps {
  platformUrls: PlatformUrls | null | undefined
  title: string
  links: Array<{
    key: string
    title: string
    description: string
  }>
  layout?: 'horizontal' | 'vertical'
  gridCols?: string
}

/**
 * Check whether the given platform URLs object contains at least one usable URL.
 *
 * We treat empty strings and whitespace-only strings as "missing".
 */
function hasAnyPlatformUrl(platformUrls: PlatformUrls): boolean {
  return Object.values(platformUrls).some(value => {
    if (typeof value !== 'string') return false
    return value.trim().length > 0
  })
}

/**
 * PlatformLinks Section
 *
 * Displays AI platform links for models and providers
 * (HuggingFace, Artificial Analysis, OpenRouter).
 * Reuses LinkCardGrid for consistent styling.
 */
export function PlatformLinks({
  platformUrls,
  title,
  links,
  layout = 'horizontal',
  gridCols = 'grid-cols-1 md:grid-cols-3',
}: PlatformLinksProps) {
  if (!platformUrls || links.length === 0 || !hasAnyPlatformUrl(platformUrls)) {
    return null
  }

  return (
    <LinkCardGrid
      title={title}
      links={links}
      urls={platformUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
