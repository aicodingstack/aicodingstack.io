import { useTranslations } from 'next-intl'
import type { ManifestCommunityUrls, ManifestResourceUrls } from '@/types/manifests'

export interface ProductLinksProps {
  resourceUrls?: ManifestResourceUrls | null
  communityUrls?: ManifestCommunityUrls | null
}

export function ProductLinks({ resourceUrls, communityUrls }: ProductLinksProps) {
  const t = useTranslations('components.productLinks')

  // Normalize manifest URLs to component-friendly optional strings
  const normalizedResourceUrls: Record<string, string | undefined> = {
    download: resourceUrls?.download ?? undefined,
    changelog: resourceUrls?.changelog ?? undefined,
    pricing: resourceUrls?.pricing ?? undefined,
    mcp: resourceUrls?.mcp ?? undefined,
    issue: resourceUrls?.issue ?? undefined,
    blog: undefined,
  }

  const normalizedCommunityUrls = {
    linkedin: communityUrls?.linkedin ?? undefined,
    twitter: communityUrls?.twitter ?? undefined,
    github: communityUrls?.github ?? undefined,
    youtube: communityUrls?.youtube ?? undefined,
    discord: communityUrls?.discord ?? undefined,
    reddit: communityUrls?.reddit ?? undefined,
    blog: communityUrls?.blog ?? undefined,
  }

  // Check if there's any content to display
  const hasresourceUrls = Object.values(normalizedResourceUrls).some(url => url)
  const hasCommunityUrls = Object.values(normalizedCommunityUrls).some(url => url)

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
    url: normalizedResourceUrls[key],
    label: t(key),
  }))

  // Generate link configurations for communityUrls by iterating over keys
  const communityUrlLinks = communityUrlKeys.map(key => ({
    key,
    url: normalizedCommunityUrls[key],
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
