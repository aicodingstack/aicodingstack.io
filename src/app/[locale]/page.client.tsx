'use client'

import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  ExternalLink,
  Monitor,
  Puzzle,
  Server,
  Terminal,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ModelChartLabel, ModelChartPoint } from '@/components/charts/ModelChartLabel'
import { useTheme } from '@/components/ThemeProvider'
import { Link } from '@/i18n/navigation'
import type { HomepageActivity } from '@/lib/homepage-data'

interface HomepageSeriesPoint {
  name: string
  score: number
  timestamp: number
}

interface HomepageSeries {
  color: { dark: string; light: string }
  id: string
  name: string
  points: HomepageSeriesPoint[]
}

interface HomepagePricePoint {
  color: { dark: string; light: string }
  labelAnchor: 'start' | 'middle' | 'end'
  labelDx: number
  labelDy: number
  modelId: string
  name: string
  price: number
  score: number
  vendor: string
}

interface HomepageDataStageProps {
  activities: HomepageActivity[]
  intelligenceAxisHint: string
  intelligenceSeries: HomepageSeries[]
  intelligenceTitle: string
  locale: string
  observedAt: string
  priceAxisHint: string
  priceBlendedLabel: string
  priceIndexLabel: string
  pricePoints: HomepagePricePoint[]
  priceTitle: string
  stats: {
    lastUpdated: string
    records: number
    sources: number
    verified: number
  }
}

const CAROUSEL_INTERVAL = 8000
const ACTIVITY_ICONS = {
  cli: Terminal,
  desktop: Monitor,
  extension: Puzzle,
  ide: Code2,
  model: Cpu,
  provider: Server,
} satisfies Record<HomepageActivity['category'], typeof Terminal>

