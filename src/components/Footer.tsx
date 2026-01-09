'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/controls/LanguageSwitcher'
import ThemeSwitcher from '@/components/controls/ThemeSwitcher'
import { Link } from '@/i18n/navigation'

// Footer link list component to reduce code duplication
interface FooterLinkListProps {
  title: string
  links: Array<{ href: string; label: string; isExternal?: boolean }>
}

function FooterLinkList({ title, links }: FooterLinkListProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-[var(--spacing-xs)] list-none">
        {links.map(item => (
          <li key={item.href}>
            {item.isExternal ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="footer-link">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="footer-link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const tFooter = useTranslations('components.footer')
  const tPlatforms = useTranslations('shared.platforms')
  const tStacks = useTranslations('shared.categories.plural')
  const tTerms = useTranslations('shared.terms')

  // Define link arrays (static hrefs, only labels depend on translations)
  const resourceLinks = [
    { href: '/ides', label: tStacks('ides') },
    { href: '/clis', label: tStacks('clis') },
    { href: '/extensions', label: tStacks('extensions') },
    { href: '/models', label: tStacks('models') },
    { href: '/model-providers', label: tStacks('modelProviders') },
    { href: '/vendors', label: tStacks('vendors') },
  ]

  const documentationLinks = [
    { href: '/docs', label: tTerms('docs') },
    { href: '/articles', label: tTerms('articles') },
    { href: '/curated-collections', label: tTerms('curatedCollections') },
    { href: '/#faq', label: tTerms('faq') },
  ]

  const communityLinks = [
    {
      href: 'https://github.com/aicodingstack/aicodingstack.io',
      label: tPlatforms('github'),
      isExternal: true,
    },
    {
      href: 'https://aicodingstack.io/discord',
      label: tPlatforms('discord'),
      isExternal: true,
    },
    {
      href: 'https://x.com/aicodingstack',
      label: tPlatforms('twitter'),
      isExternal: false,
    },
  ]

  return (
    <footer className="bg-[var(--color-bg)] max-w-8xl mx-auto px-[var(--spacing-md)] mt-[var(--spacing-lg)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-[var(--spacing-lg)] py-[var(--spacing-lg)] border-y border-[var(--color-border)]">
        <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-3">
          <span className="text-sm font-semibold tracking-tight">{tTerms('aiCodingStack')}</span>
          <p className="text-sm pb-[var(--spacing-sm)] leading-[1.8] text-[var(--color-text-secondary)] font-light">
            {tFooter('tagline')}
            <span className="block mt-[var(--spacing-sm)]">{tFooter('openSource')}</span>
          </p>
          <div className="flex gap-[var(--spacing-xs)]">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        <FooterLinkList title={tTerms('resources')} links={resourceLinks} />
        <FooterLinkList title={tTerms('documentation')} links={documentationLinks} />
        <FooterLinkList title={tTerms('community')} links={communityLinks} />
      </div>

      <div className="py-[var(--spacing-md)] text-center text-xs text-[var(--color-text-muted)]">
        {tFooter('copyright')}
      </div>
    </footer>
  )
}
