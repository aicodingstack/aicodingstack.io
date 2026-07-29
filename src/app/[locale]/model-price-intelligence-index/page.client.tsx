'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  LabelList,
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
import type { ModelPriceIntelligencePoint } from '@/lib/model-price-intelligence-index'

interface ModelPriceIntelligenceIndexPageProps {
  locale: string
  meta: {
    minPrice: number
    maxPrice: number
    maxScore: number
    inputShare: number
    outputShare: number
    source: string
    sourceUrl: string
    methodologyUrl: string
    indexVersion: string
    observedAt: string
    fallbackPricingSources: Array<{
      modelId: string
      name: string
      sourceUrl: string
    }>
  }
  points: ModelPriceIntelligencePoint[]
}

type SortField = 'input' | 'output' | 'price' | 'index'
type SortDirection = 'asc' | 'desc'
type PriceScale = 'log' | 'linear'

function formatPrice(value: number, locale: string, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(value < 1 ? 2 : 0, maximumFractionDigits),
    maximumFractionDigits,
  }).format(value)
}

function formatPriceValue(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export function ModelPriceIntelligenceIndexPage({
  locale,
  meta,
  points,
}: ModelPriceIntelligenceIndexPageProps) {
  const tPage = useTranslations('pages.modelPriceIntelligenceIndex')
  const tShared = useTranslations('shared')
  const { theme } = useTheme()
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [priceScale, setPriceScale] = useState<PriceScale>('linear')
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'index',
    direction: 'desc',
  })

  const pointsByVendor = useMemo(() => {
    const grouped = new Map<string, ModelPriceIntelligencePoint[]>()

    for (const point of points) {
      const vendorPoints = grouped.get(point.vendor) ?? []
      vendorPoints.push(point)
      grouped.set(point.vendor, vendorPoints)
    }

    return Array.from(grouped.entries())
  }, [points])
  const smallGridRemainder = pointsByVendor.length % 2
  const smallLastRowStart =
    pointsByVendor.length - (smallGridRemainder === 0 ? 2 : smallGridRemainder)
  const largeGridRemainder = pointsByVendor.length % 4
  const largeLastRowStart =
    pointsByVendor.length - (largeGridRemainder === 0 ? 4 : largeGridRemainder)

  const selectedVendorSet = useMemo(() => new Set(selectedVendors), [selectedVendors])
  const showAllVendors = selectedVendors.length === 0
  const visiblePoints = useMemo(
    () => (showAllVendors ? points : points.filter(point => selectedVendorSet.has(point.vendor))),
    [points, selectedVendorSet, showAllVendors]
  )
  const visiblePointsByVendor = useMemo(
    () =>
      showAllVendors
        ? pointsByVendor
        : pointsByVendor.filter(([vendor]) => selectedVendorSet.has(vendor)),
    [pointsByVendor, selectedVendorSet, showAllVendors]
  )
  const rankedPoints = useMemo(() => {
    const direction = sort.direction === 'asc' ? 1 : -1

    return [...visiblePoints].sort((first, second) => {
      const primaryDifference = (() => {
        switch (sort.field) {
          case 'input':
            return first.inputPrice - second.inputPrice
          case 'output':
            return first.outputPrice - second.outputPrice
          case 'price':
            return first.blendedPrice - second.blendedPrice
          case 'index':
            return first.score - second.score
        }
      })()

      return (
        primaryDifference * direction ||
        second.score - first.score ||
        first.name.localeCompare(second.name, locale, {
          numeric: true,
          sensitivity: 'base',
        })
      )
    })
  }, [locale, sort, visiblePoints])

  const logarithmicDomain: [number, number] = [
    Math.max(0.1, meta.minPrice * 0.7),
    Math.ceil(meta.maxPrice * 1.35),
  ]
  const linearDomainMax = Math.ceil(meta.maxPrice / 2) * 2
  const xDomain: [number, number] = priceScale === 'log' ? logarithmicDomain : [0, linearDomainMax]
  const xTicks =
    priceScale === 'log'
      ? [0.1, 0.2, 0.5, 1, 2, 5, 10, 20].filter(tick => tick >= xDomain[0] && tick <= xDomain[1])
      : Array.from({ length: linearDomainMax / 2 + 1 }, (_, index) => index * 2)
  const yMax = Math.ceil((meta.maxScore + 4) / 5) * 5

  function toggleVendor(vendor: string) {
    setSelectedVendors(current =>
      current.includes(vendor)
        ? current.filter(selectedVendor => selectedVendor !== vendor)
        : [...current, vendor]
    )
  }

  function toggleSort(field: SortField) {
    setSort(current =>
      current.field === field
        ? { field, direction: current.direction === 'desc' ? 'asc' : 'desc' }
        : { field, direction: field === 'index' ? 'desc' : 'asc' }
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
        aria-labelledby="price-intelligence-chart-title"
        className="border border-[var(--color-border)]"
      >
        <div className="flex flex-col gap-[var(--spacing-xs)] border-b border-[var(--color-border)] p-[var(--spacing-md)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="price-intelligence-chart-title"
              className="text-xl font-semibold tracking-tight"
            >
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
          <div className="w-full min-w-[920px] select-none px-[var(--spacing-sm)] pb-[var(--spacing-sm)] pt-[var(--spacing-md)]">
            <ResponsiveContainer
              width="100%"
              height={500}
              minWidth={0}
              initialDimension={{ width: 920, height: 500 }}
            >
              <ScatterChart
                margin={{ top: 32, right: 76, bottom: 22, left: 0 }}
                onMouseDown={(_, event) => event.preventDefault()}
              >
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 5" />
                <XAxis
                  type="number"
                  dataKey="blendedPrice"
                  domain={xDomain}
                  scale={priceScale}
                  ticks={xTicks}
                  allowDataOverflow
                  tickFormatter={value => formatPrice(Number(value), locale, 1)}
                  tick={{
                    fill: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                  tickLine={{ stroke: 'var(--color-border)' }}
                  axisLine={{ stroke: 'var(--color-border-strong)' }}
                  name={tPage('chart.priceAxis')}
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
                    const point = payload?.[0]?.payload as ModelPriceIntelligencePoint | undefined

                    if (!active || !point) return null

                    return (
                      <div className="min-w-[250px] border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 shadow-lg">
                        <div className="font-semibold">{point.name}</div>
                        <div className="mt-1 font-mono text-xs text-[var(--color-text-secondary)]">
                          {point.vendor}
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1 border-t border-[var(--color-border)] pt-2 text-xs">
                          <dt className="text-[var(--color-text-secondary)]">
                            {tShared('labels.input')}
                          </dt>
                          <dd className="text-right font-mono">
                            {formatPrice(point.inputPrice, locale)}
                          </dd>
                          <dt className="text-[var(--color-text-secondary)]">
                            {tShared('labels.output')}
                          </dt>
                          <dd className="text-right font-mono">
                            {formatPrice(point.outputPrice, locale)}
                          </dd>
                          <dt className="text-[var(--color-text-secondary)]">
                            {tPage('list.blended')}
                          </dt>
                          <dd className="text-right font-mono font-semibold">
                            {formatPrice(point.blendedPrice, locale)}
                          </dd>
                          <dt className="text-[var(--color-text-secondary)]">
                            {tPage('list.index')}
                          </dt>
                          <dd className="text-right font-mono text-base font-semibold">
                            {point.score}
                            {point.estimated ? '*' : ''}
                          </dd>
                        </dl>
                      </div>
                    )
                  }}
                />
                {visiblePointsByVendor.map(([vendor, vendorPoints]) => (
                  <Scatter
                    key={vendor}
                    name={vendor}
                    data={vendorPoints}
                    fill={vendorPoints[0]?.color[theme]}
                    shape={<ModelChartPoint type="circle" />}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="name"
                      content={labelProps => {
                        const point = vendorPoints[labelProps.index ?? 0]
                        if (!point) return <g />

                        return (
                          <ModelChartLabel
                            {...labelProps}
                            modelId={point.modelId}
                            placement={{
                              dx:
                                priceScale === 'linear'
                                  ? (point.linearLabelDx ?? point.labelDx)
                                  : point.labelDx,
                              dy:
                                priceScale === 'linear'
                                  ? (point.linearLabelDy ?? point.labelDy)
                                  : point.labelDy,
                              textAnchor:
                                priceScale === 'linear'
                                  ? (point.linearLabelAnchor ?? point.labelAnchor)
                                  : point.labelAnchor,
                            }}
                          />
                        )
                      }}
                    />
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-[var(--spacing-sm)] py-2 font-mono text-xs text-[var(--color-text-secondary)]">
          <span>{tPage('chart.priceAxis')}</span>
          <fieldset className="m-0 flex min-w-0 items-center gap-2 border-0 p-0">
            <legend className="sr-only">{tPage('chart.scale.label')}</legend>
            <span>{tPage('chart.scale.label')}</span>
            <div className="flex">
              {(['log', 'linear'] as const).map(scale => (
                <button
                  key={scale}
                  type="button"
                  aria-pressed={priceScale === scale}
                  onClick={() => setPriceScale(scale)}
                  className={`border border-[var(--color-border-strong)] px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] ${
                    priceScale === scale
                      ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                      : 'hover:bg-[var(--color-hover)]'
                  } ${scale === 'linear' ? '-ml-px' : ''}`}
                >
                  {tPage(`chart.scale.${scale === 'log' ? 'logarithmic' : 'linear'}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">{tPage('filter.label')}</legend>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] px-[var(--spacing-sm)] py-2">
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
              onClick={() => setSelectedVendors([])}
            >
              {tPage('filter.showAll')}
            </button>
          </div>

          <div className="grid border-t border-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
            {pointsByVendor.map(([vendor, vendorPoints], vendorIndex) => {
              const isSelected = selectedVendorSet.has(vendor)
              const isLastVendor = vendorIndex === pointsByVendor.length - 1
              const isInSmallLastRow = vendorIndex >= smallLastRowStart
              const isInLargeLastRow = vendorIndex >= largeLastRowStart

              return (
                <button
                  key={vendor}
                  type="button"
                  aria-pressed={isSelected}
                  className={`min-h-20 border-b border-[var(--color-border)] p-[var(--spacing-sm)] text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] sm:border-r ${
                    isLastVendor ? 'border-b-0' : ''
                  } ${isInSmallLastRow ? 'sm:border-b-0' : ''} ${
                    isInLargeLastRow ? 'lg:border-b-0' : ''
                  } ${isSelected ? 'bg-[var(--color-hover)]' : ''}`}
                  style={
                    isSelected
                      ? { boxShadow: `inset 3px 0 0 ${vendorPoints[0]?.color[theme]}` }
                      : undefined
                  }
                  onClick={() => toggleVendor(vendor)}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5"
                      style={{ backgroundColor: vendorPoints[0]?.color[theme] }}
                    />
                    {vendor}
                  </span>
                  <span className="mt-2 block font-mono text-[11px] text-[var(--color-text-secondary)]">
                    {vendorPoints.map(point => point.name).join(' · ')}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="price-intelligence-list-title">
        <div className="mb-[var(--spacing-sm)] flex items-end justify-between gap-4">
          <div>
            <h2 id="price-intelligence-list-title" className="text-xl font-semibold tracking-tight">
              {tPage('list.title')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {tPage('list.description')}
            </p>
          </div>
          <div className="hidden font-mono text-xs text-[var(--color-text-muted)] sm:block">
            0—{meta.maxScore}
          </div>
        </div>

        <div className="overflow-x-auto border border-[var(--color-border)]">
          <table className="w-full min-w-[820px] border-collapse">
            <caption className="sr-only">{tPage('list.title')}</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left font-mono text-xs text-[var(--color-text-secondary)]">
                <th className="w-[34%] px-[var(--spacing-sm)] py-3 font-semibold">
                  {tShared('categories.singular.model')}
                </th>
                <th aria-sort={getAriaSort('input')} className="w-[14%] p-0 font-semibold">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-end gap-1.5 px-[var(--spacing-sm)] py-3 text-right hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      sort.field === 'input' ? 'text-[var(--color-text)]' : ''
                    }`}
                    onClick={() => toggleSort('input')}
                  >
                    <span className="flex flex-col items-end">
                      <span>{tShared('labels.input')}</span>
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                        {tPage('list.priceUnit')}
                      </span>
                    </span>
                    {renderSortIcon('input')}
                  </button>
                </th>
                <th aria-sort={getAriaSort('output')} className="w-[14%] p-0 font-semibold">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-end gap-1.5 px-[var(--spacing-sm)] py-3 text-right hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      sort.field === 'output' ? 'text-[var(--color-text)]' : ''
                    }`}
                    onClick={() => toggleSort('output')}
                  >
                    <span className="flex flex-col items-end">
                      <span>{tShared('labels.output')}</span>
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                        {tPage('list.priceUnit')}
                      </span>
                    </span>
                    {renderSortIcon('output')}
                  </button>
                </th>
                <th aria-sort={getAriaSort('price')} className="w-[18%] p-0 font-semibold">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-end gap-1.5 px-[var(--spacing-sm)] py-3 text-right hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-text)] ${
                      sort.field === 'price' ? 'text-[var(--color-text)]' : ''
                    }`}
                    onClick={() => toggleSort('price')}
                  >
                    <span className="flex flex-col items-end">
                      <span>{tPage('list.blended')}</span>
                      <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                        {tPage('list.priceUnit')}
                      </span>
                    </span>
                    {renderSortIcon('price')}
                  </button>
                </th>
                <th aria-sort={getAriaSort('index')} className="w-[20%] p-0 font-semibold">
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
                      {point.vendor}
                    </div>
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3 text-right font-mono text-sm">
                    {formatPriceValue(point.inputPrice, locale)}
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3 text-right font-mono text-sm">
                    {formatPriceValue(point.outputPrice, locale)}
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3 text-right font-mono text-sm font-semibold">
                    {formatPriceValue(point.blendedPrice, locale)}
                  </td>
                  <td className="px-[var(--spacing-sm)] py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold">
                        {point.score}
                        {point.estimated ? '*' : ''}
                      </span>
                      <div className="h-2.5 flex-1 bg-[var(--color-hover)]">
                        <div
                          className="h-full"
                          style={{
                            width: `${(point.score / meta.maxScore) * 100}%`,
                            backgroundColor: point.color[theme],
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
            date: formatDate(meta.observedAt, locale),
          })}{' '}
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[var(--color-text)]"
          >
            {meta.source}
          </a>
          {' · '}
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
        <p className="mt-1">
          {tPage('source.pricing', {
            input: Math.round(meta.inputShare * 100),
            output: Math.round(meta.outputShare * 100),
          })}
        </p>
        {meta.fallbackPricingSources.length > 0 && (
          <p className="mt-1">
            {tPage('source.fallbackPricingSources')}{' '}
            {meta.fallbackPricingSources.map((source, index) => (
              <span key={source.modelId}>
                {index > 0 && ' · '}
                <a
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--color-text)]"
                >
                  {source.name}
                </a>
              </span>
            ))}
            .
          </p>
        )}
      </aside>
    </div>
  )
}
