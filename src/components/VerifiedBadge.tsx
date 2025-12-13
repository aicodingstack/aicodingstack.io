import { BadgeCheck } from 'lucide-react'

export interface VerifiedBadgeProps {
  /**
   * Size variant of the badge
   * - sm: Small size for inline text (14px icon)
   * - md: Medium size for list items (16px icon)
   * - lg: Large size for hero sections (20px icon)
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * VerifiedBadge component displays a badge-check icon with low-saturation green color
 * to indicate verified products, models, providers, or vendors.
 */
export function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5', // 14px
    md: 'w-4 h-4', // 16px
    lg: 'w-5 h-5', // 20px
  }

  return (
    <BadgeCheck
      className={`${sizeClasses[size]} text-[#16a34a] flex-shrink-0 ${className}`}
      aria-label="Verified"
      strokeWidth={2}
    />
  )
}
