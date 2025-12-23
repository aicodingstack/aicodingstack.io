import { LinkCardGrid } from '@/components/product/LinkCard'
import type { ManifestCommunityUrls } from '@/types/manifests'

export interface CommunityLinksProps {
  communityUrls: ManifestCommunityUrls | null | undefined
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
 * CommunityLinks Section
 *
 * Displays community/social links for organizations (vendors, providers).
 * Reuses LinkCardGrid for consistent styling.
 */
export function CommunityLinks({
  communityUrls,
  title,
  links,
  layout = 'vertical',
  gridCols = 'grid-cols-2 md:grid-cols-4',
}: CommunityLinksProps) {
  if (!communityUrls) {
    return null
  }

  return (
    <LinkCardGrid
      title={title}
      links={links}
      urls={communityUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
