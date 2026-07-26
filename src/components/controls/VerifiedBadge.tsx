import { BadgeCheck } from 'lucide-react'

export interface VerifiedBadgeProps {
  /**
   * Size variant of the badge
   * - sm: Small size for inline text (16px icon)
   * - md: Medium size for list items (18px icon)
   * - lg: Large size for hero sections (24px icon)
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * VerifiedBadge component displays a badge-check icon with a restrained blue color
 * to indicate verified products, models, providers, or vendors.
 */
export function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'size-4', // 16px
    md: 'size-[18px]', // 18px
    lg: 'size-6', // 24px
  }

  return (
    <BadgeCheck
      className={`${sizeClasses[size]} text-[#2563eb] flex-shrink-0 ${className}`}
      aria-label="Verified"
      strokeWidth={2}
    />
  )
}