function formatDate(value: string | number, locale: string): string {
  const date = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00Z`)

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

function formatShortDate(value: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
    year: '2-digit',
  }).format(new Date(value))
}

function formatActivityDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

function formatPriceValue(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function HomepageDataStage({
  activities,
  intelligenceAxisHint,
  intelligenceSeries,
  intelligenceTitle,
  locale,
  observedAt,
  priceAxisHint,
  priceBlendedLabel,
  priceIndexLabel,
  pricePoints,
  priceTitle,
  stats,
}: HomepageDataStageProps) {
  const tPage = useTranslations('pages.home')
  const { theme } = useTheme()
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredPricePoint, setHoveredPricePoint] = useState<HomepagePricePoint | null>(null)
  const [hoveredPriceVendor, setHoveredPriceVendor] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % 2)
    }, CAROUSEL_INTERVAL)

    return () => window.clearInterval(timer)
  }, [isPaused, prefersReducedMotion])

  const timelineData = useMemo(() => {
    const pointsByTimestamp = new Map<number, Record<string, number | string>>()

    for (const series of intelligenceSeries) {
      for (const point of series.points) {
        const existing = pointsByTimestamp.get(point.timestamp) ?? {}
        existing[series.id] = point.score
        existing[`${series.id}:model`] = point.name
        pointsByTimestamp.set(point.timestamp, existing)
      }
    }

    return Array.from(pointsByTimestamp, ([timestamp, scores]) => ({ timestamp, ...scores })).sort(
      (first, second) => first.timestamp - second.timestamp
    )
  }, [intelligenceSeries])

  const pricePointsByVendor = useMemo(() => {
    const groups = new Map<string, HomepagePricePoint[]>()

    for (const point of pricePoints) {
      const vendorPoints = groups.get(point.vendor) ?? []
      vendorPoints.push(point)
      groups.set(point.vendor, vendorPoints)
    }

    return Array.from(groups.entries())
  }, [pricePoints])

  const chartTextColor = theme === 'dark' ? '#b8b8b8' : '#4a4a4a'
  const chartGridColor = theme === 'dark' ? '#3a3a3a' : '#e3e3e3'
  const slides = [
    {
      href: '/model-intelligence-index' as const,
      title: intelligenceTitle,
    },
    {
      href: '/model-price-intelligence-index' as const,
      title: priceTitle,
    },
  ]

  const showPrevious = () => {
    setActiveIndex(current => (current + 1) % 2)
    setIsPaused(true)
  }
  const showNext = () => {
    setActiveIndex(current => (current + 1) % 2)
    setIsPaused(true)
  }

  return (
    <section aria-label={tPage('dataStage.label')}>
      <div className="grid grid-cols-1 gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-[var(--spacing-md)]">
        <section
          className="min-w-0 border border-[var(--color-border)]"
          aria-label={tPage('dataStage.carouselLabel')}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="flex flex-col gap-[var(--spacing-sm)] border-b border-[var(--color-border)] px-[var(--spacing-sm)] py-[var(--spacing-sm)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-[var(--spacing-md)] overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.href}
                  type="button"
                  className={`shrink-0 border-b-2 pb-1 text-left text-sm transition-colors ${
                    activeIndex === index
                      ? 'border-[var(--color-text)] font-semibold text-[var(--color-text)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                  onClick={() => {
                    setActiveIndex(index)
                    setIsPaused(true)
                  }}
                  aria-pressed={activeIndex === index}
                >
                  {slide.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-[var(--spacing-xs)]">
              <span className="mr-1 text-xs text-[var(--color-text-muted)]" aria-live="polite">
                {tPage('dataStage.counter', { current: activeIndex + 1, total: slides.length })}
              </span>
              <button
                type="button"
                onClick={showPrevious}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label={tPage('dataStage.previous')}
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label={tPage('dataStage.next')}
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-[var(--spacing-sm)] pt-[var(--spacing-sm)]">
            <div className="flex items-start justify-between gap-[var(--spacing-sm)]">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {slides[activeIndex]?.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {activeIndex === 0 ? intelligenceAxisHint : priceAxisHint}
                </p>
              </div>
              <Link
                href={slides[activeIndex]?.href ?? '/model-intelligence-index'}
                className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                {tPage('dataStage.viewIndex')}
                <ExternalLink aria-hidden="true" className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="h-[23rem] min-w-0 p-[var(--spacing-sm)] sm:h-[27rem]" aria-live="polite">
            {activeIndex === 0 ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{ top: 16, right: 16, bottom: 6, left: -12 }}
                    >
                      <CartesianGrid
                        stroke={chartGridColor}
                        strokeDasharray="2 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="timestamp"
                        domain={['dataMin', 'dataMax']}
                        scale="time"
                        tick={{ fill: chartTextColor, fontSize: 10 }}
                        tickFormatter={value => formatShortDate(Number(value), locale)}
                        type="number"
                      />
                      <YAxis
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tick={{ fill: chartTextColor, fontSize: 10 }}
                        width={42}
                      />
                      <Tooltip
                        content={({ active, label, payload }) => {
                          const entries = payload?.filter(entry => typeof entry.value === 'number')

                          if (!active || !entries?.length) return null

                          return (
                            <div className="min-w-52 border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 text-xs shadow-lg">
                              <div className="text-[10px] text-[var(--color-text-muted)]">
                                {formatDate(Number(label), locale)}
                              </div>
                              <ul className="mt-2 space-y-2 border-t border-[var(--color-border)] pt-2">
                                {entries.map(entry => {
                                  const dataKey = String(entry.dataKey)
                                  const row = entry.payload as Record<string, number | string>
                                  const modelName = row[`${dataKey}:model`]

                                  return (
                                    <li key={dataKey}>
                                      <div className="font-semibold text-[var(--color-text)]">
                                        {typeof modelName === 'string' ? modelName : entry.name}
                                      </div>
                                      <div className="mt-0.5 flex items-center justify-between gap-4 text-[10px] text-[var(--color-text-secondary)]">
                                        <span>{entry.name}</span>
                                        <span className="font-mono">
                                          {priceIndexLabel} {entry.value}
                                        </span>
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )
                        }}
                      />
                      {intelligenceSeries.map(series => (
                        <Line
                          key={series.id}
                          connectNulls
                          dataKey={series.id}
                          dot={{ r: 2 }}
                          isAnimationActive={!prefersReducedMotion}
                          name={series.name}
                          stroke={theme === 'dark' ? series.color.dark : series.color.light}
                          strokeWidth={1.5}
                          type="linear"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-border)] pt-2 text-[10px] leading-tight text-[var(--color-text-secondary)]">
                  {intelligenceSeries.map(series => (
                    <li key={series.id} className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-0.5 w-4 shrink-0"
                        style={{
                          backgroundColor:
                            theme === 'dark' ? series.color.dark : series.color.light,
                        }}
                      />
                      <span>{series.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              // biome-ignore lint/a11y/noStaticElementInteractions: Mouse leave only clears transient chart labels.
              <div
                className="homepage-price-chart flex h-full min-w-0 flex-col gap-2"
                onMouseLeave={() => {
                  setHoveredPricePoint(null)
                  setHoveredPriceVendor(null)
                }}
              >
                <div className="relative min-h-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 16, right: 16, bottom: 20, left: -8 }}>
                      <CartesianGrid stroke={chartGridColor} strokeDasharray="2 4" />
                      <XAxis
                        dataKey="price"
                        domain={['auto', 'auto']}
                        name={priceBlendedLabel}
                        scale="log"
                        tick={{ fill: chartTextColor, fontSize: 10 }}
                        tickFormatter={value => formatPriceValue(Number(value), locale)}
                        type="number"
                        unit=" USD"
                      />
                      <YAxis
                        dataKey="score"
                        domain={['dataMin - 5', 'dataMax + 5']}
                        name={priceIndexLabel}
                        tick={{ fill: chartTextColor, fontSize: 10 }}
                        type="number"
                        width={42}
                      />
                      {pricePointsByVendor.map(([vendor, vendorPoints]) => (
                        <Scatter
                          key={`${vendor}:${hoveredPriceVendor === vendor ? 'active' : 'inactive'}`}
                          data={vendorPoints}
                          fill={
                            theme === 'dark'
                              ? vendorPoints[0]?.color.dark
                              : vendorPoints[0]?.color.light
                          }
                          isAnimationActive={!prefersReducedMotion}
                          name={vendor}
                          shape={shapeProps => {
                            const point = shapeProps.payload as HomepagePricePoint
                            const showPoint = () => {
                              setHoveredPricePoint(point)
                              setHoveredPriceVendor(vendor)
                            }

                            return (
                              // biome-ignore lint/a11y/useSemanticElements: SVG chart points cannot render HTML buttons.
                              <g
                                role="button"
                                tabIndex={0}
                                aria-label={vendor}
                                onClick={showPoint}
                                onFocus={showPoint}
                                onKeyDown={event => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    showPoint()
                                  }
                                }}
                                onMouseEnter={showPoint}
                              >
                                <ModelChartPoint {...shapeProps} type="circle" />
                              </g>
                            )
                          }}
                        >
                          <LabelList
                            dataKey="name"
                            content={labelProps => {
                              if (hoveredPriceVendor !== vendor) return <g />

                              const point = vendorPoints[labelProps.index ?? 0]
                              if (!point) return <g />

                              return (
                                <ModelChartLabel
                                  {...labelProps}
                                  modelId={point.modelId}
                                  placement={{
                                    dx: point.labelDx,
                                    dy: point.labelDy,
                                    textAnchor: point.labelAnchor,
                                  }}
                                />
                              )
                            }}
                          />
                        </Scatter>
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                  {hoveredPricePoint ? (
                    <div
                      className="pointer-events-none absolute right-2 top-2 z-10 min-w-48 max-w-[calc(100%-1rem)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 text-xs shadow-lg"
                      role="status"
                    >
                      <div className="font-semibold text-[var(--color-text)]">
                        {hoveredPricePoint.name}
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                        {hoveredPricePoint.vendor}
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[var(--color-border)] pt-2">
                        <dt className="text-[var(--color-text-secondary)]">{priceBlendedLabel}</dt>
                        <dd className="text-right font-mono text-[var(--color-text)]">
                          {formatPriceValue(hoveredPricePoint.price, locale)} USD
                        </dd>
                        <dt className="text-[var(--color-text-secondary)]">{priceIndexLabel}</dt>
                        <dd className="text-right font-mono text-[var(--color-text)]">
                          {hoveredPricePoint.score}
                        </dd>
                      </dl>
                    </div>
                  ) : null}
                </div>
                <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] pt-2 text-[10px] leading-tight text-[var(--color-text-secondary)]">
                  {pricePointsByVendor.map(([vendor, vendorPoints]) => (
                    <li key={vendor} className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0"
                        style={{
                          backgroundColor:
                            theme === 'dark'
                              ? vendorPoints[0]?.color.dark
                              : vendorPoints[0]?.color.light,
                        }}
                      />
                      <span>{vendor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-[var(--spacing-sm)] border-t border-[var(--color-border)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-xs text-[var(--color-text-muted)]">
            <span>{tPage('dataStage.observed', { date: formatDate(observedAt, locale) })}</span>
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1].map(index => (
                <span
                  key={index}
                  className={`h-0.5 transition-all ${
                    index === activeIndex
                      ? 'w-5 bg-[var(--color-text)]'
                      : 'w-2 bg-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="homepage-activity min-w-0 lg:border-l lg:border-[var(--color-border)] lg:pl-[var(--spacing-md)]">
          <div className="flex items-center justify-between gap-[var(--spacing-sm)] border-b border-[var(--color-border)] pb-[var(--spacing-sm)]">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                {tPage('activity.eyebrow')}
              </p>
              <h2 className="mt-1 text-base font-semibold">{tPage('activity.title')}</h2>
            </div>
            <span className="h-2 w-2 bg-green-600" aria-hidden="true" />
          </div>

          <div className="homepage-activity-list h-[25.5rem] overflow-y-scroll pr-2 sm:h-[29.5rem]">
            {activities.map(activity => {
              const ActivityIcon = ACTIVITY_ICONS[activity.category]

              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="grid h-[4.5rem] grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-[var(--spacing-xs)] border-b border-[var(--color-border)] px-1 text-xs hover:bg-[var(--color-hover)] transition-colors"
                >
                  <time
                    dateTime={activity.date}
                    className="whitespace-nowrap text-[var(--color-text-muted)]"
                  >
                    {formatActivityDate(activity.date, locale)}
                  </time>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <ActivityIcon
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 text-[var(--color-text-muted)]"
                        strokeWidth={1.5}
                      />
                      <span className="truncate font-medium">{activity.name}</span>
                    </span>
                    <span className="mt-1 block truncate text-[var(--color-text-muted)]">
                      {activity.kind === 'version' && activity.version
                        ? tPage('activity.versionVerified', { version: activity.version })
                        : tPage('activity.sourceVerified')}
                      {' · '}
                      {activity.sourceHost}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>

          <p className="border-t border-[var(--color-border)] pt-[var(--spacing-sm)] text-center text-xs text-[var(--color-text-muted)]">
            {tPage('activity.footer')}
          </p>
        </aside>
      </div>

      <dl className="mt-[var(--spacing-md)] grid grid-cols-2 border-y border-[var(--color-border)] lg:grid-cols-4">
        {(
          [
            ['records', stats.records],
            ['verified', stats.verified],
            ['sources', stats.sources],
            ['lastUpdated', formatDate(stats.lastUpdated, locale)],
          ] as const
        ).map(([key, value]) => (
          <div
            key={key}
            className="px-[var(--spacing-sm)] py-[var(--spacing-sm)] odd:border-r odd:border-[var(--color-border)] lg:border-r lg:last:border-r-0"
          >
            <dt className="text-xs text-[var(--color-text-muted)]">{tPage(`proof.${key}`)}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
