'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'

export interface ComparisonColumn {
  key: string
  label: string
  minWidth?: string
  maxWidth?: string
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode
}

export interface ComparisonTableProps {
  items: Record<string, unknown>[]
  columns: ComparisonColumn[]
  itemLinkPrefix: string
  itemNameKey?: string
  itemIdKey?: string
  stickyTopOffset?: number
}

export default function ComparisonTable({
  items,
  columns,
  itemLinkPrefix,
  itemNameKey = 'name',
  itemIdKey = 'id',
  stickyTopOffset,
}: ComparisonTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const theadRef = useRef<HTMLTableSectionElement>(null)
  const [isFixed, setIsFixed] = useState(false)
  const [theadWidth, setTheadWidth] = useState<number>(0)
  const [theadHeight, setTheadHeight] = useState<number>(0)
  const [columnWidths, setColumnWidths] = useState<number[]>([])
  const [scrollLeft, setScrollLeft] = useState<number>(0)
  const [calculatedOffset, setCalculatedOffset] = useState<number>(0)
  const columnWidthsMeasured = useRef(false)

  useEffect(() => {
    // Calculate sticky offset based on header and breadcrumb heights
    const calculateOffset = () => {
      if (stickyTopOffset !== undefined) {
        setCalculatedOffset(stickyTopOffset)
        return
      }

      const header = document.querySelector('header') as HTMLElement | null
      const breadcrumb = document.querySelector('[data-breadcrumb]') as HTMLElement | null
      const headerHeight = header?.offsetHeight || 0
      const breadcrumbHeight = breadcrumb?.offsetHeight || 0
      setCalculatedOffset(headerHeight + breadcrumbHeight)
    }

    calculateOffset()
    window.addEventListener('resize', calculateOffset)
    // Also recalculate on scroll to handle dynamic changes
    window.addEventListener('scroll', calculateOffset)

    return () => {
      window.removeEventListener('resize', calculateOffset)
      window.removeEventListener('scroll', calculateOffset)
    }
  }, [stickyTopOffset])

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current || !theadRef.current || !containerRef.current) return

      const tableRect = tableRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      const theadHeight = theadRef.current.offsetHeight

      // Check if table has scrolled past the sticky offset
      if (tableRect.top <= calculatedOffset && tableRect.bottom > calculatedOffset + theadHeight) {
        // Only measure widths once, before first fixing
        if (!columnWidthsMeasured.current) {
          const ths = theadRef.current.querySelectorAll('th')
          const widths = Array.from(ths).map(th => th.offsetWidth)
          setColumnWidths(widths)
          setTheadWidth(containerRect.width)
          setTheadHeight(theadHeight)
          columnWidthsMeasured.current = true
        }
        setIsFixed(true)
      } else {
        setIsFixed(false)
      }
    }

    const handleContainerScroll = () => {
      if (!containerRef.current) return
      setScrollLeft(containerRef.current.scrollLeft)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    containerRef.current?.addEventListener('scroll', handleContainerScroll)
    handleScroll() // Check initial position

    const container = containerRef.current
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      container?.removeEventListener('scroll', handleContainerScroll)
    }
  }, [calculatedOffset])

  return (
    <>
      {/* Fixed header wrapper with clipping */}
      {isFixed && containerRef.current && (
        <div
          className="fixed z-30 overflow-hidden"
          style={{
            top: `${calculatedOffset}px`,
            width: `${theadWidth}px`,
            left: `${containerRef.current.getBoundingClientRect().left}px`,
            pointerEvents: 'none',
          }}
        >
          <table
            className="w-full border-collapse"
            style={{
              pointerEvents: 'auto',
            }}
          >
            <thead className="bg-[var(--color-bg)] shadow-sm border-b border-t border-[var(--color-border-strong)]">
              <tr
                className="border-b border-t border-[var(--color-border-strong)]"
                style={{
                  transform: `translateX(-${scrollLeft}px)`,
                }}
              >
                <th
                  className="sticky left-0 z-50 bg-[var(--color-bg)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] border-r border-[var(--color-border)]"
                  style={{
                    width: `${columnWidths[0]}px`,
                    minWidth: `${columnWidths[0]}px`,
                    maxWidth: `${columnWidths[0]}px`,
                    transform: `translateX(${scrollLeft}px)`,
                  }}
                >
                  Name
                </th>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className="pl-[var(--spacing-md)] pr-0 py-[var(--spacing-sm)] text-left text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] whitespace-nowrap"
                    style={{
                      width: column.minWidth || column.maxWidth || `${columnWidths[index + 1]}px`,
                      minWidth: column.minWidth || `${columnWidths[index + 1]}px`,
                      maxWidth: column.maxWidth || `${columnWidths[index + 1]}px`,
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      )}

      <div ref={containerRef} className="w-full overflow-x-auto relative">
        <div className="min-w-[1200px]">
          <table ref={tableRef} className="w-full border-collapse">
            {/* Placeholder to prevent content jump when thead becomes fixed */}
            {isFixed && (
              <thead aria-hidden="true" style={{ visibility: 'hidden' }}>
                <tr>
                  <th
                    style={
                      columnWidths[0]
                        ? {
                            width: `${columnWidths[0]}px`,
                            minWidth: `${columnWidths[0]}px`,
                            maxWidth: `${columnWidths[0]}px`,
                            height: `${theadHeight}px`,
                          }
                        : { height: `${theadHeight}px` }
                    }
                  ></th>
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      style={
                        columnWidths[index + 1]
                          ? {
                              width:
                                column.minWidth ||
                                column.maxWidth ||
                                `${columnWidths[index + 1]}px`,
                              minWidth: column.minWidth || `${columnWidths[index + 1]}px`,
                              maxWidth: column.maxWidth || `${columnWidths[index + 1]}px`,
                            }
                          : undefined
                      }
                    ></th>
                  ))}
                </tr>
              </thead>
            )}

            <thead
              ref={theadRef}
              className={!isFixed ? 'relative z-10 bg-[var(--color-bg)]' : 'sr-only'}
            >
              <tr className="border-b border-t border-[var(--color-border-strong)]">
                <th className="sticky left-0 z-50 bg-[var(--color-bg)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] border-r border-[var(--color-border)]">
                  Name
                </th>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className="pl-[var(--spacing-md)] pr-0 py-[var(--spacing-sm)] text-left text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] whitespace-nowrap"
                    style={{
                      ...(column.minWidth && { minWidth: column.minWidth }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                      ...(column.minWidth && { width: column.minWidth }),
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item[itemIdKey] as string}
                  className={`border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors ${
                    index % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-hover)]'
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-[var(--spacing-md)] py-[var(--spacing-sm)] font-medium border-r border-[var(--color-border)] whitespace-nowrap">
                    <Link
                      href={`${itemLinkPrefix}/${item[itemIdKey] as string}`}
                      className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] hover:underline transition-colors"
                    >
                      {item[itemNameKey] as string}
                    </Link>
                  </td>
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className="pl-[var(--spacing-md)] pr-0 py-[var(--spacing-sm)] text-sm text-[var(--color-text-secondary)]"
                      style={{
                        ...(column.minWidth && { minWidth: column.minWidth }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        ...(column.minWidth && { width: column.minWidth }),
                        ...(column.maxWidth
                          ? { wordBreak: 'break-all', whiteSpace: 'normal' }
                          : { whiteSpace: 'nowrap' }),
                      }}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : (item[column.key] as string) || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
