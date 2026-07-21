'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface GitHubStarHistoryProps {
  githubUrl: string
}

interface StarDataPoint {
  date: string
  stars: number
}

interface StarHistoryApiResponse {
  data: {
    [repoName: string]: Array<{
      date: string
      count: number
    }>
  }
}

export function GitHubStarHistory({ githubUrl }: GitHubStarHistoryProps) {
  const tComponent = useTranslations('components.product')
  const [data, setData] = useState<StarDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStarHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        // Extract owner/repo from GitHub URL
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
        if (!match) {
          throw new Error('Invalid GitHub URL')
        }
        const [, owner, repo] = match
        const repoFullName = `${owner}/${repo}`

        const jsonResponse = await fetch(`https://api.star-history.com/json?repos=${repoFullName}`)

        if (!jsonResponse.ok) {
          throw new Error('Star history API unavailable')
        }

        const jsonData = (await jsonResponse.json()) as StarHistoryApiResponse

        // Transform the data for Recharts
        const transformedData: StarDataPoint[] =
          jsonData.data[repoFullName]?.map(point => ({
            date: new Date(point.date).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
            stars: point.count,
          })) || []

        setData(transformedData)
      } catch (err) {
        console.error('Error fetching star history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load star history')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchStarHistory()
  }, [githubUrl])

  if (loading) {
    return (
      <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
        <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
          <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-[var(--color-text-muted)] animate-pulse">
                {tComponent('githubStarHistory.loading')}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error || data.length === 0) return null

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
          {/* Header */}
          <div className="mb-[var(--spacing-md)]">
            <h2 className="text-lg font-semibold tracking-tight mb-[var(--spacing-xs)]">
              {tComponent('githubStarHistory.title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] font-light">
              {tComponent('githubStarHistory.description')}
            </p>
          </div>
          {/* Chart */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-muted)"
                  style={{
                    fontSize: '0.75rem',
                    fill: 'var(--color-text-muted)',
                  }}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  style={{
                    fontSize: '0.75rem',
                    fill: 'var(--color-text-muted)',
                  }}
                  tick={{ fill: 'var(--color-text-muted)' }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  tickFormatter={value => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}k`
                    }
                    return value.toString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 0,
                    fontSize: '0.875rem',
                  }}
                  labelStyle={{
                    color: 'var(--color-text)',
                    fontWeight: 500,
                  }}
                  itemStyle={{
                    color: 'var(--color-text-secondary)',
                  }}
                  formatter={value => [
                    `${value?.toLocaleString() ?? '0'} ${tComponent('githubStarHistory.stars')}`,
                    tComponent('githubStarHistory.stars'),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="stars"
                  stroke="var(--color-text)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: 'var(--color-text)',
                    strokeWidth: 2,
                    fill: 'var(--color-bg)',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
