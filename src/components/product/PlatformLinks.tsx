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
  const tComponent = useTranslations('components.product.platformLinks')
  const tShared = useTranslations('shared')

  if (!platformUrls) {
    return null
  }

  const links = [
    {
      key: 'huggingface',
      title: tShared('platforms.huggingface'),
      description: tComponent('aiPlatforms.huggingface.description'),
    },
    {
      key: 'artificialAnalysis',
      title: tShared('platforms.artificialAnalysis'),
      description: tComponent('aiPlatforms.artificialAnalysis.description'),
    },
    {
      key: 'openrouter',
      title: tShared('platforms.openrouter'),
      description: tComponent('aiPlatforms.openrouter.description'),
    },
  ] as const

  return (
    <LinkCardGrid
      title={tShared('labels.findOnAiPlatforms')}
      links={links}
      urls={platformUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
