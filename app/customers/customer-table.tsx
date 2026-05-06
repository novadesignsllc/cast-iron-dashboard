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
  if (!sort || sort.key !== col) return <ChevronsUpDown size={12} className="text-[#444444]" />
  return sort.dir === 'asc' ? <ChevronUp size={12} className="text-[#4ade9a]" /> : <ChevronDown size={12} className="text-[#4ade9a]" />
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
      <div className="px-6 py-4 border-b border-[#232323] space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888580]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg font-mono"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#888580] font-mono">Source:</span>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
              className="text-xs rounded px-2 py-1 font-mono">
              {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : (CHANNEL_LABELS[s] ?? s)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#888580] font-mono">Subscription:</span>
            <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
              className="text-xs rounded px-2 py-1 font-mono">
              {['All', 'active', 'paused', 'cancelled', 'none'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#888580] font-mono">Churn Risk:</span>
            <select value={churnFilter} onChange={e => setChurnFilter(e.target.value)}
              className="text-xs rounded px-2 py-1 font-mono">
              {['All', 'low', 'medium', 'high'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={() => setIsBAFilter(v => !v)}
            className="text-xs px-3 py-1 rounded border transition-colors font-mono"
            style={{
              background: isBAFilter ? 'rgba(74,222,154,0.15)' : 'transparent',
              color: isBAFilter ? '#4ade9a' : '#888580',
              borderColor: isBAFilter ? 'rgba(74,222,154,0.4)' : '#2e2e2e',
            }}
          >
            ⭐ BAs Only
          </button>
          <span className="ml-auto text-xs text-[#888580] font-mono">{filtered.length} customers</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            <tr className="border-b border-[#232323] bg-[#111111]">
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest cursor-pointer select-none hover:text-[#f0ede8] whitespace-nowrap font-mono">
                  <span className="flex items-center gap-1">{col.label}<SortIcon col={col.key} sort={sort} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">Email/SMS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-[#888580] font-mono">No customers match your filters</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-[#f0ede8] hover:text-[#4ade9a] transition-colors">
                    {c.first_name} {c.last_name}
                    {c.is_ba && <span className="ml-1 text-[10px] text-[#4ade9a]">⭐</span>}
                  </Link>
                  <p className="text-xs text-[#888580] truncate max-w-[160px] font-mono">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-[#888580] whitespace-nowrap font-mono">
                  {CHANNEL_ICONS[c.origin_source ?? 'direct'] ?? '🔗'} {CHANNEL_LABELS[c.origin_source ?? 'direct'] ?? c.origin_source ?? 'Direct'}
                </td>
                <td className="px-4 py-3 tabular-nums text-right font-mono text-[#f0ede8]">{c.total_orders}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-right font-mono text-[#4ade9a]">{formatCurrency(c.net_ltv)}</td>
                <td className="px-4 py-3">
                  {c.subscription_status ? <Badge variant={c.subscription_status}>{c.subscription_status}</Badge> : <span className="text-[#888580] text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.klaviyo_churn_risk ? <Badge variant={c.klaviyo_churn_risk}>{c.klaviyo_churn_risk}</Badge> : <span className="text-[#888580] text-xs">—</span>}
                </td>
                <td className="px-4 py-3 tabular-nums text-right font-mono text-[#888580]">{c.klaviyo_predicted_clv ? formatCurrency(c.klaviyo_predicted_clv) : '—'}</td>
                <td className="px-4 py-3 text-[#888580] text-xs font-mono">{formatDate(c.first_purchase_date)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.klaviyo_email_consent
                      ? <CheckCircle2 size={14} className="text-[#4ade9a]" />
                      : <XCircle size={14} className="text-[#f05a5a]" />}
                    {c.klaviyo_sms_consent
                      ? <CheckCircle2 size={14} className="text-[#4ade9a]" />
                      : <XCircle size={14} className="text-[#f05a5a]" />}
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
