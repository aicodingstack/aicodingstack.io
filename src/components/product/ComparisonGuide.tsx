'use client'

import { Link } from '@/i18n/navigation'

export type ComparisonGuideItem = {
  title: string
  description: string
}

export type ComparisonProfileItem = ComparisonGuideItem & {
  href: string
}

export type ComparisonGuideContent = {
  title: string
  intro: string
  criteria: ComparisonGuideItem[]
  shortlistTitle: string
  shortlistIntro: string
  steps: ComparisonGuideItem[]
  profilesTitle: string
  profilesIntro: string
  profiles: ComparisonProfileItem[]
  faqTitle: string
  faqs: ComparisonGuideItem[]
}

type Props = {
  content: ComparisonGuideContent
}

export default function ComparisonGuide({ content }: Props) {
  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] mb-[var(--spacing-sm)]">
              {content.title}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              {content.intro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 border-t border-l border-[var(--color-border)] mt-[var(--spacing-lg)]">
            {content.criteria.map(item => (
              <article
                key={item.title}
                className="p-[var(--spacing-md)] border-r border-b border-[var(--color-border)]"
              >
                <h3 className="text-base font-semibold mb-[var(--spacing-xs)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-[var(--spacing-md)] py-[var(--spacing-xl)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] mb-[var(--spacing-sm)]">
              {content.shortlistTitle}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              {content.shortlistIntro}
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-0 border-t border-l border-[var(--color-border)] mt-[var(--spacing-lg)]">
            {content.steps.map((step, index) => (
              <li
                key={step.title}
                className="p-[var(--spacing-md)] border-r border-b border-[var(--color-border)]"
              >
                <span className="block text-xs font-semibold tracking-wider text-[var(--color-text-muted)] mb-[var(--spacing-sm)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-semibold mb-[var(--spacing-xs)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-[var(--spacing-xl)]">
            <h3 className="text-lg font-semibold mb-[var(--spacing-sm)]">
              {content.profilesTitle}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-3xl mb-[var(--spacing-md)]">
              {content.profilesIntro}
            </p>
            <div className="grid sm:grid-cols-2 border-t border-l border-[var(--color-border)]">
              {content.profiles.map(profile => (
                <Link
                  key={profile.href}
                  href={profile.href}
                  className="group p-[var(--spacing-md)] border-r border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                >
                  <span className="block text-sm font-semibold group-hover:underline">
                    {profile.title}
                  </span>
                  <span className="block text-sm leading-relaxed text-[var(--color-text-secondary)] mt-[var(--spacing-xs)]">
                    {profile.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-xl)] pb-[var(--spacing-md)]">
          <h2 className="text-2xl font-semibold tracking-[-0.025em] mb-[var(--spacing-lg)]">
            {content.faqTitle}
          </h2>
          <div className="border-t border-[var(--color-border)]">
            {content.faqs.map(faq => (
              <article
                key={faq.title}
                className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[var(--spacing-md)] py-[var(--spacing-md)] border-b border-[var(--color-border)]"
              >
                <h3 className="text-base font-semibold">{faq.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {faq.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
