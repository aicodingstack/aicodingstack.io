'use client'

import { useEffect, useRef } from 'react'
import { JsonLd } from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'
import { SITE_CONFIG } from '@/lib/metadata/config'

export interface BreadcrumbItem {
  name: string
  href: string
}

/**
 * Renders a breadcrumb navigation bar and injects a Schema.org BreadcrumbList via JsonLd.
 * - Visual trail is rendered from provided items; the last item is shown as plain text.
 * - Structured data includes "Home" at the first position for better SEO.
 * - Sticky behavior is enabled when scrolling using CSS position: sticky.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const sectionRef = useRef<HTMLElement>(null)

  // Dynamically adjust sticky position based on header height
  useEffect(() => {
    const updateStickyPosition = () => {
      const header = document.querySelector('header')
      if (header && sectionRef.current) {
        const headerHeight = header.offsetHeight
        sectionRef.current.style.top = `${headerHeight}px`
      }
    }

    updateStickyPosition()
    window.addEventListener('resize', updateStickyPosition)
    return () => window.removeEventListener('resize', updateStickyPosition)
  }, [])

  // Normalize href to ensure it starts with '/' (unless it's already an absolute URL)
  const normalizeHref = (href: string): string => {
    // If it's already an absolute URL or starts with '/', return as is
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
      return href
    }
    // Otherwise, add leading '/'
    return `/${href}`
  }

  const schemaItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_CONFIG.url,
    },
    ...items.map((item, index) => {
      const normalizedHref = normalizeHref(item.href)
      return {
        '@type': 'ListItem',
        position: 2 + index,
        name: item.name,
        item: `${SITE_CONFIG.url}${normalizedHref}`,
      }
    }),
  ]

  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  } as const

  return (
    <>
      <JsonLd data={breadcrumbListSchema} />
      <section
        ref={sectionRef}
        className="sticky z-40 py-[var(--spacing-sm)] bg-[var(--color-hover)] border-b border-[var(--color-border)] shadow-sm"
        data-breadcrumb
      >
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <nav className="flex items-center gap-[var(--spacing-xs)] text-sm pl-[var(--spacing-xs)]">
            {items.map((item, index) => {
              const isLast = index === items.length - 1
              const normalizedHref = normalizeHref(item.href)
              return (
                <span
                  key={`${item.href}-${index}`}
                  className="inline-flex items-center gap-[var(--spacing-xs)]"
                >
                  {isLast ? (
                    <span className="text-[var(--color-text)] font-medium">{item.name}</span>
                  ) : (
                    <Link
                      href={normalizedHref}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                  {!isLast && <span className="text-[var(--color-text-muted)]">/</span>}
                </span>
              )
            })}
          </nav>
        </div>
      </section>
    </>
  )
}
