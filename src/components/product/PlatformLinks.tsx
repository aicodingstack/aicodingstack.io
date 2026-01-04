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
  const t = useTranslations('components.platformLinks')

  if (!platformUrls) {
    return null
  }

  const links = [
    {
      key: 'huggingface',
      title: t('aiPlatforms.huggingface.title'),
      description: t('aiPlatforms.huggingface.description'),
    },
    {
      key: 'artificialAnalysis',
      title: t('aiPlatforms.artificialAnalysis.title'),
      description: t('aiPlatforms.artificialAnalysis.description'),
    },
    {
      key: 'openrouter',
      title: t('aiPlatforms.openrouter.title'),
      description: t('aiPlatforms.openrouter.description'),
    },
  ]

  return (
    <LinkCardGrid
      title={t('title')}
      links={links}
      urls={platformUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
