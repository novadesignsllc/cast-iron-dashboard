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
    'bg-[rgba(136,133,128,0.12)] text-[#888580] border-[rgba(136,133,128,0.25)]'
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
