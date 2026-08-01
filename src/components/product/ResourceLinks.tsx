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
 * Displays resource links for products (download, changelog, pricing, issue tracker).
 * Reuses LinkCardGrid for consistent styling.
 */
export function ResourceLinks({
  resourceUrls,
  layout = 'vertical',
  gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7',
}: ResourceLinksProps) {
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')

  if (!resourceUrls) {
    return null
  }

  const links = [
    {
      key: 'download',
      title: tShared('actions.download'),
      description: tComponent('resourceLinks.downloadDescription'),
    },
    {
      key: 'changelog',
      title: tComponent('resourceLinks.changelog'),
      description: tComponent('resourceLinks.changelogDescription'),
    },
    {
      key: 'pricing',
      title: tShared('terms.pricing'),
      description: tComponent('resourceLinks.pricingDescription'),
    },
    {
      key: 'issue',
      title: tComponent('resourceLinks.issue'),
      description: tComponent('resourceLinks.issueDescription'),
    },
  ] as const

  return (
    <LinkCardGrid
      title={tShared('terms.resources')}
      links={links}
      urls={resourceUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
