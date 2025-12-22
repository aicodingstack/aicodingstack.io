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
