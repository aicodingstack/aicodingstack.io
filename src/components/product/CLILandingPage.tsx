import {
  ArrowRight,
  ExternalLink,
  FilePenLine,
  GitCompareArrows,
  Plus,
  SearchCode,
  Terminal,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { DeprecatedBadge } from '@/components/controls/DeprecatedBadge'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import { CLICommandPanel } from '@/components/product/CLICommandPanel'
import { ProductPricing } from '@/components/product/ProductPricing'
import { RelatedProducts, type RelatedProductsProps } from '@/components/product/RelatedProducts'
import { Link } from '@/i18n/navigation'
import type { CLILandingContent } from '@/lib/content/cli-landing-pages'
import { renderLicense } from '@/lib/license'
import type { ManifestCLI } from '@/types/manifests'

export interface CLILandingPageProps {
  cli: ManifestCLI
  content: CLILandingContent
  locale: string
  githubStars: number | null
  pricingUrl?: string
  relatedProducts: RelatedProductsProps['products']
}

interface FactRowProps {
  label: string
  children: ReactNode
}

const capabilityIcons = [SearchCode, FilePenLine, Terminal]

function formatDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(`${date}T00:00:00Z`)
  )
}

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function FactRow({ label, children }: FactRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[var(--spacing-sm)] py-[var(--spacing-xs)] border-b last:border-b-0 border-[var(--color-border)]">
      <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-xs font-medium text-right break-words">{children}</dd>
    </div>
  )
}

