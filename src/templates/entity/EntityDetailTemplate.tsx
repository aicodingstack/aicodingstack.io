import type { ReactNode } from 'react'
import { BackToNavigation } from '@/components/controls/BackToNavigation'
import { Breadcrumb, type BreadcrumbItem } from '@/components/controls/Breadcrumb'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import type { AnySchema } from '@/lib/metadata/schemas'
import type { ManifestEntity } from '@/types/manifests'

export interface BreadcrumbConfig {
  home: string
  category?: string
  categoryHref?: string
}

export interface EntityDetailTemplateProps<T extends ManifestEntity> {
  // Entity data
  entity: T

  // Locale
  locale: string

  // Schema.org structured data (pre-generated)
  schema?: AnySchema

  // Breadcrumb configuration
  breadcrumbs?: BreadcrumbItem[]

  // Navigation
  backToHref?: string
  backToTitle?: string

  // Child sections to render between header and footer
  children: ReactNode
}

/**
 * EntityDetailTemplate - Base Template
 *
 * Mirrors: ManifestEntity (the base schema type)
 *
 * Provides the common layout structure for all entity detail pages:
 * - Schema.org JSON-LD injection
 * - Header and Footer
 * - Breadcrumb navigation
 * - Composable sections (children)
 *
 * This template does NOT include ProductHero - that's added by VendorEntityDetailTemplate
 * which extends this base template.
 *
 * @example Basic usage (for Model, Vendor, Provider pages)
 * ```tsx
 * <EntityDetailTemplate
 *   entity={model}
 *   locale={locale}
 *   schema={modelSchema}
 *   breadcrumbs={breadcrumbItems}
 *   backToHref="/models"
 *   backToTitle="All Models"
 * >
 *   <ProductHero {...heroProps} />
 *   <EntitySpecifications {...specsProps} />
 *   <EntityBenchmarks {...benchmarksProps} />
 * </EntityDetailTemplate>
 * ```
 */
export function EntityDetailTemplate<T extends ManifestEntity>({
  entity: _entity,
  locale: _locale,
  schema,
  breadcrumbs,
  backToHref,
  backToTitle,
  children,
}: EntityDetailTemplateProps<T>) {
  return (
    <>
      {/* Schema.org structured data */}
      {schema && <JsonLd data={schema} />}

      <Header />

      {/* Breadcrumb navigation */}
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      {/* Composable sections */}
      {children}

      {/* Back to navigation */}
      {backToHref && backToTitle && <BackToNavigation href={backToHref} title={backToTitle} />}

      <Footer />
    </>
  )
}
