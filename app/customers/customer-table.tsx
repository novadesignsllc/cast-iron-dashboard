'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Customer } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate, formatNumber, CHANNEL_LABELS } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, CheckCircle2, XCircle } from 'lucide-react'

type SortKey = 'first_name' | 'origin_source' | 'total_orders' | 'net_ltv' | 'klaviyo_predicted_clv' | 'first_purchase_date' | 'klaviyo_churn_risk' | 'subscription_status'

const COLS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'first_name', label: 'Name' },
  { key: 'origin_source', label: 'Source' },
  { key: 'total_orders', label: 'Orders', numeric: true },
  { key: 'net_ltv', label: 'LTV', numeric: true },
  { key: 'subscription_status', label: 'Subscription' },
  { key: 'klaviyo_churn_risk', label: 'Churn Risk' },
  { key: 'klaviyo_predicted_clv', label: 'Predicted CLV', numeric: true },
  { key: 'first_purchase_date', label: 'First Purchase' },
]

const CHURN_RISK_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2 }

const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', google: '🔍', organic_search: '🌿',
  ba_referral: '⭐', customer_referral: '👥', direct: '🔗',
}

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: 'asc' | 'desc' } | null }) {
  if (!sort || sort.key !== col) return <ChevronsUpDown size={12} className="text-[#C8C0B4]" />
  return sort.dir === 'asc' ? <ChevronUp size={12} className="text-[#B87333]" /> : <ChevronDown size={12} className="text-[#B87333]" />
}

export function CustomerTable({ data }: { data: (Customer & { referred_by_name?: string; origin_ba_name?: string })[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>({ key: 'net_ltv', dir: 'desc' })
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [subFilter, setSubFilter] = useState('All')
  const [churnFilter, setChurnFilter] = useState('All')
  const [isBAFilter, setIsBAFilter] = useState(false)

  const sources = useMemo(() => ['All', ...Array.from(new Set(data.map(c => c.origin_source ?? 'direct').filter(Boolean)))], [data])

  const filtered = useMemo(() => {
    let rows = data
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    }
    if (sourceFilter !== 'All') rows = rows.filter(c => (c.origin_source ?? 'direct') === sourceFilter)
    if (subFilter !== 'All') rows = rows.filter(c => c.subscription_status === subFilter)
    if (churnFilter !== 'All') rows = rows.filter(c => c.klaviyo_churn_risk === churnFilter)
    if (isBAFilter) rows = rows.filter(c => c.is_ba)
    if (sort) {
      rows = [...rows].sort((a, b) => {
        let av: string | number = (a[sort.key] as string | number) ?? ''
        let bv: string | number = (b[sort.key] as string | number) ?? ''
        if (sort.key === 'klaviyo_churn_risk') {
          av = CHURN_RISK_ORDER[av as string] ?? 0
          bv = CHURN_RISK_ORDER[bv as string] ?? 0
        }
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, sourceFilter, subFilter, churnFilter, isBAFilter, sort])

  const toggleSort = (key: SortKey) => {
    setSort(prev => prev?.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' })
  }

  return (
    <Card>
      {/* Filters */}
      <div className="px-6 py-4 border-b border-[#E5E0D8] space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#B87333] focus:border-[#B87333]"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#6B6B6B]">Source:</span>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
              className="text-xs border border-[#E5E0D8] rounded px-2 py-1 bg-white text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#B87333]">
              {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : (CHANNEL_LABELS[s] ?? s)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#6B6B6B]">Subscription:</span>
            <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
              className="text-xs border border-[#E5E0D8] rounded px-2 py-1 bg-white text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#B87333]">
              {['All', 'active', 'paused', 'cancelled', 'none'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#6B6B6B]">Churn Risk:</span>
            <select value={churnFilter} onChange={e => setChurnFilter(e.target.value)}
              className="text-xs border border-[#E5E0D8] rounded px-2 py-1 bg-white text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#B87333]">
              {['All', 'low', 'medium', 'high'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={() => setIsBAFilter(v => !v)}
            className="text-xs px-3 py-1 rounded border transition-colors"
            style={{
              background: isBAFilter ? '#B87333' : 'white',
              color: isBAFilter ? 'white' : '#6B6B6B',
              borderColor: isBAFilter ? '#B87333' : '#E5E0D8',
            }}
          >
            ⭐ BAs Only
          </button>
          <span className="ml-auto text-xs text-[#6B6B6B]">{filtered.length} customers</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide cursor-pointer select-none hover:text-[#1C1C1C] whitespace-nowrap">
                  <span className="flex items-center gap-1">{col.label}<SortIcon col={col.key} sort={sort} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Email/SMS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D8]">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-[#6B6B6B]">No customers match your filters</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#F9F6F1] transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-[#1C1C1C] hover:text-[#B87333] transition-colors">
                    {c.first_name} {c.last_name}
                    {c.is_ba && <span className="ml-1 text-[10px] text-[#B87333]">⭐</span>}
                  </Link>
                  <p className="text-xs text-[#6B6B6B] truncate max-w-[160px]">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-[#6B6B6B] whitespace-nowrap">
                  {CHANNEL_ICONS[c.origin_source ?? 'direct'] ?? '🔗'} {CHANNEL_LABELS[c.origin_source ?? 'direct'] ?? c.origin_source ?? 'Direct'}
                </td>
                <td className="px-4 py-3 tabular-nums text-right">{c.total_orders}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-right text-[#B87333]">{formatCurrency(c.net_ltv)}</td>
                <td className="px-4 py-3">
                  {c.subscription_status ? <Badge variant={c.subscription_status}>{c.subscription_status}</Badge> : <span className="text-[#6B6B6B] text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.klaviyo_churn_risk ? <Badge variant={c.klaviyo_churn_risk}>{c.klaviyo_churn_risk}</Badge> : <span className="text-[#6B6B6B] text-xs">—</span>}
                </td>
                <td className="px-4 py-3 tabular-nums text-right">{c.klaviyo_predicted_clv ? formatCurrency(c.klaviyo_predicted_clv) : '—'}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-xs">{formatDate(c.first_purchase_date)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.klaviyo_email_consent
                      ? <CheckCircle2 size={14} className="text-[#4A7C59]" />
                      : <XCircle size={14} className="text-[#C0392B]" />}
                    {c.klaviyo_sms_consent
                      ? <CheckCircle2 size={14} className="text-[#4A7C59]" />
                      : <XCircle size={14} className="text-[#C0392B]" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
