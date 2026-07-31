import type { ModelLifecycle } from '@/types/manifests'

type DatedModel = {
  id: string
  name: string
  releaseDate: string | null
}

type LifecycleModel = DatedModel & {
  lifecycle?: ModelLifecycle | null
}

export function sortModelsByReleaseDateDesc<T extends DatedModel>(models: readonly T[]): T[] {
  return [...models].sort((a, b) => {
    const releaseDateOrder = (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '')

    return (
      releaseDateOrder ||
      a.name.localeCompare(b.name, 'en', { numeric: true }) ||
      a.id.localeCompare(b.id, 'en', { numeric: true })
    )
  })
}

export function groupModelsByLifecycle<T extends LifecycleModel>(
  models: readonly T[]
): Record<ModelLifecycle, T[]> {
  const groups: Record<ModelLifecycle, T[]> = {
    latest: [],
    maintained: [],
    deprecated: [],
  }

  for (const model of models) {
    groups[model.lifecycle ?? 'maintained'].push(model)
  }

  return {
    latest: sortModelsByReleaseDateDesc(groups.latest),
    maintained: sortModelsByReleaseDateDesc(groups.maintained),
    deprecated: sortModelsByReleaseDateDesc(groups.deprecated),
  }
}
