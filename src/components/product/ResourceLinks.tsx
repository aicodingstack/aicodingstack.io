'use client'

import { useTranslations } from 'next-intl'
import { LinkCardGrid } from '@/components/product/LinkCard'
import type { ManifestResourceUrls } from '@/types/manifests'

export interface ResourceLinksProps {
  resourceUrls: ManifestResourceUrls | null | undefined
  layout?: 'horizontal' | 'vertical'
  gridCols?: string
}

/**
 * ResourceLinks Section
 *
 * Displays resource links for products (download, changelog, pricing, MCP documentation, issue tracker).
 * Reuses LinkCardGrid for consistent styling.
 */
export function ResourceLinks({
  resourceUrls,
  layout = 'vertical',
  gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7',
}: ResourceLinksProps) {
  const t = useTranslations('components')

  if (!resourceUrls) {
    return null
  }

  const links = [
    {
      key: 'download',
      title: t('resourceLinks.download'),
      description: t('resourceLinks.downloadDescription'),
    },
    {
      key: 'changelog',
      title: t('resourceLinks.changelog'),
      description: t('resourceLinks.changelogDescription'),
    },
    {
      key: 'pricing',
      title: t('resourceLinks.pricing'),
      description: t('resourceLinks.pricingDescription'),
    },
    { key: 'mcp', title: t('resourceLinks.mcp'), description: t('resourceLinks.mcpDescription') },
    {
      key: 'issue',
      title: t('resourceLinks.issue'),
      description: t('resourceLinks.issueDescription'),
    },
  ]

  return (
    <LinkCardGrid
      title={t('resources.resources')}
      links={links}
      urls={resourceUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
