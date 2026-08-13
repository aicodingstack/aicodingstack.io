import type { ManifestEntity } from '@/types/manifests'
import dataHealth from '../../data/data-health.json'
import { clisData } from './generated/clis'
import { desktopsData } from './generated/desktops'
import { extensionsData } from './generated/extensions'
import { githubStarsData } from './generated/github-stars'
import { idesData } from './generated/ides'
import { modelsData } from './generated/models'
import { providersData } from './generated/providers'

export type HomepageActivityCategory =
  | 'cli'
  | 'desktop'
  | 'extension'
  | 'ide'
  | 'model'
  | 'provider'

export interface HomepageActivity {
  category: HomepageActivityCategory
  date: string
  href: string
  id: string
  kind: 'source' | 'version'
  name: string
  sourceHost: string
  version: string | null
}

interface HomepageRecordGroup {
  category: HomepageActivityCategory
  records: ManifestEntity[]
  route: string
}

const recordGroups: HomepageRecordGroup[] = [
  { category: 'cli', records: clisData, route: '/clis' },
  { category: 'ide', records: idesData, route: '/ides' },
  { category: 'extension', records: extensionsData, route: '/extensions' },
  { category: 'desktop', records: desktopsData, route: '/desktops' },
  { category: 'model', records: modelsData, route: '/models' },
  { category: 'provider', records: providersData, route: '/model-providers' },
]

function getSourceHost(record: ManifestEntity): string {
  const sourceUrl = record.sources?.[0]?.url ?? record.websiteUrl

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '')
  } catch {
    return sourceUrl
  }
}

function getVersion(record: ManifestEntity): string | null {
  if (!('latestVersion' in record) || typeof record.latestVersion !== 'string') return null

  return record.latestVersion
}

const allHomepageActivities: HomepageActivity[] = recordGroups
  .flatMap(group =>
    group.records
      .filter(record => record.verified && !record.deprecated && record.lastVerifiedAt)
      .map(record => {
        const version = getVersion(record)

        return {
          category: group.category,
          date: record.lastVerifiedAt as string,
          href: `${group.route}/${record.id}`,
          id: `${group.category}:${record.id}`,
          kind: version ? ('version' as const) : ('source' as const),
          name: record.name,
          sourceHost: getSourceHost(record),
          version,
        }
      })
  )
  .sort(
    (first, second) =>
      second.date.localeCompare(first.date) ||
      first.category.localeCompare(second.category) ||
      first.name.localeCompare(second.name, 'en', { numeric: true, sensitivity: 'base' })
  )

const latestActivityDate = allHomepageActivities[0]?.date
const latestActivityTimestamp = latestActivityDate
  ? Date.parse(`${latestActivityDate}T00:00:00Z`)
  : Number.NaN
const activityWeekStart = latestActivityTimestamp - 6 * 24 * 60 * 60 * 1000

export const homepageActivities: HomepageActivity[] = allHomepageActivities.filter(activity => {
  if (!Number.isFinite(activityWeekStart)) return false

  return Date.parse(`${activity.date}T00:00:00Z`) >= activityWeekStart
})

const latestVerifiedDate = homepageActivities.reduce(
  (latest, activity) => (activity.date > latest ? activity.date : latest),
  ''
)

export const homepageStats = {
  lastUpdated: latestVerifiedDate,
  openSourceRepositories: Object.keys(githubStarsData.repositories).length,
  records: dataHealth.summary.totalRecords,
  sources: dataHealth.summary.recordsWithSources,
  verified: dataHealth.summary.verifiedRecords,
}
