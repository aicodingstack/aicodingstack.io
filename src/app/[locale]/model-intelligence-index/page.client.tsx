'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Symbols,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  estimateModelChartLabelWidth,
  ModelChartLabel,
  ModelChartPoint,
} from '@/components/charts/ModelChartLabel'
import { useTheme } from '@/components/ThemeProvider'
import { Link } from '@/i18n/navigation'
import type {
  ModelIntelligenceMarker,
  ModelIntelligencePoint,
  ModelIntelligenceSeries,
} from '@/lib/model-intelligence-index'
import { createTimelineTicks } from '@/lib/model-intelligence-index'

interface ModelIntelligenceIndexPageProps {
  locale: string
  meta: {
    source: string
    sourceUrl: string
    methodologyUrl: string
    indexVersion: string
    observedAt: string
  }
  points: ModelIntelligencePoint[]
  series: ModelIntelligenceSeries[]
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

type SortField = 'releaseDate' | 'index'
type SortDirection = 'asc' | 'desc'

interface ModelLabelPlacement {
  dx: number
  dy: number
  textAnchor: 'start' | 'middle' | 'end'
}

interface LabelBox {
  left: number
  right: number
  top: number
  bottom: number
}

const MIN_CHART_WIDTH = 920
const CHART_HORIZONTAL_INSET = 66
const LABEL_LAYOUT_HEIGHT = 404
const LABEL_HEIGHT = 13
const LABEL_GAP = 14

const DEFAULT_MODEL_LABEL_PLACEMENT: ModelLabelPlacement = {
  dx: 0,
  dy: -10,
  textAnchor: 'middle',
}

const MODEL_LABEL_CANDIDATES: ModelLabelPlacement[] = [
  DEFAULT_MODEL_LABEL_PLACEMENT,
  { dx: 0, dy: 18, textAnchor: 'middle' },
  { dx: 9, dy: 4, textAnchor: 'start' },
  { dx: -9, dy: 4, textAnchor: 'end' },
  { dx: 8, dy: -10, textAnchor: 'start' },
  { dx: -8, dy: -10, textAnchor: 'end' },
  { dx: 8, dy: 18, textAnchor: 'start' },
  { dx: -8, dy: 18, textAnchor: 'end' },
  ...[24, 38, 52, 66, 80, 94, 108, 122, 136, 150, 164, 178, 192].flatMap(verticalOffset =>
    [0, 18, 36, 54, 72, 108, 144].flatMap<ModelLabelPlacement>(horizontalOffset => {
      if (horizontalOffset === 0) {
        return [
          { dx: 0, dy: -verticalOffset, textAnchor: 'middle' as const },
          { dx: 0, dy: verticalOffset, textAnchor: 'middle' as const },
        ]
      }

      return [
        { dx: horizontalOffset, dy: -verticalOffset, textAnchor: 'start' as const },
        { dx: -horizontalOffset, dy: -verticalOffset, textAnchor: 'end' as const },
        { dx: horizontalOffset, dy: verticalOffset, textAnchor: 'start' as const },
        { dx: -horizontalOffset, dy: verticalOffset, textAnchor: 'end' as const },
      ]
    })
  ),
]

function getLabelBox(
  pointX: number,
  pointY: number,
  width: number,
  placement: ModelLabelPlacement
): LabelBox {
  const labelX = pointX + placement.dx
  const labelY = pointY + placement.dy
  const left =
    placement.textAnchor === 'middle'
      ? labelX - width / 2
      : placement.textAnchor === 'end'
        ? labelX - width
        : labelX

  return {
    left,
    right: left + width,
    top: labelY - 10,
    bottom: labelY + 3,
  }
}

function getOverlapArea(first: LabelBox, second: LabelBox): number {
  const overlapWidth =
    Math.min(first.right, second.right) - Math.max(first.left, second.left) + LABEL_GAP
  const overlapHeight =
    Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) + LABEL_GAP

  return overlapWidth > 0 && overlapHeight > 0 ? overlapWidth * overlapHeight : 0
}

function getOverflowArea(box: LabelBox, layoutWidth: number): number {
  const horizontalOverflow = Math.max(0, -box.left) + Math.max(0, box.right - layoutWidth)
  const verticalOverflow = Math.max(0, -box.top) + Math.max(0, box.bottom - LABEL_LAYOUT_HEIGHT)

  return horizontalOverflow * LABEL_HEIGHT + verticalOverflow * Math.max(1, box.right - box.left)
}

