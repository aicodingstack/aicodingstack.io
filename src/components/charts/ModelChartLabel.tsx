'use client'

import { type LabelProps, Symbols, type SymbolsProps } from 'recharts'

interface ModelChartLabelPlacement {
  dx: number
  dy: number
  textAnchor: 'start' | 'middle' | 'end'
}

interface ModelChartLabelProps extends LabelProps {
  modelId: string
  placement: ModelChartLabelPlacement
}

interface ModelChartPointProps extends SymbolsProps {
  payload?: {
    modelId?: string
  }
}

export function ModelChartPoint({ payload, ...props }: ModelChartPointProps) {
  return <Symbols {...props} data-model-id={payload?.modelId} />
}

export function estimateModelChartLabelWidth(label: string): number {
  const width = Array.from(label).reduce(
    (total, character) => total + (character.codePointAt(0)! > 0xff ? 10 : 6.5),
    0
  )

  return Math.min(Math.max(width, 24), 180)
}

function getModelPoint(labelElement: SVGGElement, modelId: string): SVGGElement | null {
  const pointShape = labelElement.ownerSVGElement?.querySelector(`[data-model-id="${modelId}"]`)

  return pointShape?.closest<SVGGElement>('.recharts-scatter-symbol') ?? null
}

function dispatchModelPointEvent(
  labelElement: SVGGElement,
  modelId: string,
  type: 'mouseover' | 'mouseout'
) {
  const point = getModelPoint(labelElement, modelId)
  if (!point) return

  const bounds = point.getBoundingClientRect()
  point.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
      relatedTarget: type === 'mouseout' ? labelElement : null,
      view: window,
    })
  )
}

export function ModelChartLabel({ modelId, placement, value, viewBox }: ModelChartLabelProps) {
  if (!viewBox || !('x' in viewBox) || !('y' in viewBox)) return <g />

  const label = String(value)
  const pointX = viewBox.x + ('width' in viewBox ? (viewBox.width ?? 0) / 2 : 0)
  const pointY = viewBox.y + ('height' in viewBox ? (viewBox.height ?? 0) / 2 : 0)
  const x = pointX + placement.dx
  const y = pointY + placement.dy
  const labelWidth = estimateModelChartLabelWidth(label)
  const labelLeft =
    placement.textAnchor === 'middle'
      ? x - labelWidth / 2
      : placement.textAnchor === 'end'
        ? x - labelWidth
        : x
  const leaderEndX =
    placement.textAnchor === 'start' ? x - 3 : placement.textAnchor === 'end' ? x + 3 : x
  const leaderEndY = y + (placement.dy < 0 ? 3 : placement.dy > 0 ? -10 : -3)

  return (
    <g>
      <line
        x1={pointX}
        y1={pointY}
        x2={leaderEndX}
        y2={leaderEndY}
        stroke="var(--color-text-muted)"
        strokeDasharray="4 4"
        strokeOpacity={0.45}
        strokeWidth={0.6}
        pointerEvents="none"
      />
      {/* biome-ignore lint/a11y/useSemanticElements: SVG labels cannot render HTML buttons. */}
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        className="group cursor-pointer outline-none"
        onMouseDown={event => event.stopPropagation()}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
          dispatchModelPointEvent(event.currentTarget, modelId, 'mouseover')
        }}
        onMouseLeave={event => {
          dispatchModelPointEvent(event.currentTarget, modelId, 'mouseout')
        }}
        onBlur={event => {
          dispatchModelPointEvent(event.currentTarget, modelId, 'mouseout')
        }}
        onKeyDown={event => {
          if (event.key !== 'Enter' && event.key !== ' ') return

          event.preventDefault()
          event.stopPropagation()
          dispatchModelPointEvent(event.currentTarget, modelId, 'mouseover')
        }}
      >
        <rect
          x={labelLeft - 4}
          y={y - 13}
          width={labelWidth + 8}
          height={18}
          fill="transparent"
          pointerEvents="all"
        />
        <text
          x={x}
          y={y}
          fill="var(--color-text)"
          stroke="var(--color-bg)"
          strokeWidth={3}
          paintOrder="stroke"
          textAnchor={placement.textAnchor}
          fontFamily="var(--font-mono)"
          fontSize={10}
          className="transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70"
        >
          {label}
        </text>
      </g>
    </g>
  )
}
