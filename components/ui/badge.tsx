'use client'
import { cn, STATUS_COLORS, TIER_COLORS } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: string
  className?: string
}

export function Badge({ children, variant, className }: BadgeProps) {
  const colorClass =
    STATUS_COLORS[variant ?? ''] ??
    TIER_COLORS[variant ?? ''] ??
    'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  )
}
