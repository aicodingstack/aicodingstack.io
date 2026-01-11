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
  const tComponent = useTranslations('components.product.resourceLinks')
  const tShared = useTranslations('shared')

  if (!resourceUrls) {
    return null
  }

  const links = [
    {
      key: 'download',
      title: tShared('actions.download'),
      description: tComponent('downloadDescription'),
    },
    {
      key: 'changelog',
      title: tComponent('changelog'),
      description: tComponent('changelogDescription'),
    },
    {
      key: 'pricing',
      title: tShared('terms.pricing'),
      description: tComponent('pricingDescription'),
    },
    { key: 'mcp', title: tComponent('mcp'), description: tComponent('mcpDescription') },
    {
      key: 'issue',
      title: tComponent('issue'),
      description: tComponent('issueDescription'),
    },
  ] as const

  return (
    <LinkCardGrid
      title={tComponent('resources')}
      links={links}
      urls={resourceUrls}
      layout={layout}
      gridCols={gridCols}
    />
  )
}
