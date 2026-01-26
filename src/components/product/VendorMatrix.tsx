'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { LandscapeProduct, ProductCategory, VendorMatrixRow } from '@/lib/landscape-data'

interface VendorMatrixProps {
  matrixData: VendorMatrixRow[]
}

const PRODUCT_CATEGORIES: ProductCategory[] = ['ide', 'cli', 'extension', 'model', 'provider']

interface MatrixCellProps {
  products: LandscapeProduct[]
  category: ProductCategory
}

/**
 * Gets the localized label for a product category, with simple plural handling.
 */
function getCategoryLabel(
  tShared: ReturnType<typeof useTranslations>,
  category: ProductCategory,
  count: number
): string {
  if (count === 1) {
    return tShared(`categories.singular.${category}`)
  }
  // Map singular to plural key for shared categories
  const pluralMap: Record<ProductCategory, string> = {
    cli: 'clis',
    extension: 'extensions',
    ide: 'ides',
    model: 'models',
    provider: 'providers',
  }
  return tShared(`categories.plural.${pluralMap[category]}`)
}

/**
 * Gets the localized vendor type label. Falls back to the raw type when missing.
 */
function getVendorTypeLabel(t: ReturnType<typeof useTranslations>, type: string): string {
  const key = `vendorTypes.types.${type}.label`
  try {
    return t(key)
  } catch {
    return type
  }
}

