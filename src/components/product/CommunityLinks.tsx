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
  const t = useTranslations('components')

  if (!communityUrls) {
    return null
  }

  const links = [
    {
      key: 'linkedin',
      title: t('communityLinks.linkedin'),
      description: t('communityLinks.linkedinDescription'),
    },
    {
      key: 'twitter',
      title: t('communityLinks.twitter'),
      description: t('communityLinks.twitterDescription'),
    },
    {
      key: 'github',
      title: t('communityLinks.github'),
      description: t('communityLinks.githubDescription'),
    },
    {
      key: 'youtube',
      title: t('communityLinks.youtube'),
      description: t('communityLinks.youtubeDescription'),
    },
    {
      key: 'discord',
      title: t('communityLinks.discord'),
      description: t('communityLinks.discordDescription'),
    },
    {
      key: 'reddit',
      title: t('communityLinks.reddit'),
      description: t('communityLinks.redditDescription'),
    },
    {
      key: 'blog',
      title: t('communityLinks.blog'),
      description: t('communityLinks.blogDescription'),
    },
  ]

  return (
    <LinkCardGrid
      title={t('resources.community')}
      links={links}
      urls={communityUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
