import { LinkCardGrid } from '@/components/product'

export interface PlatformUrls {
  huggingface?: string | null
  artificialAnalysis?: string | null
  openrouter?: string | null
  [key: string]: string | null | undefined
}

export interface EntityPlatformLinksProps {
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
 * EntityPlatformLinks Section
 *
 * Displays AI platform links for models and providers
 * (HuggingFace, Artificial Analysis, OpenRouter).
 * Reuses LinkCardGrid for consistent styling.
 */
export function EntityPlatformLinks({
  platformUrls,
  title,
  links,
  layout = 'horizontal',
  gridCols = 'grid-cols-1 md:grid-cols-3',
}: EntityPlatformLinksProps) {
  if (!platformUrls) {
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