function MatrixCell({ products, category }: MatrixCellProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')

  if (products.length === 0) {
    return (
      <div className="h-full min-h-[80px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
    )
  }

  if (products.length === 1) {
    const product = products[0]
    if (!product) return null
    return (
      <Link
        href={product.path}
        className="block h-full min-h-[80px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all p-[var(--spacing-sm)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-hover)] group"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <h4 className="font-medium text-sm tracking-tight mb-1 group-hover:text-[var(--color-text)] transition-colors line-clamp-2">
              {product.name}
            </h4>
          </div>
        </div>
      </Link>
    )
  }

  // Two products - display directly without collapse
  if (products.length === 2) {
    return (
      <div className="h-full min-h-[80px] flex flex-col gap-1">
        {products.map(product => (
          <Link
            key={product.id}
            href={product.path}
            className="flex-1 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all p-[var(--spacing-sm)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-hover)] group"
          >
            <h4 className="font-medium text-sm tracking-tight group-hover:text-[var(--color-text)] transition-colors line-clamp-2">
              {product.name}
            </h4>
          </Link>
        ))}
      </div>
    )
  }

  // Three or more products - show collapse menu
  return (
    <div className="relative h-full min-h-[80px]">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-full border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all p-[var(--spacing-sm)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-hover)] text-left"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm tracking-tight">
                {tComponent('vendorMatrix.cell.summary', {
                  count: products.length,
                  category: getCategoryLabel(tShared, category, products.length),
                })}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {products.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border-strong)] shadow-lg z-10 max-h-[300px] overflow-y-auto">
          {products.map(product => (
            <Link
              key={product.id}
              href={product.path}
              className="block p-[var(--spacing-sm)] hover:bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm tracking-tight truncate">{product.name}</h5>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VendorMatrix({ matrixData }: VendorMatrixProps) {
  const [selectedVendorTypes, setSelectedVendorTypes] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'products'>('products')
  const tComponent = useTranslations('components.product')
  const tShared = useTranslations('shared')

  const filteredAndSortedData = useMemo(() => {
    let filtered = matrixData

    // Filter by vendor type
    if (selectedVendorTypes.size > 0) {
      filtered = filtered.filter(row => selectedVendorTypes.has(row.vendorType))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.vendorName.localeCompare(b.vendorName)
      }

      // Define column groups: first part (high priority) and second part (low priority)
      const FIRST_PART_CATEGORIES = PRODUCT_CATEGORIES.slice(0, 3) // ide, cli, extension
      const SECOND_PART_CATEGORIES = PRODUCT_CATEGORIES.slice(3) // model, provider

      // Helper function to get column count for a specific set of categories
      const getColumnCount = (row: VendorMatrixRow, categories: ProductCategory[]) => {
        return categories.filter(cat => row.cells[cat] && row.cells[cat].length > 0).length
      }

      // Helper function to get column order (left to right) for a specific set of categories
      const getColumnOrder = (row: VendorMatrixRow, categories: ProductCategory[]) => {
        return categories.filter(cat => row.cells[cat] && row.cells[cat].length > 0).map(cat => cat)
      }

      // Helper function to compare column order
      const compareColumnOrder = (
        aOrder: ProductCategory[],
        bOrder: ProductCategory[],
        categories: ProductCategory[]
      ) => {
        for (let i = 0; i < Math.min(aOrder.length, bOrder.length); i++) {
          const aIndex = categories.indexOf(aOrder[i]!)
          const bIndex = categories.indexOf(bOrder[i]!)
          if (aIndex !== bIndex) {
            return aIndex - bIndex
          }
        }
        return 0
      }

      // 1. Sort by first part column count (descending)
      const aFirstPartCount = getColumnCount(a, FIRST_PART_CATEGORIES)
      const bFirstPartCount = getColumnCount(b, FIRST_PART_CATEGORIES)
      if (aFirstPartCount !== bFirstPartCount) {
        return bFirstPartCount - aFirstPartCount
      }

      // 2. If first part column count is the same, sort by second part column count (descending)
      const aSecondPartCount = getColumnCount(a, SECOND_PART_CATEGORIES)
      const bSecondPartCount = getColumnCount(b, SECOND_PART_CATEGORIES)
      if (aSecondPartCount !== bSecondPartCount) {
        return bSecondPartCount - aSecondPartCount
      }

      // 3. If both column counts are the same, sort by first part column order (left to right)
      const aFirstPartOrder = getColumnOrder(a, FIRST_PART_CATEGORIES)
      const bFirstPartOrder = getColumnOrder(b, FIRST_PART_CATEGORIES)
      const firstPartOrderComparison = compareColumnOrder(
        aFirstPartOrder,
        bFirstPartOrder,
        FIRST_PART_CATEGORIES
      )
      if (firstPartOrderComparison !== 0) {
        return firstPartOrderComparison
      }

      // 4. If first part order is also the same, sort by second part column order (left to right)
      const aSecondPartOrder = getColumnOrder(a, SECOND_PART_CATEGORIES)
      const bSecondPartOrder = getColumnOrder(b, SECOND_PART_CATEGORIES)
      const secondPartOrderComparison = compareColumnOrder(
        aSecondPartOrder,
        bSecondPartOrder,
        SECOND_PART_CATEGORIES
      )
      if (secondPartOrderComparison !== 0) {
        return secondPartOrderComparison
      }

      // 5. If everything is the same, sort alphabetically by vendor name
      return a.vendorName.localeCompare(b.vendorName)
    })

    return sorted
  }, [matrixData, selectedVendorTypes, sortBy])

  const toggleVendorType = (type: string) => {
    const newSet = new Set(selectedVendorTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setSelectedVendorTypes(newSet)
  }

  const vendorTypes = Array.from(new Set(matrixData.map(row => row.vendorType)))

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-[var(--spacing-md)] items-start md:items-center justify-between p-[var(--spacing-md)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
        {/* Vendor Type Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[var(--color-text-secondary)] font-light">
            {tComponent('vendorMatrix.controls.vendorTypeLabel')}
          </span>
          {vendorTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleVendorType(type)}
              className={`px-3 py-1 text-xs border transition-all ${
                selectedVendorTypes.size === 0 || selectedVendorTypes.has(type)
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-bg)]'
                  : 'border-[var(--color-border)] opacity-50 hover:opacity-100'
              }`}
            >
              <span className="text-[var(--color-text-secondary)]">
                {getVendorTypeLabel(tComponent, type)}
              </span>
            </button>
          ))}
          {selectedVendorTypes.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedVendorTypes(new Set())}
              className="px-3 py-1 text-xs border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            >
              {tComponent('vendorMatrix.controls.clear')}
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-[var(--color-text-secondary)] font-light">
            {tComponent('vendorMatrix.controls.sortByLabel')}
          </span>
          <button
            type="button"
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 text-xs border transition-all ${
              sortBy === 'name'
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
            }`}
          >
            {tShared('labels.name')}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('products')}
            className={`px-3 py-1 text-xs border transition-all ${
              sortBy === 'products'
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
            }`}
          >
            {tShared('terms.products')}
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-[200px_repeat(5,1fr)] gap-2 p-[var(--spacing-sm)] bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] sticky top-0 z-20">
              <div className="font-medium text-sm text-[var(--color-text-secondary)] px-2">
                {tShared('categories.singular.vendor')}
              </div>
              {PRODUCT_CATEGORIES.map(cat => (
                <div key={cat} className="font-medium text-sm text-center px-2">
                  {tShared(`categories.singular.${cat}`)}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div className="p-[var(--spacing-sm)]">
              <div className="space-y-2">
                {filteredAndSortedData.length === 0 ? (
                  <div className="text-center py-12 text-[var(--color-text-muted)]">
                    {tComponent('vendorMatrix.table.noVendorsFound')}
                  </div>
                ) : (
                  filteredAndSortedData.map(row => (
                    <div key={row.vendorId} className="grid grid-cols-[200px_repeat(5,1fr)] gap-2">
                      {/* Vendor Name */}
                      <div className="flex flex-col justify-center px-2 border-r border-[var(--color-border)]">
                        <Link
                          href={`/vendors/${row.vendorId}`}
                          className="font-medium text-sm hover:text-[var(--color-text)] transition-colors"
                        >
                          {row.vendorName}
                        </Link>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {getVendorTypeLabel(tComponent, row.vendorType)}
                        </span>
                      </div>

                      {/* Product Cells */}
                      {PRODUCT_CATEGORIES.map(cat => (
                        <div key={cat}>
                          <MatrixCell products={row.cells[cat]} category={cat} />
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-[var(--spacing-md)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
          {tComponent('vendorMatrix.vendorTypes.label')}
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-light text-[var(--color-text-secondary)]">
          <span>
            <span className="font-medium">
              {tComponent('vendorMatrix.vendorTypes.types.full-stack.label')}:
            </span>{' '}
            {tComponent('vendorMatrix.vendorTypes.types.full-stack.description')}
          </span>
          <span>
            <span className="font-medium">
              {tComponent('vendorMatrix.vendorTypes.types.ai-native.label')}:
            </span>{' '}
            {tComponent('vendorMatrix.vendorTypes.types.ai-native.description')}
          </span>
          <span>
            <span className="font-medium">
              {tComponent('vendorMatrix.vendorTypes.types.tool-only.label')}:
            </span>{' '}
            {tComponent('vendorMatrix.vendorTypes.types.tool-only.description')}
          </span>
          <span>
            <span className="font-medium">
              {tComponent('vendorMatrix.vendorTypes.types.model-only.label')}:
            </span>{' '}
            {tComponent('vendorMatrix.vendorTypes.types.model-only.description')}
          </span>
          <span>
            <span className="font-medium">
              {tComponent('vendorMatrix.vendorTypes.types.provider-only.label')}:
            </span>{' '}
            {tComponent('vendorMatrix.vendorTypes.types.provider-only.description')}
          </span>
        </div>
      </div>
    </div>
  )
}
