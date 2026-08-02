'use client'

import { CircleDashed, LockKeyhole } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { DeprecatedBadge } from '@/components/controls/DeprecatedBadge'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import { Link } from '@/i18n/navigation'
import { clisData } from '@/lib/generated/clis'
import { desktopsData } from '@/lib/generated/desktops'
import { extensionsData } from '@/lib/generated/extensions'
import { githubStarsData } from '@/lib/generated/github-stars'
import { idesData } from '@/lib/generated/ides'
import { getRepositoryLicense } from '@/lib/repository-license'
import type { ManifestBaseProduct } from '@/types/manifests'

type ProductType = 'ide' | 'cli' | 'desktop' | 'extension'
type RepositoryScope = 'source' | 'partial' | 'related'

type CatalogProduct = ManifestBaseProduct & {
  id: string
  name: string
  verified?: boolean
  deprecated?: boolean
}

type RankedProduct = {
  id: string
  name: string
  catalogSurfaces: Array<{
    type: ProductType
    id: string
    repositoryScope: RepositoryScope
    product: CatalogProduct
  }>
}

type RepositoryProject = {
  repositoryId: string
  stars: number
  products: RankedProduct[]
  types: ProductType[]
  license: string
  openSource: boolean
  verified: boolean
  deprecated: boolean
}

const catalogByType: Record<ProductType, Map<string, CatalogProduct>> = {
  ide: new Map(idesData.map(product => [product.id, product as CatalogProduct])),
  cli: new Map(clisData.map(product => [product.id, product as CatalogProduct])),
  desktop: new Map(desktopsData.map(product => [product.id, product as CatalogProduct])),
  extension: new Map(extensionsData.map(product => [product.id, product as CatalogProduct])),
}

const typeOrder: ProductType[] = ['ide', 'cli', 'desktop', 'extension']

function productPath(type: ProductType, id: string): string {
  const segment =
    type === 'ide'
      ? 'ides'
      : type === 'cli'
        ? 'clis'
        : type === 'desktop'
          ? 'desktops'
          : 'extensions'
  return `/${segment}/${id}`
}

function getProductTypeName(type: ProductType, t: (key: string) => string): string {
  return t(`categories.singular.${type}`)
}

function getProductTypePluralName(type: ProductType, t: (key: string) => string): string {
  const key =
    type === 'ide'
      ? 'ides'
      : type === 'cli'
        ? 'clis'
        : type === 'desktop'
          ? 'desktops'
          : 'extensions'
  return t(`categories.plural.${key}`)
}

function getLicenseDisplayName(license: string): string {
  if (license === 'Proprietary') return 'Proprietary'
  if (license === 'Unknown') return 'Unknown'
  return license
}

function normalizeRepositoryUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/\.git$/, '')
}

function getRepositoryScope(product: CatalogProduct): RepositoryScope {
  if (product.sourceCode?.status === 'open') return 'source'
  if (product.sourceCode?.status === 'partial') return 'partial'
  if (product.sourceCode?.status === 'closed') return 'related'
  return product.license === 'Proprietary' ? 'related' : 'source'
}

function getRepositoryRole(product: CatalogProduct): 'source' | 'feedback' | 'documentation' {
  if (product.sourceCode?.repositoryRole) return product.sourceCode.repositoryRole
  return getRepositoryScope(product) === 'related' ? 'feedback' : 'source'
}

function getFamilyName(surfaces: RankedProduct['catalogSurfaces']): string {
  const suffixPattern = /(?:\s+(?:CLI|Desktop|Extension|IDE)|\s+for VS Code)$/i
  const names = surfaces
    .map(surface => surface.product.name.replace(suffixPattern, ''))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
  return names[0] ?? surfaces[0]?.product.name ?? ''
}

