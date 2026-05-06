'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { BaWithNetwork } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  formatCurrency, formatNumber, formatRatio,
} from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

type SortKey = keyof Pick<BaWithNetwork,
  'first_name' | 'ba_tier' | 'ba_status' | 'ba_referral_count' | 'network_size' |
  'direct_revenue' | 'network_revenue' | 'ba_total_commission' | 'true_network_cac' |
  'network_roi' | 'avg_referral_ltv'
>

const COLS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'first_name', label: 'Name' },
  { key: 'ba_tier', label: 'Tier' },
  { key: 'ba_status', label: 'Status' },
  { key: 'ba_referral_count', label: 'Direct Refs', numeric: true },
  { key: 'network_size', label: 'Network Size', numeric: true },
  { key: 'direct_revenue', label: 'Direct Revenue', numeric: true },
  { key: 'network_revenue', label: 'Network Revenue', numeric: true },
  { key: 'ba_total_commission', label: 'Commission', numeric: true },
  { key: 'true_network_cac', label: 'True CAC', numeric: true },
  { key: 'network_roi', label: 'Network ROI', numeric: true },
  { key: 'avg_referral_ltv', label: 'Avg Ref LTV', numeric: true },
]

const TIERS = ['All', 'Founder', 'Growth', 'Standard']

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: 'asc' | 'desc' } | null }) {
  if (!sort || sort.key !== col) return <ChevronsUpDown size={12} className="text-[#444444]" />
  return sort.dir === 'asc'
    ? <ChevronUp size={12} className="text-[#4ade9a]" />
    : <ChevronDown size={12} className="text-[#4ade9a]" />
}

export function AmbassadorTable({ data }: { data: BaWithNetwork[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>({
    key: 'network_revenue', dir: 'desc',
  })
  const [tierFilter, setTierFilter] = useState('All')

  const toggleSort = (key: SortKey) => {
    setSort(prev => prev?.key === key
      ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: 'desc' }
    )
  }

  const sorted = useMemo(() => {
    let rows = tierFilter === 'All' ? data : data.filter(b => b.ba_tier === tierFilter)
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key] ?? ''
        const bv = b[sort.key] ?? ''
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, sort, tierFilter])

  return (
    <Card>
      {/* Filters */}
      <div className="px-6 py-4 border-b border-[#232323] flex items-center gap-2">
        <span className="text-xs text-[#888580] font-mono mr-2">Tier:</span>
        {TIERS.map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className="px-3 py-1 rounded-full text-xs font-mono border transition-colors"
            style={{
              background: tierFilter === t ? 'rgba(74,222,154,0.15)' : 'transparent',
              color: tierFilter === t ? '#4ade9a' : '#888580',
              borderColor: tierFilter === t ? 'rgba(74,222,154,0.4)' : '#2e2e2e',
            }}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#888580] font-mono">{sorted.length} ambassadors</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-[#232323] bg-[#111111]">
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest cursor-pointer select-none hover:text-[#f0ede8] whitespace-nowrap font-mono"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} sort={sort} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-6 py-12 text-center text-[#888580] font-mono">
                  No ambassadors found
                </td>
              </tr>
            )}
            {sorted.map(ba => (
              <tr
                key={ba.id}
                className="hover:bg-[#1e1e1e] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/ambassadors/${ba.id}`} className="font-medium text-[#f0ede8] hover:text-[#4ade9a] transition-colors">
                    {ba.first_name} {ba.last_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ba.ba_tier}>{ba.ba_tier ?? 'Standard'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ba.ba_status}>{ba.ba_status ?? 'unknown'}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-mono text-[#f0ede8]">{formatNumber(ba.ba_referral_count ?? 0)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-mono text-[#f0ede8]">{formatNumber(ba.network_size)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-mono text-[#888580]">{formatCurrency(ba.direct_revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-mono font-semibold text-[#4ade9a]">
                  {formatCurrency(ba.network_revenue)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-mono text-[#888580]">{formatCurrency(ba.ba_total_commission ?? 0)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#222222] rounded border border-[#2e2e2e] text-[#f0ede8]">
                    {formatCurrency(ba.true_network_cac)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-mono font-medium"
                  style={{ color: ba.network_roi >= 3 ? '#4ade9a' : ba.network_roi >= 1 ? '#f5a623' : '#f05a5a' }}>
                  {formatRatio(ba.network_roi)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-mono text-[#888580]">{formatCurrency(ba.avg_referral_ltv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
