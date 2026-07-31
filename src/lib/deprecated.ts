type Deprecatable = {
  deprecated?: boolean
}

export function sortDeprecatedLast<T extends Deprecatable>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const deprecatedOrder =
        Number(a.item.deprecated === true) - Number(b.item.deprecated === true)

      return deprecatedOrder || a.index - b.index
    })
    .map(({ item }) => item)
}
