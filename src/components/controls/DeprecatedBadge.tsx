import { useTranslations } from 'next-intl'

export interface DeprecatedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Displays a compact, localized lifecycle badge for deprecated entities. */
export function DeprecatedBadge({ size = 'sm', className = '' }: DeprecatedBadgeProps) {
  const tShared = useTranslations('shared')
  const label = tShared('lifecycle.deprecated')
  const sizeClasses = {
    sm: 'h-4 px-1.5 text-[9px] tracking-[0.06em]',
    md: 'h-[18px] px-1.5 text-[10px] tracking-[0.06em]',
    lg: 'h-6 px-2 text-[11px] tracking-[0.08em]',
  }

  return (
    <span
      className={`inline-flex box-border shrink-0 items-center whitespace-nowrap border border-current font-medium uppercase leading-none text-[#16a34a] ${sizeClasses[size]} ${className}`}
      title={label}
    >
      {label}
    </span>
  )
}
