'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell
} from 'recharts'
import type { ChannelBreakdown } from '@/lib/types'
import { formatCurrency, CHANNEL_LABELS } from '@/lib/utils'

const COLORS = ['#4ade9a', '#f5a623', '#f05a5a', '#60a5fa', '#a78bfa', '#fb923c', '#f0ede8']
const SANS = 'DM Sans, sans-serif'
const MONO = 'DM Mono, monospace'

const TOOLTIP_STYLE = {
  backgroundColor: '#181818',
  border: '1px solid #2e2e2e',
  borderRadius: 8,
  fontSize: 12,
  color: '#f0ede8',
}

export function ChannelRevenueChart({ data }: { data: ChannelBreakdown[] }) {
  const formatted = data.map(d => ({
    name: CHANNEL_LABELS[d.origin_source] ?? d.origin_source,
    revenue: d.total_revenue,
    avg_ltv: d.avg_ltv,
  }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: SANS }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${((v as number) / 1000).toFixed(0)}k`} width={50} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v as number).toFixed(0)}`} width={55} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [
            formatCurrency(value as number),
            name === 'revenue' ? 'Total Revenue' : 'Avg LTV'
          ]}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#f0ede8', fontFamily: SANS }}>{v === 'revenue' ? 'Total Revenue' : 'Avg LTV'}</span>} />
        <Bar yAxisId="left" dataKey="revenue" fill="#4ade9a" radius={[4, 4, 0, 0]} name="revenue" />
        <Bar yAxisId="right" dataKey="avg_ltv" fill="#f5a623" radius={[4, 4, 0, 0]} name="avg_ltv" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LTVHistogram({ data }: { data: { bucket: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false} width={35} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [value, 'Customers']}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CommissionVsRevenueChart({ data }: { data: { tier: string; commission: number; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" vertical={false} />
        <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: SANS }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${((v as number) / 1000).toFixed(0)}k`} width={50} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [
            formatCurrency(value as number),
            name === 'commission' ? 'Commission Paid' : 'Network Revenue'
          ]}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#f0ede8', fontFamily: SANS }}>{v === 'commission' ? 'Commission' : 'Revenue'}</span>} />
        <Bar dataKey="commission" fill="#f5a623" radius={[4, 4, 0, 0]} name="commission" />
        <Bar dataKey="revenue" fill="#4ade9a" radius={[4, 4, 0, 0]} name="revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RefundRateChart({ data }: { data: { origin_source: string; refund_rate: number; total_refunds: number }[] }) {
  const formatted = data.map(d => ({
    name: CHANNEL_LABELS[d.origin_source] ?? d.origin_source,
    rate: d.refund_rate,
    amount: d.total_refunds,
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} layout="vertical" barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232323" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: MONO }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v as number).toFixed(1)}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#f0ede8', fontFamily: SANS }} axisLine={false} tickLine={false} width={100} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Refund Rate']}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="rate" fill="#f05a5a" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
