import { DeprecatedBadge } from '@/components/controls/DeprecatedBadge'
import { VerifiedBadge } from '@/components/controls/VerifiedBadge'

type ProductCardTitleProps = {
  name: string
  verified?: boolean
  deprecated?: boolean
}

export function ProductCardTitle({ name, verified, deprecated }: ProductCardTitleProps) {
  return (
    <div className="mb-[var(--spacing-sm)] flex flex-wrap items-center gap-x-[var(--spacing-xs)] gap-y-[var(--spacing-xs)]">
      <div className="inline-flex shrink-0 items-center gap-[var(--spacing-xs)] whitespace-nowrap">
        <h3 className="whitespace-nowrap text-lg font-semibold tracking-tight">{name}</h3>
        {verified && <VerifiedBadge size="sm" />}
      </div>
      {deprecated && <DeprecatedBadge className="ml-auto" />}
    </div>
  )
}
