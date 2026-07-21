'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'
import { Link } from '@/i18n/navigation'
import { clisData } from '@/lib/generated/clis'
import { desktopsData } from '@/lib/generated/desktops'
import { extensionsData } from '@/lib/generated/extensions'
import { githubStarsData } from '@/lib/generated/github-stars'
import { idesData } from '@/lib/generated/ides'

type ProductType = 'ide' | 'cli' | 'desktop' | 'extension'

type OpenSourceProject = {
  id: string
  name: string
  type: ProductType
  license: string
  stars: number
  githubUrl: string | null
  websiteUrl: string | null
  verified?: boolean
}

function getLicenseDisplayName(license: string): string {
  if (license === 'Proprietary') return 'Proprietary'
  if (license === 'Unknown') return 'Unknown'
  return license
}

function getProductTypeName(type: ProductType, t: (key: string) => string): string {
  switch (type) {
    case 'ide':
      return t('categories.singular.ide')
    case 'cli':
      return t('categories.singular.cli')
    case 'extension':
      return t('categories.singular.extension')
    case 'desktop':
      return t('categories.singular.desktop')
    default:
      return type
  }
}

export function OpenSourceRankPage() {
  const tPage = useTranslations('pages.openSourceRank')
  const tShared = useTranslations('shared')
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')

  const { openSourceProjects, proprietaryProjects } = useMemo(() => {
    const openSource: OpenSourceProject[] = []
    const proprietary: OpenSourceProject[] = []

    // Process IDEs
    idesData.forEach(ide => {
      const stars = githubStarsData.ides?.[ide.id] ?? null
      const hasStars = stars !== null && stars > 0
      const isProprietary = ide.license === 'Proprietary'
      const isOpenSource = ide.license && ide.license !== 'Proprietary'

      // Only include Proprietary projects if they have stars
      if (isProprietary && !hasStars) {
        return // Skip Proprietary projects without stars
      }

      const project = {
        id: ide.id,
        name: ide.name,
        type: 'ide' as ProductType,
        license: ide.license || 'Unknown',
        stars: stars || 0,
        githubUrl: ide.githubUrl || null,
        websiteUrl: ide.websiteUrl || null,
        verified: ide.verified ?? false,
      }

      if (isProprietary && hasStars) {
        proprietary.push(project)
      } else if (isOpenSource || hasStars) {
        openSource.push(project)
      }
    })

    // Process CLIs
    clisData.forEach(cli => {
      const stars = githubStarsData.clis?.[cli.id] ?? null
      const hasStars = stars !== null && stars > 0
      const isProprietary = cli.license === 'Proprietary'
      const isOpenSource = cli.license && cli.license !== 'Proprietary'

      // Only include Proprietary projects if they have stars
      if (isProprietary && !hasStars) {
        return // Skip Proprietary projects without stars
      }

      const project = {
        id: cli.id,
        name: cli.name,
        type: 'cli' as ProductType,
        license: cli.license || 'Unknown',
        stars: stars || 0,
        githubUrl: cli.githubUrl || null,
        websiteUrl: cli.websiteUrl || null,
        verified: cli.verified ?? false,
      }

      if (isProprietary && hasStars) {
        proprietary.push(project)
      } else if (isOpenSource || hasStars) {
        openSource.push(project)
      }
    })

    desktopsData.forEach(desktop => {
      const stars = githubStarsData.desktops?.[desktop.id] ?? null
      const hasStars = stars !== null && stars > 0
      const isProprietary = desktop.license === 'Proprietary'
      if (isProprietary && !hasStars) return

      const project = {
        id: desktop.id,
        name: desktop.name,
        type: 'desktop' as ProductType,
        license: desktop.license || 'Unknown',
        stars: stars || 0,
        githubUrl: desktop.githubUrl || null,
        websiteUrl: desktop.websiteUrl || null,
        verified: desktop.verified ?? false,
      }

      if (isProprietary && hasStars) proprietary.push(project)
      else openSource.push(project)
    })

    // Process Extensions
    extensionsData.forEach(ext => {
      const stars = githubStarsData.extensions?.[ext.id] ?? null
      const hasStars = stars !== null && stars > 0
      const isProprietary = ext.license === 'Proprietary'
      const isOpenSource = ext.license && ext.license !== 'Proprietary'

      // Only include Proprietary projects if they have stars
      if (isProprietary && !hasStars) {
        return // Skip Proprietary projects without stars
      }

      const project = {
        id: ext.id,
        name: ext.name,
        type: 'extension' as ProductType,
        license: ext.license || 'Unknown',
        stars: stars || 0,
        githubUrl: ext.githubUrl || null,
        websiteUrl: ext.websiteUrl || null,
        verified: ext.verified ?? false,
      }

      if (isProprietary && hasStars) {
        proprietary.push(project)
      } else if (isOpenSource || hasStars) {
        openSource.push(project)
      }
    })

    // Merge projects with the same GitHub URL, keeping the one with shorter name
    const mergeByGitHubUrl = (projects: OpenSourceProject[]): OpenSourceProject[] => {
      const urlMap = new Map<string, OpenSourceProject>()

      projects.forEach(project => {
        if (!project.githubUrl) {
          // Keep projects without GitHub URL as-is
          urlMap.set(`no-url-${project.id}`, project)
          return
        }

        const existing = urlMap.get(project.githubUrl)
        if (!existing) {
          urlMap.set(project.githubUrl, project)
        } else {
          // Keep the one with shorter name
          if (project.name.length < existing.name.length) {
            urlMap.set(project.githubUrl, project)
          }
        }
      })

      return Array.from(urlMap.values())
    }

    // Merge first, then sort by stars (descending)
    const mergedOpenSource = mergeByGitHubUrl(openSource)
    const mergedProprietary = mergeByGitHubUrl(proprietary)

    mergedOpenSource.sort((a, b) => b.stars - a.stars)
    mergedProprietary.sort((a, b) => b.stars - a.stars)

    return {
      openSourceProjects: mergedOpenSource,
      proprietaryProjects: mergedProprietary,
    }
  }, [])

  const filteredOpenSourceProjects = useMemo(() => {
    if (selectedType === 'all') return openSourceProjects
    return openSourceProjects.filter(p => p.type === selectedType)
  }, [openSourceProjects, selectedType])

  const filteredProprietaryProjects = useMemo(() => {
    if (selectedType === 'all') return proprietaryProjects
    return proprietaryProjects.filter(p => p.type === selectedType)
  }, [proprietaryProjects, selectedType])

  const stats = useMemo(() => {
    const total = openSourceProjects.length + proprietaryProjects.length
    const openSourcePercentage =
      total > 0 ? Math.round((openSourceProjects.length / total) * 100) : 0
    const proprietaryPercentage = 100 - openSourcePercentage

    // Group by license
    const licenseGroups: Record<string, number> = {}
    openSourceProjects.forEach(project => {
      licenseGroups[project.license] = (licenseGroups[project.license] || 0) + 1
    })

    // Calculate license percentages
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
  }, [openSourceProjects, proprietaryProjects])

  return (
    <div>
      {/* Filter Section */}
      <div className="mb-[var(--spacing-md)] flex gap-[var(--spacing-xs)] flex-wrap">
        <button
          type="button"
          onClick={() => setSelectedType('desktop')}
          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
            selectedType === 'desktop'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
          }`}
        >
          {tShared('categories.plural.desktops')} (
          {openSourceProjects.filter(p => p.type === 'desktop').length +
            proprietaryProjects.filter(p => p.type === 'desktop').length}
          )
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('all')}
          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
            selectedType === 'all'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
          }`}
        >
          {tPage('filter.all')} ({openSourceProjects.length + proprietaryProjects.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('ide')}
          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
            selectedType === 'ide'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
          }`}
        >
          {tShared('categories.plural.ides')} (
          {openSourceProjects.filter(p => p.type === 'ide').length +
            proprietaryProjects.filter(p => p.type === 'ide').length}
          )
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('cli')}
          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
            selectedType === 'cli'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
          }`}
        >
          {tShared('categories.plural.clis')} (
          {openSourceProjects.filter(p => p.type === 'cli').length +
            proprietaryProjects.filter(p => p.type === 'cli').length}
          )
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('extension')}
          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-sm border transition-all ${
            selectedType === 'extension'
              ? 'border-[var(--color-border-strong)] bg-[var(--color-hover)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
          }`}
        >
          {tShared('categories.plural.extensions')} (
          {openSourceProjects.filter(p => p.type === 'extension').length +
            proprietaryProjects.filter(p => p.type === 'extension').length}
          )
        </button>
      </div>

      {/* Render table function */}
      {(() => {
        const renderTable = (projects: OpenSourceProject[], title: string) => (
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
                  {projects.map((project, index) => (
                    <tr
                      key={`${project.type}-${project.id}`}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-hover)] transition-colors"
                    >
                      <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm text-[var(--color-text-secondary)]">
                        #{index + 1}
                      </td>
                      <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)]">
                        <div className="flex items-center gap-[var(--spacing-xs)]">
                          <Link
                            href={`/${project.type === 'ide' ? 'ides' : project.type === 'cli' ? 'clis' : project.type === 'desktop' ? 'desktops' : 'extensions'}/${project.id}`}
                            className="font-medium hover:text-blue-500 transition-colors"
                          >
                            {project.name}
                          </Link>
                          {project.verified && <VerifiedBadge size="sm" />}
                        </div>
                      </td>
                      <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm">
                        <span className="inline-block px-2 py-0.5 text-xs border border-[var(--color-border)]">
                          {getProductTypeName(project.type, tShared)}
                        </span>
                      </td>
                      <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-sm text-[var(--color-text-secondary)]">
                        {getLicenseDisplayName(project.license)}
                      </td>
                      <td className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-right">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-end gap-1 hover:text-blue-500 transition-colors"
                            aria-label={`${project.name} GitHub repository - ${project.stars.toFixed(1)}k stars`}
                          >
                            <svg
                              className="w-4 h-4 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold">{project.stars.toFixed(1)}k</span>
                          </a>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <svg
                              className="w-4 h-4 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold">{project.stars.toFixed(1)}k</span>
                          </div>
                        )}
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
          <>
            {/* Open Source Projects Table */}
            {renderTable(
              filteredOpenSourceProjects,
              tPage('table.openSourceTitle', { count: filteredOpenSourceProjects.length }) ||
                `Open Source Projects (${filteredOpenSourceProjects.length})`
            )}

            {/* Proprietary Projects Table */}
            {renderTable(
              filteredProprietaryProjects,
              tPage('table.proprietaryTitle', { count: filteredProprietaryProjects.length }) ||
                `Proprietary Projects (${filteredProprietaryProjects.length})`
            )}
          </>
        )
      })()}

      {/* Note Section */}
      <div className="mt-[var(--spacing-lg)] mb-[var(--spacing-lg)] p-[var(--spacing-sm)] border border-[var(--color-border)] bg-[var(--color-hover)] text-sm text-[var(--color-text-secondary)]">
        {tPage('note')}
      </div>

      {/* Statistics Section with Pie Chart */}
      <div className="mt-[var(--spacing-lg)] border border-[var(--color-border)] p-[var(--spacing-md)]">
        <h2 className="text-xl font-semibold mb-[var(--spacing-md)]">
          {tPage('statistics.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)]">
          {/* Multi-color Pie Chart */}
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
                  '#10b981', // MIT - green
                  '#3b82f6', // Apache-2.0 - blue
                  '#8b5cf6', // GPL-3.0 - purple
                  '#f59e0b', // BSD - orange
                  '#ef4444', // AGPL - red
                  '#06b6d4', // MPL - cyan
                  '#ec4899', // Other - pink
                  '#d1d5db', // Proprietary - light gray
                ]

                let currentAngle = 0
                const radius = 80
                const centerX = 120
                const centerY = 120

                // Combine license stats with proprietary
                const allStats = [
                  ...stats.licenseStats.map((s, i) => ({
                    ...s,
                    color: colors[i % (colors.length - 1)],
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

                  // Calculate arc path
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

          {/* License Breakdown */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold mb-[var(--spacing-sm)] text-[var(--color-text-secondary)]">
              {tPage('statistics.licenseBreakdown')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
              {/* Open Source Licenses */}
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

              {/* Proprietary */}
              <div className="border border-[var(--color-border)] p-[var(--spacing-sm)] flex items-center gap-[var(--spacing-sm)]">
                <div className="w-4 h-4 flex-shrink-0 bg-gray-300" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tShared('terms.proprietary')}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {stats.proprietary} {tPage('statistics.projects')} (
                    {stats.proprietaryPercentage}
                    %)
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
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
