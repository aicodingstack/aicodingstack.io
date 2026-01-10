import { useTranslations } from 'next-intl'
import React from 'react'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import { renderLicense } from '@/lib/license'

export interface ProductHeroProps {
  // Product identity
  name: string
  description: string
  vendor?: string
  category: 'CLI' | 'IDE' | 'MCP' | 'PROVIDER' | 'MODEL' | 'VENDOR'
  categoryLabel?: string // Optional custom label for the badge
  verified?: boolean // Whether the product is verified

  // Metadata
  latestVersion?: string
  license?: string
  githubStars?: number | null

  // Platform support (for CLI/IDE)
  platforms?: ('macOS' | 'Windows' | 'Linux')[]
  showAllPlatforms?: boolean // Whether to show BSD platforms when supported

  // Additional info (for Models)
  additionalInfo?: {
    label: string
    value: string
    url?: string
  }[]

  // Pricing (for display in hero)
  pricing?: {
    label: string
    value: string
  }

  // Type (for Providers)
  type?: string
  typeValue?: string // Translated type value (e.g., "Foundation Model Provider")

  // Links
  websiteUrl?: string
  githubUrl?: string
  docsUrl?: string | null
  downloadUrl?: string
  applyKeyUrl?: string | null // For providers

  // Additional URLs (for models)
  additionalUrls?: {
    label: string
    url: string
    icon?: string
  }[]
}

export function ProductHero({
  name,
  description,
  vendor,
  category,
  categoryLabel,
  verified = false,
  latestVersion,
  license,
  githubStars,
  platforms,
  showAllPlatforms = false,
  additionalInfo,
  type,
  typeValue,
  websiteUrl,
  githubUrl,
  docsUrl,
  downloadUrl,
  applyKeyUrl,
  additionalUrls,
}: ProductHeroProps) {
  const tComponents = useTranslations('components')

  // Determine which platforms to display
  const displayPlatforms = platforms
    ? showAllPlatforms
      ? platforms
      : platforms.filter(p => ['macOS', 'Windows', 'Linux'].includes(p))
    : null

  // Get the category badge text
  const badgeText = categoryLabel || category

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      {/* Title and Description Container - Max 800px */}
      <div className="max-w-6xl mx-auto px-[var(--spacing-md)] text-center">
        {/* Title with Badge */}
        <div className="relative inline-block mb-[var(--spacing-sm)]">
          <div className="flex items-center justify-center gap-[var(--spacing-xs)]">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] detail-page-h1">{name}</h1>
            {verified && <VerifiedBadge size="lg" />}
          </div>
          <div className="absolute bottom-0 right-0 translate-x-[calc(100%+1rem)]">
            <div className="px-[var(--spacing-xs)] py-[2px] text-xs text-[var(--color-text-muted)] border-[1.5px] border-double border-[var(--color-border-strong)] whitespace-nowrap">
              {badgeText}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg text-[var(--color-text-secondary)] font-light leading-relaxed mb-[var(--spacing-lg)]">
          {description}
        </p>
      </div>

      {/* Metadata Bar - Content-based width */}
      {(vendor || latestVersion || license || (additionalInfo && additionalInfo.length > 0)) && (
        <div className="flex justify-center mb-[var(--spacing-lg)] px-[var(--spacing-md)]">
          <div className="inline-flex items-center gap-[var(--spacing-sm)] flex-wrap px-[var(--spacing-md)] py-[var(--spacing-md)] border border-[var(--color-border)] text-sm">
            {vendor && (
              <div className="flex gap-1">
                <span className="text-[var(--color-text-muted)]">
                  {tComponents('productHero.vendor')}:
                </span>
                <span className="font-medium">{vendor}</span>
              </div>
            )}

            {vendor && latestVersion && <span className="text-[var(--color-border)]">│</span>}

            {latestVersion && (
              <div className="flex gap-1">
                <span className="text-[var(--color-text-muted)]">
                  {tComponents('productHero.version')}:
                </span>
                <span className="font-medium">{latestVersion}</span>
              </div>
            )}

            {latestVersion && license && <span className="text-[var(--color-border)]">│</span>}

            {license && (
              <div className="flex gap-1">
                <span className="text-[var(--color-text-muted)]">
                  {tComponents('productHero.license')}:
                </span>
                {renderLicense(
                  license,
                  '!font-medium hover:underline hover:decoration-dotted transition-colors underline-offset-2',
                  tComponents
                )}
              </div>
            )}

            {license && githubStars !== null && githubStars !== undefined && (
              <span className="text-[var(--color-border)]">│</span>
            )}

            {githubStars !== null && githubStars !== undefined && (
              <div className="flex gap-1">
                <span className="text-[var(--color-text-muted)]">
                  {tComponents('productHero.stars')}:
                </span>
                <span className="font-medium">{githubStars}k</span>
              </div>
            )}

            {additionalInfo?.map(info => (
              <React.Fragment key={info.label}>
                {(vendor ||
                  latestVersion ||
                  license ||
                  (githubStars !== null && githubStars !== undefined) ||
                  additionalInfo.indexOf(info) > 0) && (
                  <span className="text-[var(--color-border)]">│</span>
                )}
                <div className="flex gap-1">
                  <span className="text-[var(--color-text-muted)]">{info.label}:</span>
                  {info.url ? (
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noopener"
                      className="font-medium hover:underline hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="font-medium">{info.value}</span>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Rest of the content - using the same container pattern */}
      <div className="max-w-6xl mx-auto px-[var(--spacing-md)] text-center">
        {/* Platforms */}
        {displayPlatforms && displayPlatforms.length > 0 && (
          <div className="flex justify-center mb-[var(--spacing-lg)]">
            <div className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] bg-[var(--color-hover)] border border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                {tComponents('productHero.platforms')}:
              </span>
              <div className="flex gap-[var(--spacing-xs)] flex-wrap">
                {(['macOS', 'Windows', 'Linux'] as const).map(platform => {
                  const isSupported = displayPlatforms.includes(platform)
                  if (!isSupported && !['macOS', 'Windows', 'Linux'].includes(platform)) return null
                  return (
                    <span
                      key={platform}
                      className={`px-[var(--spacing-xs)] py-[1px] text-xs font-medium border ${
                        isSupported
                          ? 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]'
                          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]'
                      }`}
                    >
                      {platform}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Type (for providers) */}
        {type && typeValue && (
          <div className="flex justify-center mb-[var(--spacing-lg)]">
            <div className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] bg-[var(--color-hover)] border border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                {tComponents('productHero.type')}:
              </span>
              <span className="text-sm font-medium">{type}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-[var(--spacing-sm)] justify-center flex-wrap">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-[var(--color-text)] text-[var(--color-bg)] hover:bg-[var(--color-text-secondary)] transition-all"
            >
              <span>↗</span> {tComponents('productHero.visitWebsite')}
            </a>
          )}

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-all"
            >
              <span>→</span> GitHub
            </a>
          )}

          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-all"
            >
              <span>→</span> {tComponents('productHero.documentation')}
            </a>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-all"
            >
              <span>⬇</span> {tComponents('productHero.download')}
            </a>
          )}

          {applyKeyUrl && (
            <a
              href={applyKeyUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-all"
            >
              <span>🔑</span> {tComponents('productHero.getApiKey')}
            </a>
          )}

          {additionalUrls?.map(urlInfo => (
            <a
              key={urlInfo.url}
              href={urlInfo.url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-hover)] transition-all"
            >
              {urlInfo.icon && <span>{urlInfo.icon}</span>} {urlInfo.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