export function CLILandingPage({
  cli,
  content,
  locale,
  githubStars,
  pricingUrl,
  relatedProducts,
}: CLILandingPageProps) {
  const tShared = useTranslations('shared')
  const tComponent = useTranslations('components.product')
  const hasCommands = Boolean(
    cli.installCommand ||
      cli.launchCommand ||
      cli.platforms.some(platform => platform.installCommand || platform.launchCommand)
  )
  const confidenceLabels = {
    high: tComponent('cliLanding.verification.confidenceValues.high'),
    medium: tComponent('cliLanding.verification.confidenceValues.medium'),
    low: tComponent('cliLanding.verification.confidenceValues.low'),
  }

  const linkCandidates = [
    { label: tShared('terms.visitWebsite'), url: cli.websiteUrl },
    { label: tShared('terms.documentation'), url: cli.docsUrl },
    { label: 'GitHub', url: cli.githubUrl },
    { label: tShared('actions.download'), url: cli.resourceUrls.download },
    { label: tComponent('resourceLinks.changelog'), url: cli.resourceUrls.changelog },
    { label: tShared('terms.pricing'), url: cli.resourceUrls.pricing },
    { label: tComponent('resourceLinks.issue'), url: cli.resourceUrls.issue },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url))
  const officialLinks = linkCandidates.filter(
    (link, index) => linkCandidates.findIndex(candidate => candidate.url === link.url) === index
  )
  const communityLinkCandidates = [
    { label: tShared('platforms.linkedin'), url: cli.communityUrls.linkedin },
    { label: tShared('platforms.twitter'), url: cli.communityUrls.twitter },
    { label: tShared('platforms.github'), url: cli.communityUrls.github },
    { label: tShared('platforms.youtube'), url: cli.communityUrls.youtube },
    { label: tShared('platforms.discord'), url: cli.communityUrls.discord },
    { label: tShared('platforms.reddit'), url: cli.communityUrls.reddit },
    { label: tComponent('communityLinks.blog'), url: cli.communityUrls.blog },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url))
  const communityLinks = communityLinkCandidates.filter(
    (link, index) =>
      !officialLinks.some(officialLink => officialLink.url === link.url) &&
      communityLinkCandidates.findIndex(candidate => candidate.url === link.url) === index
  )

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-[var(--spacing-lg)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)] lg:px-[var(--spacing-lg)]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] gap-[var(--spacing-xl)] items-start lg:items-center">
            <div>
              <div className="flex items-center gap-[var(--spacing-xs)] mb-[var(--spacing-md)] text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                <span>{cli.vendor}</span>
                <span aria-hidden="true">·</span>
                <span>{tShared('categories.singular.cli')}</span>
                {cli.verified && <VerifiedBadge size="sm" />}
                {cli.deprecated && <DeprecatedBadge size="sm" />}
              </div>

              <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.05em] detail-page-h1 mb-[var(--spacing-md)]">
                {cli.name}
              </h1>
              <p className="text-xl leading-relaxed font-medium max-w-2xl mb-[var(--spacing-sm)]">
                {content.answer}
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-2xl mb-[var(--spacing-lg)]">
                {content.introduction}
              </p>

              <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                <a
                  href={cli.websiteUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] hover:bg-[var(--color-text-secondary)] transition-colors"
                >
                  {tShared('terms.visitWebsite')}
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
                <Link
                  href="/clis/comparison"
                  className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm font-medium border border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] transition-colors"
                >
                  {tComponent('cliLanding.comparisonAction')}
                  <GitCompareArrows size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {hasCommands && (
              <div className="min-w-0 border border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] flex flex-col lg:min-h-[22rem]">
                <div className="relative flex items-center justify-center border-b border-white/20 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-xs text-white/65">
                  <div
                    className="absolute left-[var(--spacing-sm)] flex items-center gap-2"
                    aria-hidden="true"
                  >
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span>{cli.name}</span>
                </div>
                <CLICommandPanel
                  platforms={cli.platforms}
                  installCommand={cli.installCommand}
                  launchCommand={cli.launchCommand}
                  installLabel={tComponent('productCommands.install')}
                  launchLabel={tComponent('productCommands.launch')}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-8xl mx-auto px-[var(--spacing-md)] lg:px-[var(--spacing-lg)] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem] gap-[var(--spacing-xl)] items-start">
        <div>
          <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-md)]">
              {tComponent('cliLanding.capabilitiesTitle', { product: cli.name })}
            </h2>
            <div className="border-t border-[var(--color-border)]">
              {content.capabilities.items.map((item, index) => {
                const Icon = capabilityIcons[index] ?? Terminal
                return (
                  <article
                    key={item.title}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2rem_13rem_minmax(0,1fr)] gap-x-[var(--spacing-md)] gap-y-[var(--spacing-xs)] py-[var(--spacing-md)] border-b border-[var(--color-border)]"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="mt-0.5 text-[var(--color-text-secondary)]"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="col-start-2 md:col-start-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </section>

          <ProductPricing pricing={cli.pricing} pricingUrl={pricingUrl} variant="compact" />

          <RelatedProducts products={relatedProducts} variant="compact" />

          <section className="py-[var(--spacing-lg)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-md)]">
              {tComponent('cliLanding.faqTitle')}
            </h2>
            <div className="border-t border-[var(--color-border)]">
              {content.faq.items.map(item => (
                <details
                  key={item.question}
                  className="group border-b border-[var(--color-border)]"
                >
                  <summary className="list-none cursor-pointer py-[var(--spacing-md)] flex items-center justify-between gap-[var(--spacing-md)] font-medium">
                    <span>{item.question}</span>
                    <Plus
                      size={17}
                      className="shrink-0 transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-[var(--spacing-md)] pr-[var(--spacing-xl)] text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="py-[var(--spacing-lg)] lg:border-l lg:border-[var(--color-border)] lg:pl-[var(--spacing-lg)]">
          <dl className="border-t border-[var(--color-border)]">
            <FactRow label={tComponent('cliLanding.labels.publisher')}>{cli.vendor}</FactRow>
            <FactRow label={tShared('terms.license')}>
              {renderLicense(cli.license, 'hover:underline underline-offset-2', tShared)}
            </FactRow>
            <FactRow label={tShared('terms.platforms')}>
              <ul className="space-y-1 text-right">
                {cli.platforms.map(platform => (
                  <li key={platform.os}>{platform.os}</li>
                ))}
              </ul>
            </FactRow>
            <FactRow label={tShared('terms.version')}>{cli.latestVersion}</FactRow>
            <FactRow label={tShared('terms.stars')}>
              {githubStars === null ? '—' : `${githubStars}k`}
            </FactRow>
            <FactRow label={tComponent('cliLanding.labels.verified')}>
              {cli.lastVerifiedAt ? formatDate(cli.lastVerifiedAt, locale) : '—'}
            </FactRow>
          </dl>

          {officialLinks.length > 0 && (
            <section className="pt-[var(--spacing-lg)]">
              <h2 className="text-sm font-semibold mb-[var(--spacing-sm)]">
                {tShared('terms.resources')}
              </h2>
              <div className="border-t border-[var(--color-border)]">
                {officialLinks.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between gap-[var(--spacing-sm)] py-[var(--spacing-xs)] border-b border-[var(--color-border)] text-xs hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <span>{link.label}</span>
                    <ExternalLink
                      size={13}
                      className="shrink-0 text-[var(--color-text-muted)]"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {communityLinks.length > 0 && (
            <section className="pt-[var(--spacing-lg)]">
              <h2 className="text-sm font-semibold mb-[var(--spacing-sm)]">
                {tShared('terms.community')}
              </h2>
              <div className="border-t border-[var(--color-border)]">
                {communityLinks.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between gap-[var(--spacing-sm)] py-[var(--spacing-xs)] border-b border-[var(--color-border)] text-xs hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <span>{link.label}</span>
                    <ExternalLink
                      size={13}
                      className="shrink-0 text-[var(--color-text-muted)]"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {(cli.sources?.length || cli.lastVerifiedAt || cli.confidence) && (
            <section className="pt-[var(--spacing-lg)]">
              <h2 className="text-sm font-semibold mb-[var(--spacing-xs)]">
                {tComponent('cliLanding.verification.title')}
              </h2>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] mb-[var(--spacing-sm)]">
                {tComponent('cliLanding.verification.description')}
              </p>
              <div className="grid grid-cols-2 gap-[var(--spacing-sm)] py-[var(--spacing-sm)] border-y border-[var(--color-border)]">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    {tComponent('cliLanding.labels.confidence')}
                  </p>
                  <p className="text-xs font-medium">
                    {cli.confidence ? confidenceLabels[cli.confidence] : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    {tComponent('cliLanding.verification.reviewedBy')}
                  </p>
                  <p className="text-xs font-medium">AI Coding Stack</p>
                </div>
              </div>
              {cli.sources && cli.sources.length > 0 && (
                <div className="pt-[var(--spacing-xs)]">
                  {cli.sources.map(source => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-between gap-[var(--spacing-sm)] py-[var(--spacing-xs)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                    >
                      <span className="line-clamp-1">
                        {source.title ?? sourceLabel(source.url)}
                      </span>
                      <ArrowRight size={13} className="shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  )
}
