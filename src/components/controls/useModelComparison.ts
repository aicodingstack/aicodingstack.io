'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { modelsData } from '@/lib/generated'
import { MODEL_COMPARISON_STORAGE_KEY, normalizeModelComparisonIds } from '@/lib/model-comparison'

const validModelIds = new Set(modelsData.map(model => model.id))

function readStoredSelection(): string[] {
  try {
    const stored = window.localStorage.getItem(MODEL_COMPARISON_STORAGE_KEY)
    return stored ? normalizeModelComparisonIds(JSON.parse(stored) as string[], validModelIds) : []
  } catch {
    return []
  }
}

function writeStoredSelection(ids: readonly string[]): void {
  try {
    window.localStorage.setItem(MODEL_COMPARISON_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Comparison remains usable when storage is unavailable.
  }
}

export function useModelComparison(initialIds: readonly string[] = []) {
  const initialSelectionKey = initialIds.join('\u0000')
  const normalizedInitialIds = useMemo(
    () => normalizeModelComparisonIds(initialSelectionKey.split('\u0000'), validModelIds),
    [initialSelectionKey]
  )
  const [selectedIds, setSelectedIds] = useState<string[]>(normalizedInitialIds)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (normalizedInitialIds.length > 0) {
      writeStoredSelection(normalizedInitialIds)
      setSelectedIds(normalizedInitialIds)
    } else {
      setSelectedIds(readStoredSelection())
    }
    setIsHydrated(true)
  }, [normalizedInitialIds])

  const setSelection = useCallback((ids: readonly string[]) => {
    const normalized = normalizeModelComparisonIds(ids, validModelIds)
    setSelectedIds(normalized)
    writeStoredSelection(normalized)
  }, [])

  const toggleModel = useCallback((id: string) => {
    if (!validModelIds.has(id)) return
    setSelectedIds(current => {
      const next = current.includes(id)
        ? current.filter(selectedId => selectedId !== id)
        : normalizeModelComparisonIds([...current, id], validModelIds)
      writeStoredSelection(next)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelection([]), [setSelection])

  return { selectedIds, isHydrated, setSelection, toggleModel, clearSelection }
}
