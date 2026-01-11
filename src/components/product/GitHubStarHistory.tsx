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
  const tComponent = useTranslations('components.product.githubStarHistory')
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

        // Use Star History API
        const response = await fetch(
          `https://api.star-history.com/svg?repos=${repoFullName}&type=Date`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch star history')
        }

        // Star History API returns SVG, but we can use their JSON endpoint
        // Alternative: use GitHub API directly
        const jsonResponse = await fetch(`https://api.star-history.com/json?repos=${repoFullName}`)

        if (!jsonResponse.ok) {
          // Fallback: generate mock data based on current stars
          // This is a temporary solution until we implement proper data fetching
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

        // Generate fallback data for demonstration
        const currentDate = new Date()
        const fallbackData: StarDataPoint[] = []
        for (let i = 12; i >= 0; i--) {
          const date = new Date(currentDate)
          date.setMonth(date.getMonth() - i)
          fallbackData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            stars: Math.floor(Math.random() * 50000) + 10000, // Mock data
          })
        }
        setData(fallbackData)
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
                {tComponent('loading')}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error && data.length === 0) {
    return null // Don't show anything if there's an error and no fallback data
  }

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <div className="border border-[var(--color-border)] p-[var(--spacing-md)]">
          {/* Header */}
          <div className="mb-[var(--spacing-md)]">
            <h2 className="text-lg font-semibold tracking-tight mb-[var(--spacing-xs)]">
              {tComponent('title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] font-light">
              {tComponent('description')}
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
                  formatter={(value: number | undefined) => [
                    `${value?.toLocaleString() ?? '0'} ${tComponent('stars')}`,
                    tComponent('stars'),
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

          {/* Footer Note */}
          {error && (
            <div className="mt-[var(--spacing-sm)] pt-[var(--spacing-sm)] border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] font-light">
                {tComponent('fallbackNote')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
