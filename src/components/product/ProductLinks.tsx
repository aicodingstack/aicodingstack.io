import { useTranslations } from 'next-intl'

export interface resourceUrls {
  download?: string
  changelog?: string
  pricing?: string
  blog?: string
  mcp?: string
  issue?: string
}

export interface CommunityUrls {
  linkedin?: string
  twitter?: string
  github?: string
  youtube?: string
  discord?: string
  reddit?: string
  blog?: string
}

export interface ProductLinksProps {
  resourceUrls?: resourceUrls
  communityUrls?: CommunityUrls
}

export function ProductLinks({ resourceUrls, communityUrls }: ProductLinksProps) {
  const t = useTranslations('components.productLinks')

  // Check if there's any content to display
  const hasresourceUrls = resourceUrls && Object.values(resourceUrls).some(url => url)
  const hasCommunityUrls = communityUrls && Object.values(communityUrls).some(url => url)

  // If both resourceUrls and communityUrls have no values, don't render the component
  if (!hasresourceUrls && !hasCommunityUrls) {
    return null
  }

  // Define the order of links for resourceUrls
  const pageUrlKeys = ['download', 'changelog', 'pricing', 'blog', 'mcp', 'issue'] as const

  // Define the order of links for communityUrls
  const communityUrlKeys = [
    'linkedin',
    'twitter',
    'github',
    'youtube',
    'discord',
    'reddit',
    'blog',
  ] as const

  // Generate link configurations for resourceUrls by iterating over keys
  const pageUrlLinks = pageUrlKeys.map(key => ({
    key,
    url: resourceUrls?.[key],
    label: t(key),
  }))

  // Generate link configurations for communityUrls by iterating over keys
  const communityUrlLinks = communityUrlKeys.map(key => ({
    key,
    url: communityUrls?.[key],
    label: t(key),
  }))

  // Define sections configuration
  const sections = [
    { title: t('resources'), links: pageUrlLinks, show: hasresourceUrls },
    { title: t('community'), links: communityUrlLinks, show: hasCommunityUrls },
  ]

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
          {sections.map(
            ({ title, links, show }) =>
              show && (
                <div key={title}>
                  <h3 className="text-sm font-semibold tracking-tight mb-[var(--spacing-sm)] text-[var(--color-text-muted)] uppercase">
                    {title}
                  </h3>
                  <ul className="space-y-[var(--spacing-xs)]">
                    {links.map(
                      ({ key, url, label }) =>
                        url && (
                          <li key={key}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener"
                              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                            >
                              → {label}
                            </a>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  )
}
