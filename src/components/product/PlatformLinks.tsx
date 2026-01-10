import { useTranslations } from 'next-intl'
import { LinkCardGrid } from '@/components/product/LinkCard'
import type { ManifestPlatformUrls } from '@/types/manifests'

export interface PlatformLinksProps {
  platformUrls: ManifestPlatformUrls | null | undefined
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
  layout = 'horizontal',
  gridCols = 'grid-cols-1 md:grid-cols-3',
}: PlatformLinksProps) {
  const tComponents = useTranslations('components')

  if (!platformUrls) {
    return null
  }

  const links = [
    {
      key: 'huggingface',
      title: tComponents('platformLinks.aiPlatforms.huggingface.title'),
      description: tComponents('platformLinks.aiPlatforms.huggingface.description'),
    },
    {
      key: 'artificialAnalysis',
      title: tComponents('platformLinks.aiPlatforms.artificialAnalysis.title'),
      description: tComponents('platformLinks.aiPlatforms.artificialAnalysis.description'),
    },
    {
      key: 'openrouter',
      title: tComponents('platformLinks.aiPlatforms.openrouter.title'),
      description: tComponents('platformLinks.aiPlatforms.openrouter.description'),
    },
  ] as const

  return (
    <LinkCardGrid
      title={tComponents('platformLinks.title')}
      links={links}
      urls={platformUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
