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
  const tComponent = useTranslations('components.common.footer')
  const tShared = useTranslations('shared')

  // Define link arrays (static hrefs, only labels depend on translations)
  const resourceLinks = [
    { href: '/ides', label: tShared('categories.plural.ides') },
    { href: '/clis', label: tShared('categories.plural.clis') },
    { href: '/extensions', label: tShared('categories.plural.extensions') },
    { href: '/models', label: tShared('categories.plural.models') },
    { href: '/model-providers', label: tShared('categories.plural.modelProviders') },
    { href: '/vendors', label: tShared('categories.plural.vendors') },
  ]

  const documentationLinks = [
    { href: '/docs', label: tShared('terms.docs') },
    { href: '/articles', label: tShared('terms.articles') },
    { href: '/curated-collections', label: tShared('terms.curatedCollections') },
    { href: '/#faq', label: tShared('terms.faq') },
  ]

  const communityLinks = [
    {
      href: 'https://github.com/aicodingstack/aicodingstack.io',
      label: tShared('platforms.github'),
      isExternal: true,
    },
    {
      href: 'https://aicodingstack.io/discord',
      label: tShared('platforms.discord'),
      isExternal: true,
    },
    {
      href: 'https://x.com/aicodingstack',
      label: tShared('platforms.twitter'),
      isExternal: false,
    },
  ]

  return (
    <footer className="bg-[var(--color-bg)] max-w-8xl mx-auto px-[var(--spacing-md)] mt-[var(--spacing-lg)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-[var(--spacing-lg)] py-[var(--spacing-lg)] border-y border-[var(--color-border)]">
        <div className="flex flex-col gap-[var(--spacing-sm)] lg:col-span-3">
          <span className="text-sm font-semibold tracking-tight">
            {tShared('terms.aiCodingStack')}
          </span>
          <p className="text-sm pb-[var(--spacing-sm)] leading-[1.8] text-[var(--color-text-secondary)] font-light">
            {tComponent('tagline')}
            <span className="block mt-[var(--spacing-sm)]">{tComponent('openSource')}</span>
          </p>
          <div className="flex gap-[var(--spacing-xs)]">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        <FooterLinkList title={tShared('terms.resources')} links={resourceLinks} />
        <FooterLinkList title={tShared('terms.documentation')} links={documentationLinks} />
        <FooterLinkList title={tShared('terms.community')} links={communityLinks} />
      </div>

      <div className="py-[var(--spacing-md)] text-center text-xs text-[var(--color-text-muted)]">
        {tComponent('copyright')}
      </div>
    </footer>
  )
}
