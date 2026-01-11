'use client'

import { useTranslations } from 'next-intl'
import { LinkCardGrid } from '@/components/product/LinkCard'
import type { ManifestCommunityUrls } from '@/types/manifests'

export interface CommunityLinksProps {
  communityUrls: ManifestCommunityUrls | null | undefined
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
  layout = 'vertical',
  gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7',
}: CommunityLinksProps) {
  const tComponent = useTranslations('components.product.communityLinks')
  const tShared = useTranslations('shared')

  if (!communityUrls) {
    return null
  }

  const links = [
    {
      key: 'linkedin',
      title: tShared('platforms.linkedin'),
      description: tShared('terms.followUs'),
    },
    {
      key: 'twitter',
      title: tShared('platforms.twitter'),
      description: tShared('terms.followUs'),
    },
    {
      key: 'github',
      title: tShared('platforms.github'),
      description: tComponent('githubDescription'),
    },
    {
      key: 'youtube',
      title: tShared('platforms.youtube'),
      description: tComponent('youtubeDescription'),
    },
    {
      key: 'discord',
      title: tShared('platforms.discord'),
      description: tComponent('discordDescription'),
    },
    {
      key: 'reddit',
      title: tShared('platforms.reddit'),
      description: tComponent('redditDescription'),
    },
    {
      key: 'blog',
      title: tComponent('blog'),
      description: tComponent('blogDescription'),
    },
  ] as const

  return (
    <LinkCardGrid
      title={tShared('terms.community')}
      links={links}
      urls={communityUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