function createModelLabelPlacements(
  points: ModelIntelligencePoint[],
  xDomain: [number, number],
  yMax: number,
  layoutWidth: number
): Map<string, ModelLabelPlacement> {
  const [xMin, xMax] = xDomain
  const xRange = Math.max(1, xMax - xMin)
  const scoreRange = Math.max(1, yMax)
  const occupiedBoxes: LabelBox[] = points.map(point => {
    const x = ((point.timestamp - xMin) / xRange) * layoutWidth
    const y = (1 - point.score / scoreRange) * LABEL_LAYOUT_HEIGHT

    return { left: x - 5, right: x + 5, top: y - 5, bottom: y + 5 }
  })
  const placements = new Map<string, ModelLabelPlacement>()
  const orderedPoints = [...points].sort(
    (first, second) =>
      second.score - first.score ||
      first.timestamp - second.timestamp ||
      first.name.localeCompare(second.name, 'en', { numeric: true, sensitivity: 'base' })
  )

  for (const point of orderedPoints) {
    const pointX = ((point.timestamp - xMin) / xRange) * layoutWidth
    const pointY = (1 - point.score / scoreRange) * LABEL_LAYOUT_HEIGHT
    const labelWidth = estimateModelChartLabelWidth(point.name)
    let bestCandidate = DEFAULT_MODEL_LABEL_PLACEMENT
    let bestBox = getLabelBox(pointX, pointY, labelWidth, bestCandidate)
    let bestPenalty = Number.POSITIVE_INFINITY

    for (const candidate of MODEL_LABEL_CANDIDATES) {
      const box = getLabelBox(pointX, pointY, labelWidth, candidate)
      const overlapPenalty = occupiedBoxes.reduce(
        (total, occupiedBox) => total + getOverlapArea(box, occupiedBox),
        0
      )
      const distancePenalty = Math.hypot(candidate.dx, candidate.dy) * 0.02
      const penalty = overlapPenalty + getOverflowArea(box, layoutWidth) * 10 + distancePenalty

      if (penalty < bestPenalty) {
        bestCandidate = candidate
        bestBox = box
        bestPenalty = penalty
      }

      if (penalty < 1) break
    }

    placements.set(point.modelId, bestCandidate)
    occupiedBoxes.push(bestBox)
  }

  return placements
}