function buildRepositoryProjects(): RepositoryProject[] {
  return Object.entries(githubStarsData.repositories)
    .map(([repositoryId, stars]) => {
      const expectedUrl = `https://github.com/${repositoryId}`
      const matchedSurfaces = typeOrder.flatMap(type =>
        Array.from(catalogByType[type].values()).flatMap(product =>
          product.githubUrl && normalizeRepositoryUrl(product.githubUrl) === expectedUrl
            ? [
                {
                  type,
                  id: product.id,
                  repositoryScope: getRepositoryScope(product),
                  product,
                },
              ]
            : []
        )
      )

      const productGroups = new Map<string, RankedProduct['catalogSurfaces']>()
      for (const surface of matchedSurfaces) {
        const groupId = surface.product.familyId ?? repositoryId
        productGroups.set(groupId, [...(productGroups.get(groupId) ?? []), surface])
      }
      const products = Array.from(productGroups, ([id, surfaces]) => ({
        id,
        name: getFamilyName(surfaces),
        catalogSurfaces: surfaces,
      }))
      const catalogSurfaces = products.flatMap(product => product.catalogSurfaces)
      const types = typeOrder.filter(type => catalogSurfaces.some(surface => surface.type === type))
      const openSource = catalogSurfaces.some(
        surface =>
          getRepositoryRole(surface.product) === 'source' && surface.repositoryScope !== 'related'
      )
      const repositorySurface = catalogSurfaces.find(surface => surface.product.sourceCode?.license)
      const repositoryLicense = repositorySurface
        ? getRepositoryLicense(repositorySurface.product)
        : undefined
      const openSourceLicense = catalogSurfaces.find(
        surface =>
          surface.repositoryScope !== 'related' &&
          surface.product.license &&
          surface.product.license !== 'Proprietary'
      )?.product.license

      return {
        repositoryId,
        stars: stars ?? 0,
        products,
        types,
        license: openSource ? (repositoryLicense ?? openSourceLicense ?? 'Unknown') : 'Proprietary',
        openSource,
        verified: catalogSurfaces.some(surface => surface.product.verified),
        deprecated:
          catalogSurfaces.length > 0 &&
          catalogSurfaces.every(surface => surface.product.deprecated === true),
      }
    })
    .sort((a, b) => b.stars - a.stars || a.repositoryId.localeCompare(b.repositoryId))
}

