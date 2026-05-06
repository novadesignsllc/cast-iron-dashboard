'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import type { RevenueByMonth } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg p-3">
      <p className="text-xs text-[#888580] font-mono mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#4ade9a] font-mono">{formatCurrency(payload[0].value ?? 0)}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg p-3">
      <p className="text-xs text-[#888580] font-mono mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#4ade9a] font-mono">{payload[0].value ?? 0} new customers</p>
    </div>
  )
}

export function RevenueChart({ data }: { data: RevenueByMonth[] }) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888580', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888580', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={45} />
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="revenue" fill="#4ade9a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CustomersChart({ data }: { data: RevenueByMonth[] }) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888580', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888580', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} width={35} />
        <Tooltip content={<CustomersTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="customers" fill="#f5a623" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