function formatDate(value: string | number, locale: string, includeDay = false): string {
  const date = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00Z`)

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: includeDay ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(date)
}

function SeriesMarker({ marker, color }: { marker: ModelIntelligenceMarker; color: string }) {
  return <Symbols type={marker} cx={8} cy={4} size={18} fill={color} />
}

export function ModelIntelligenceIndexPage({
  locale,
  meta,
  points,
  series,
}: ModelIntelligenceIndexPageProps) {
  const tPage = useTranslations('pages.modelIntelligenceIndex')
  const tShared = useTranslations('shared')
  const { theme } = useTheme()
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [labelLayoutWidth, setLabelLayoutWidth] = useState(MIN_CHART_WIDTH - CHART_HORIZONTAL_INSET)
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'index',
    direction: 'desc',
  })

  const maxScore = useMemo(() => Math.max(...points.map(point => point.score)), [points])
  const yMax = Math.ceil((maxScore + 4) / 5) * 5
  const { xDomain, xTicks } = useMemo(() => {
    const timestamps = points.map(point => point.timestamp)
    const domain: [number, number] = [
      Math.min(...timestamps) - 14 * DAY_IN_MS,
      Math.max(...timestamps) + 14 * DAY_IN_MS,
    ]

    return {
      xDomain: domain,
      xTicks: createTimelineTicks(domain),
    }
  }, [points])

  const selectedVendorSet = useMemo(() => new Set(selectedVendors), [selectedVendors])
  const selectedSeriesSet = useMemo(() => new Set(selectedSeries), [selectedSeries])
  const showAllVendors = selectedVendors.length === 0
  const showAllSeries = selectedSeries.length === 0
  const showAllFilters = showAllVendors && showAllSeries
  const visibleSeries = useMemo(
    () =>
      series.filter(
        item =>
          (showAllVendors || selectedVendorSet.has(item.vendor)) &&
          (showAllSeries || selectedSeriesSet.has(item.id))
      ),
    [selectedSeriesSet, selectedVendorSet, series, showAllSeries, showAllVendors]
  )
  const visibleSeriesSet = useMemo(
    () => new Set(visibleSeries.map(item => item.id)),
    [visibleSeries]
  )
  const selectedVendorSeries = useMemo(
    () => (showAllVendors ? [] : series.filter(item => selectedVendorSet.has(item.vendor))),
    [selectedVendorSet, series, showAllVendors]
  )
  const visiblePoints = useMemo(
    () => points.filter(point => visibleSeriesSet.has(`${point.vendor}:${point.series}`)),
    [points, visibleSeriesSet]
  )
  const labelPlacements = useMemo(
    () =>
      showAllFilters
        ? new Map<string, ModelLabelPlacement>()
        : createModelLabelPlacements(visiblePoints, xDomain, yMax, labelLayoutWidth),
    [visiblePoints, xDomain, yMax, labelLayoutWidth, showAllFilters]
  )

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const updateLayoutWidth = () => {
      setLabelLayoutWidth(Math.max(MIN_CHART_WIDTH, container.clientWidth) - CHART_HORIZONTAL_INSET)
    }
    const observer = new ResizeObserver(updateLayoutWidth)

    updateLayoutWidth()
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  const rankedPoints = useMemo(() => {
    const direction = sort.direction === 'asc' ? 1 : -1

    return [...visiblePoints].sort((a, b) => {
      const primaryDifference =
        sort.field === 'index' ? a.score - b.score : a.timestamp - b.timestamp

      if (primaryDifference !== 0) return primaryDifference * direction

      const secondaryDifference =
        sort.field === 'index' ? b.timestamp - a.timestamp : b.score - a.score

      return (
        secondaryDifference ||
        a.name.localeCompare(b.name, locale, { numeric: true, sensitivity: 'base' })
      )
    })
  }, [locale, sort, visiblePoints])

  const seriesByVendor = useMemo(() => {
    const grouped = new Map<string, ModelIntelligenceSeries[]>()

    for (const item of series) {
      const vendorSeries = grouped.get(item.vendor) ?? []
      vendorSeries.push(item)
      grouped.set(item.vendor, vendorSeries)
    }

    return Array.from(grouped.entries())
  }, [series])
  const smallGridRemainder = seriesByVendor.length % 2
  const smallLastRowStart =
    seriesByVendor.length - (smallGridRemainder === 0 ? 2 : smallGridRemainder)
  const largeGridRemainder = seriesByVendor.length % 4
  const largeLastRowStart =
    seriesByVendor.length - (largeGridRemainder === 0 ? 4 : largeGridRemainder)

  function toggleVendor(vendor: string) {
    const isSelected = selectedVendorSet.has(vendor)

    setSelectedVendors(current =>
      current.includes(vendor)
        ? current.filter(selectedVendor => selectedVendor !== vendor)
        : [...current, vendor]
    )

    if (isSelected) {
      setSelectedSeries(current => current.filter(seriesId => !seriesId.startsWith(`${vendor}:`)))
    }
  }

  function toggleSeries(seriesId: string) {
    setSelectedSeries(current =>
      current.includes(seriesId)
        ? current.filter(selectedSeriesId => selectedSeriesId !== seriesId)
        : [...current, seriesId]
    )
  }

  function clearVendorFilters() {
    setSelectedVendors([])
    setSelectedSeries([])
  }

  function toggleSort(field: SortField) {
    setSort(current =>
      current.field === field
        ? {
            field,
            direction: current.direction === 'desc' ? 'asc' : 'desc',
          }
        : {
            field,
            direction: 'desc',
          }
    )
  }

  function renderSortIcon(field: SortField) {
    if (sort.field !== field) {
      return <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    }

    const Icon = sort.direction === 'desc' ? ArrowDown : ArrowUp

    return <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
  }

  function getAriaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    if (sort.field !== field) return 'none'

    return sort.direction === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <section
        aria-labelledby="intelligence-timeline-title"
        className="border border-[var(--color-border)]"
      >
        <div className="flex flex-col gap-[var(--spacing-xs)] border-b border-[var(--color-border)] p-[var(--spacing-md)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="intelligence-timeline-title" className="text-xl font-semibold tracking-tight">
              {tPage('chart.title')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {tPage('chart.axisHint')}
            </p>
          </div>
          <div aria-live="polite" className="font-mono text-xs text-[var(--color-text-muted)]">
            {tPage('chart.modelCount', { count: visiblePoints.length })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            ref={chartContainerRef}
            className="w-full min-w-[920px] select-none px-[var(--spacing-sm)] pb-[var(--spacing-sm)] pt-[var(--spacing-md)]"
          >
            <ResponsiveContainer
              width="100%"
              height={480}
              minWidth={0}
              initialDimension={{ width: 920, height: 480 }}
            >
              <ScatterChart
                margin={{ top: 28, right: 24, bottom: 18, left: 0 }}
                onMouseDown={(_, event) => event.preventDefault()}
              >
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="2 5"
                  vertical={false}
                />
                <XAxis
                  type="number"
                  dataKey="timestamp"
                  domain={xDomain}
                  scale="time"
                  ticks={xTicks}
                  tickFormatter={value => formatDate(value, locale)}
                  tick={{
                    fill: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  axisLine={{ stroke: 'var(--color-border-strong)' }}
                  minTickGap={72}
                  name={tPage('releaseDate')}
                />
                <YAxis
                  type="number"
                  dataKey="score"
                  domain={[0, yMax]}
                  width={42}
                  tick={{
                    fill: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  axisLine={{ stroke: 'var(--color-border-strong)' }}
                  name={tPage('chart.indexAxis')}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border-strong)', strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as ModelIntelligencePoint | undefined

                    if (!active || !point) return null

                    return (
                      <div className="max-w-[260px] border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 shadow-lg">
                        <div className="font-semibold">{point.name}</div>
                        <div className="mt-1 font-mono text-xs text-[var(--color-text-secondary)]">
                          {point.vendor} · {point.series}
                        </div>
                        <div className="mt-3 flex items-baseline justify-between gap-6 border-t border-[var(--color-border)] pt-2">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {formatDate(point.releaseDate, locale, true)}
                          </span>
                          <span className="font-mono text-lg font-semibold">
                            {point.score}
                            {point.estimated ? '*' : ''}
                          </span>
                        </div>
                        {point.configuration !== point.name && (
                          <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                            {point.configuration}
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                {visibleSeries.map(item => (
                  <Scatter
                    key={item.id}
                    name={item.name}
                    data={item.points}
                    fill={item.color[theme]}
                    line={{
                      stroke: item.color[theme],
                      strokeWidth: 1.5,
                      strokeDasharray: item.dash ?? undefined,
                    }}
                    lineType="joint"
                    shape={<ModelChartPoint type={item.marker} />}
                    isAnimationActive={false}
                  >
                    {!showAllFilters && (
                      <LabelList
                        dataKey="name"
                        content={labelProps => {
                          const point = item.points[labelProps.index ?? 0]
                          const placement =
                            (point && labelPlacements.get(point.modelId)) ??
                            DEFAULT_MODEL_LABEL_PLACEMENT

                          if (!point) return <g />

                          return (
                            <ModelChartLabel
                              {...labelProps}
                              modelId={point.modelId}
                              placement={placement}
                            />
                          )
                        }}
                      />
                    )}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">{tPage('filter.label')}</legend>
          <div className="flex min-h-12 flex-col gap-2 border-t border-[var(--color-border)] px-[var(--spacing-sm)] py-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="mr-1 shrink-0 font-mono text-xs text-[var(--color-text-secondary)]">
                {tPage('filter.seriesLabel')}
              </span>
              {selectedVendorSeries.map(item => {
                const isSelected = selectedSeriesSet.has(item.id)

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      isSelected
                        ? 'border-[var(--color-border)] bg-[var(--color-hover)] text-[var(--color-text)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]'
                    }`}
                    style={
                      isSelected
                        ? {
                            boxShadow: `inset 2px 0 0 ${item.color[theme]}`,
                          }
                        : undefined
                    }
                    onClick={() => toggleSeries(item.id)}
                  >
                    <svg aria-hidden="true" className="h-2 w-4" viewBox="0 0 16 8">
                      <line
                        x1="0"
                        y1="4"
                        x2="16"
                        y2="4"
                        stroke={item.color[theme]}
                        strokeDasharray={item.dash ?? undefined}
                        strokeWidth="1.5"
                      />
                      <SeriesMarker marker={item.marker} color={item.color[theme]} />
                    </svg>
                    {item.name}
                  </button>
                )
              })}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
              <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                {tPage('filter.label')}
              </span>
              <button
                type="button"
                aria-pressed={showAllVendors}
                className={`border border-[var(--color-border-strong)] px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] ${
                  showAllVendors
                    ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                    : 'hover:bg-[var(--color-hover)]'
                }`}
                onClick={clearVendorFilters}
              >
                {tPage('filter.showAll')}
              </button>
            </div>
          </div>

          <div className="grid border-t border-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
            {seriesByVendor.map(([vendor, vendorSeries], vendorIndex) => {
              const isSelected = selectedVendorSet.has(vendor)
              const isLastVendor = vendorIndex === seriesByVendor.length - 1
              const isInSmallLastRow = vendorIndex >= smallLastRowStart
              const isInLargeLastRow = vendorIndex >= largeLastRowStart

              return (
                <button
                  key={vendor}
                  type="button"
                  aria-pressed={isSelected}
                  className={`min-h-28 border-b border-[var(--color-border)] p-[var(--spacing-sm)] text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] sm:border-r ${
                    isLastVendor ? 'border-b-0' : ''
                  } ${isInSmallLastRow ? 'sm:border-b-0' : ''} ${
                    isInLargeLastRow ? 'lg:border-b-0' : ''
                  } ${isSelected ? 'bg-[var(--color-hover)]' : ''}`}
                  style={
                    isSelected
                      ? {
                          boxShadow: `inset 3px 0 0 ${vendorSeries[0]?.color[theme]}`,
                        }
                      : undefined
                  }
                  onClick={() => toggleVendor(vendor)}
                >
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5"
                      style={{ backgroundColor: vendorSeries[0]?.color[theme] }}
                    />
                    {vendor}
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {vendorSeries.map(item => (
                      <span
                        key={item.id}
                        className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-text-secondary)]"
                      >
                        <svg aria-hidden="true" className="h-2 w-4" viewBox="0 0 16 8">
                          <line
                            x1="0"
                            y1="4"
                            x2="16"
                            y2="4"
                            stroke={item.color[theme]}
                            strokeDasharray={item.dash ?? undefined}
                            strokeWidth="1.5"
                          />
                          <SeriesMarker marker={item.marker} color={item.color[theme]} />
                        </svg>
                        {item.name}
                      </span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="intelligence-list-title">
        <div className="mb-[var(--spacing-sm)] flex items-end justify-between gap-4">
          <div>
            <h2 id="intelligence-list-title" className="text-xl font-semibold tracking-tight">
              {tPage('list.title')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {tPage('list.description')}
            </p>
          </div>
          <div className="hidden font-mono text-xs text-[var(--color-text-muted)] sm:block">
            0—{maxScore}
          </div>
        </div>

        <div className="overflow-x-auto border border-[var(--color-border)]">
          <table className="w-full min-w-[720px] border-collapse">
            <caption className="sr-only">{tPage('list.title')}</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left font-mono text-xs text-[var(--color-text-secondary)]">
                <th className="w-[44%] px-[var(--spacing-sm)] py-3 font-semibold">
                  {tShared('categories.singular.model')}
                </th>
                <th aria-sort={getAriaSort('releaseDate')} className="w-[18%] p-0 font-semibold">
                  <button
                    type="button"
                    className={`flex w-full items-center gap-1.5 px-[var(--spacing-sm)] py-3 text-left hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      sort.field === 'releaseDate' ? 'text-[var(--color-text)]' : ''
                    }`}
                    onClick={() => toggleSort('releaseDate')}
                  >
                    {tPage('releaseDate')}
                    {renderSortIcon('releaseDate')}
                  </button>
                </th>
                <th aria-sort={getAriaSort('index')} className="w-[38%] p-0 font-semibold">
                  <button
                    type="button"
                    className={`flex w-full items-center gap-1.5 px-[var(--spacing-sm)] py-3 text-left hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      sort.field === 'index' ? 'text-[var(--color-text)]' : ''
                    }`}
                    onClick={() => toggleSort('index')}
                  >
                    {tPage('list.index')}
                    {renderSortIcon('index')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedPoints.map(point => (
                <tr
                  key={point.modelId}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-[var(--spacing-sm)] py-3">
                    <Link
                      href={`/models/${point.modelId}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {point.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-[11px] text-[var(--color-text-muted)]">
                      {point.vendor} · {point.series}
                    </div>
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3 font-mono text-sm text-[var(--color-text-secondary)]">
                    {formatDate(point.releaseDate, locale, true)}
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold">
                        {point.score}
                        {point.estimated ? '*' : ''}
                      </span>
                      <div
                        aria-label={tPage('list.barLabel', {
                          model: point.name,
                          score: point.score,
                        })}
                        className="h-2.5 flex-1 bg-[var(--color-hover)]"
                        role="img"
                      >
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: point.color[theme],
                            width: `${(point.score / maxScore) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="border-l-2 border-[var(--color-border-strong)] pl-[var(--spacing-sm)] text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <p>
          {tPage('source.attribution', {
            version: meta.indexVersion,
            date: formatDate(meta.observedAt, locale, true),
          })}{' '}
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[var(--color-text)]"
          >
            {meta.source}
          </a>
          .
        </p>
        <p className="mt-1">
          {tPage('source.estimated')}{' '}
          <a
            href={meta.methodologyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[var(--color-text)]"
          >
            {tPage('source.methodology')}
          </a>
          .
        </p>
      </aside>
    </div>
  )
}