export function OpenSourceRankPage() {
  const tPage = useTranslations('pages.openSourceRank')
  const tShared = useTranslations('shared')
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')

  const repositories = useMemo(() => buildRepositoryProjects(), [])
  const openSourceProjects = useMemo(
    () => repositories.filter(repository => repository.openSource),
    [repositories]
  )
  const proprietaryProjects = useMemo(
    () => repositories.filter(repository => !repository.openSource),
    [repositories]
  )

  const filterProjects = (projects: RepositoryProject[]) =>
    selectedType === 'all'
      ? projects
      : projects.filter(project => project.types.includes(selectedType))

  const filteredOpenSourceProjects = filterProjects(openSourceProjects)
  const filteredProprietaryProjects = filterProjects(proprietaryProjects)
  const filterOptions: Array<ProductType | 'all'> = ['desktop', 'all', 'ide', 'cli', 'extension']

  const getFilterCount = (type: ProductType | 'all') =>
    type === 'all'
      ? repositories.length
      : repositories.filter(project => project.types.includes(type)).length

  const stats = useMemo(() => {
    const total = repositories.length
    const openSourcePercentage =
      total > 0 ? Math.round((openSourceProjects.length / total) * 100) : 0
    const proprietaryPercentage = 100 - openSourcePercentage
    const licenseGroups: Record<string, number> = {}

    openSourceProjects.forEach(project => {
      licenseGroups[project.license] = (licenseGroups[project.license] || 0) + 1
    })

    const licenseStats = Object.entries(licenseGroups)
      .map(([license, count]) => ({
        license,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      total,
      openSource: openSourceProjects.length,
      proprietary: proprietaryProjects.length,
      openSourcePercentage,
      proprietaryPercentage,
      licenseStats,
    }
  }, [repositories, openSourceProjects, proprietaryProjects])

  const renderTable = (projects: RepositoryProject[], title: string) => (
    <div className="mb-[var(--spacing-lg)]">
      <h2 className="text-lg font-semibold mb-[var(--spacing-sm)]">{title}</h2>
      <div className="border border-[var(--color-border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-hover)]">
              <th className="text-left px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm font-semibold w-16">
                {tPage('table.rank')}
              </th>
              <th className="text-left px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm font-semibold">
                {tShared('labels.name')}
              </th>
              <th className="text-left px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm font-semibold">
                {tShared('terms.type')}
              </th>
              <th className="text-left px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm font-semibold">
                {tShared('terms.license')}
              </th>
              <th className="text-right px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm font-semibold w-32">
                {tShared('terms.stars')}
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((repository, index) => (
              <tr
                key={repository.repositoryId}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-hover)] transition-colors"
              >
                <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm text-[var(--color-text-secondary)]">
                  #{index + 1}
                </td>
                <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)]">
                  <div className="flex items-center gap-[var(--spacing-xs)]">
                    {repository.products.map(product => {
                      const primarySurface = product.catalogSurfaces[0]
                      return primarySurface ? (
                        <Link
                          key={product.id}
                          href={productPath(primarySurface.type, primarySurface.id)}
                          className="font-medium hover:text-blue-500 transition-colors"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span key={product.id} className="font-medium">
                          {product.name}
                        </span>
                      )
                    })}
                    {repository.verified && <VerifiedBadge size="sm" />}
                    {repository.deprecated && <DeprecatedBadge />}
                  </div>
                </td>
                <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm">
                  <div className="flex flex-wrap gap-[var(--spacing-xs)]">
                    {repository.products.flatMap(product =>
                      product.catalogSurfaces.map(surface => {
                        const scopeDescription = tPage(`repositoryScope.${surface.repositoryScope}`)
                        const scopeClass =
                          surface.repositoryScope === 'source'
                            ? 'border-[var(--color-border)]'
                            : surface.repositoryScope === 'partial'
                              ? 'border-dashed border-[var(--color-border-strong)]'
                              : 'border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)]'

                        return (
                          <Link
                            key={`${product.id}-${surface.type}-${surface.id}`}
                            href={productPath(surface.type, surface.id)}
                            title={scopeDescription}
                            aria-label={`${getProductTypeName(surface.type, tShared)}: ${scopeDescription}`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border hover:border-[var(--color-border-strong)] hover:text-blue-500 transition-colors ${scopeClass}`}
                          >
                            {surface.repositoryScope === 'partial' && (
                              <CircleDashed className="h-3 w-3" aria-hidden="true" />
                            )}
                            {surface.repositoryScope === 'related' && (
                              <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                            )}
                            {getProductTypeName(surface.type, tShared)}
                          </Link>
                        )
                      })
                    )}
                  </div>
                </td>
                <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm text-[var(--color-text-secondary)]">
                  {getLicenseDisplayName(repository.license)}
                </td>
                <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-right">
                  <a
                    href={`https://github.com/${repository.repositoryId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-end gap-1 hover:text-blue-500 transition-colors"
                    aria-label={`${repository.products.map(product => product.name).join(', ')} GitHub repository - ${(repository.stars / 1000).toFixed(1)}k stars`}
                  >
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{(repository.stars / 1000).toFixed(1)}k</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="text-center py-[var(--spacing-lg)] text-[var(--color-text-secondary)]">
            {tPage('noResults')}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-[var(--spacing-md)] flex flex-wrap gap-[var(--spacing-xs)]">
        {filterOptions.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
              selectedType === type
                ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
            }`}
          >
            {type === 'all' ? tPage('filter.all') : getProductTypePluralName(type, tShared)} (
            {getFilterCount(type)})
          </button>
        ))}
      </div>

      {renderTable(
        filteredOpenSourceProjects,
        tPage('table.openSourceTitle', { count: filteredOpenSourceProjects.length })
      )}
      {renderTable(
        filteredProprietaryProjects,
        tPage('table.proprietaryTitle', { count: filteredProprietaryProjects.length })
      )}

      <div className="mt-[var(--spacing-lg)] mb-[var(--spacing-lg)] p-[var(--spacing-sm)] border border-[var(--color-border)] bg-[var(--color-hover)] text-sm text-[var(--color-text-secondary)]">
        {tPage('note')}
      </div>

      <div className="mt-[var(--spacing-lg)] border border-[var(--color-border)] p-[var(--spacing-md)]">
        <h2 className="text-xl font-semibold mb-[var(--spacing-md)]">
          {tPage('statistics.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)]">
          <div className="flex flex-col items-center">
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              aria-label="License distribution chart"
              role="img"
            >
              {(() => {
                const colors = [
                  '#10b981',
                  '#3b82f6',
                  '#8b5cf6',
                  '#f59e0b',
                  '#ef4444',
                  '#06b6d4',
                  '#ec4899',
                  '#d1d5db',
                ]

                let currentAngle = 0
                const radius = 80
                const centerX = 120
                const centerY = 120
                const allStats = [
                  ...stats.licenseStats.map((stat, index) => ({
                    ...stat,
                    color: colors[index % (colors.length - 1)],
                  })),
                  {
                    license: 'Proprietary',
                    count: stats.proprietary,
                    percentage: stats.proprietaryPercentage,
                    color: colors[colors.length - 1],
                  },
                ]

                return allStats.map(stat => {
                  const startAngle = currentAngle
                  const angle = (stat.percentage / 100) * 360
                  currentAngle += angle
                  const startRad = (startAngle - 90) * (Math.PI / 180)
                  const endRad = (startAngle + angle - 90) * (Math.PI / 180)
                  const x1 = centerX + radius * Math.cos(startRad)
                  const y1 = centerY + radius * Math.sin(startRad)
                  const x2 = centerX + radius * Math.cos(endRad)
                  const y2 = centerY + radius * Math.sin(endRad)
                  const largeArcFlag = angle > 180 ? 1 : 0

                  if (stat.percentage === 0) return null

                  return (
                    <path
                      key={stat.license}
                      d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={stat.color}
                      className="transition-all duration-500"
                    />
                  )
                })
              })()}
            </svg>
            <div className="text-center mt-[var(--spacing-sm)]">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {tPage('statistics.totalProjects')}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold mb-[var(--spacing-sm)] text-[var(--color-text-secondary)]">
              {tPage('statistics.licenseBreakdown')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
              {stats.licenseStats.map((stat, index) => {
                const colors = [
                  '#10b981',
                  '#3b82f6',
                  '#8b5cf6',
                  '#f59e0b',
                  '#ef4444',
                  '#06b6d4',
                  '#ec4899',
                ]
                const color = colors[index % colors.length]

                return (
                  <div
                    key={stat.license}
                    className="border border-[var(--color-border)] p-[var(--spacing-sm)] flex items-center gap-[var(--spacing-sm)]"
                  >
                    <div className="w-4 h-4 flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{stat.license}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {stat.count} {tPage('statistics.projects')} ({stat.percentage}%)
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="border border-[var(--color-border)] p-[var(--spacing-sm)] flex items-center gap-[var(--spacing-sm)]">
                <div className="w-4 h-4 flex-shrink-0 bg-gray-300" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tShared('terms.proprietary')}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {stats.proprietary} {tPage('statistics.projects')} (
                    {stats.proprietaryPercentage}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[var(--spacing-md)] grid grid-cols-2 gap-[var(--spacing-sm)]">
              <div className="border border-[var(--color-border)] p-[var(--spacing-sm)] bg-green-500/10">
                <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                  {tPage('statistics.openSourceCount')}
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {stats.openSource} ({stats.openSourcePercentage}%)
                </div>
              </div>

              <div className="border border-[var(--color-border)] p-[var(--spacing-sm)] bg-gray-500/10">
                <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                  {tPage('statistics.closedSourceCount')}
                </div>
                <div className="text-2xl font-bold text-gray-500">
                  {stats.proprietary} ({stats.proprietaryPercentage}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
