import { LinkCardGrid } from '@/components/product'
import type { ManifestCommunityUrls } from '@/types/manifests'

export interface EntityCommunityLinksProps {
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
 * EntityCommunityLinks Section
 *
 * Displays community/social links for organizations (vendors, providers).
 * Reuses LinkCardGrid for consistent styling.
 * Extracted from /vendors/[slug] and /model-providers/[slug] pages.
 */
export function EntityCommunityLinks({
  communityUrls,
  title,
  links,
  layout = 'vertical',
  gridCols = 'grid-cols-2 md:grid-cols-4',
}: EntityCommunityLinksProps) {
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
