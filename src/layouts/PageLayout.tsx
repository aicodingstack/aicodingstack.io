import type { ReactNode } from 'react'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import type { AnySchema } from '@/lib/metadata/schemas'

export interface PageLayoutProps {
  children: ReactNode
  schema?: AnySchema
}

/**
 * PageLayout - Universal page layout with Header and Footer
 *
 * This is the only layout component in the application.
 * All pages use this layout and compose their own content structure.
 *
 * @example Basic usage
 * ```tsx
 * <PageLayout>
 *   <Breadcrumb items={...} />
 *   <ProductHero {...props} />
 *   <BackToNavigation href="/ides" title="All IDEs" />
 * </PageLayout>
 * ```
 *
 * @example With schema
 * ```tsx
 * <PageLayout schema={softwareApplicationSchema}>
 *   {content}
 * </PageLayout>
 * ```
 */
export function PageLayout({ children, schema }: PageLayoutProps) {
  return (
    <>
      {/* Schema.org structured data (optional) */}
      {schema && <JsonLd data={schema} />}

      <Header />

      {/* Page content - composed by the page itself */}
      {children}

      <Footer />
    </>
  )
}
