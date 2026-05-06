// READ ONLY — no writes permitted

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '0.0%'
  return `${value.toFixed(1)}%`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatRatio(value: number | null | undefined): string {
  if (value == null || value === 0) return '0.0×'
  return `${value.toFixed(1)}×`
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return 'Never'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(date)
}

export const CHANNEL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  google: 'Google',
  organic_search: 'Organic Search',
  ba_referral: 'BA Referral',
  customer_referral: 'Customer Referral',
  direct: 'Direct',
}

export const TIER_COLORS: Record<string, string> = {
  Founder: 'bg-[rgba(245,166,35,0.15)] text-[#f5a623] border-[rgba(245,166,35,0.3)]',
  Growth: 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] border-[rgba(74,222,154,0.25)]',
  Standard: 'bg-[rgba(136,133,128,0.15)] text-[#888580] border-[rgba(136,133,128,0.3)]',
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] border-[rgba(74,222,154,0.25)]',
  paused: 'bg-[rgba(245,166,35,0.12)] text-[#f5a623] border-[rgba(245,166,35,0.25)]',
  churned: 'bg-[rgba(240,90,90,0.12)] text-[#f05a5a] border-[rgba(240,90,90,0.25)]',
  none: 'bg-[rgba(136,133,128,0.12)] text-[#888580] border-[rgba(136,133,128,0.25)]',
  cancelled: 'bg-[rgba(240,90,90,0.12)] text-[#f05a5a] border-[rgba(240,90,90,0.25)]',
  success: 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] border-[rgba(74,222,154,0.25)]',
  failed: 'bg-[rgba(240,90,90,0.12)] text-[#f05a5a] border-[rgba(240,90,90,0.25)]',
  pending: 'bg-[rgba(245,166,35,0.12)] text-[#f5a623] border-[rgba(245,166,35,0.25)]',
  paid: 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] border-[rgba(74,222,154,0.25)]',
  reversed: 'bg-[rgba(240,90,90,0.12)] text-[#f05a5a] border-[rgba(240,90,90,0.25)]',
  low: 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] border-[rgba(74,222,154,0.25)]',
  medium: 'bg-[rgba(245,166,35,0.12)] text-[#f5a623] border-[rgba(245,166,35,0.25)]',
  high: 'bg-[rgba(240,90,90,0.12)] text-[#f05a5a] border-[rgba(240,90,90,0.25)]',
}
