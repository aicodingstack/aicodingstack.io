export const MODEL_COMPARISON_STORAGE_KEY = 'aicodingstack:model-comparison'
export const MAX_COMPARED_MODELS = 2

export function normalizeModelComparisonIds(
  ids: readonly string[],
  validIds?: ReadonlySet<string>
): string[] {
  const normalized: string[] = []
  for (const id of ids) {
    if (!id || normalized.includes(id) || (validIds && !validIds.has(id))) continue
    normalized.push(id)
  }
  return normalized.slice(-MAX_COMPARED_MODELS)
}

export function buildModelComparisonPath(ids: readonly string[]): string {
  const normalized = normalizeModelComparisonIds(ids)
  return normalized.length === MAX_COMPARED_MODELS
    ? `/models/compare/${normalized.join('-vs-')}`
    : '/models/compare'
}
