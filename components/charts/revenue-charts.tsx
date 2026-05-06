'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ChannelBreakdown } from '@/lib/types'
import { formatCurrency, CHANNEL_LABELS } from '@/lib/utils'

const COLORS = ['#B87333', '#4A7C59', '#1C1C1C', '#D4821A', '#6B6B6B', '#8B6B4A', '#C0392B']

export function ChannelRevenueChart({ data }: { data: ChannelBreakdown[] }) {
  const formatted = data.map(d => ({
    name: CHANNEL_LABELS[d.origin_source] ?? d.origin_source,
    revenue: d.total_revenue,
    avg_ltv: d.avg_ltv,
  }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${((v as number) / 1000).toFixed(0)}k`} width={50} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v as number).toFixed(0)}`} width={55} />
        <Tooltip
          contentStyle={{ border: '1px solid #E5E0D8', borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => [
            formatCurrency(value as number),
            name === 'revenue' ? 'Total Revenue' : 'Avg LTV'
          ]}
        />
        <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#6B6B6B' }}>{v === 'revenue' ? 'Total Revenue' : 'Avg LTV'}</span>} />
        <Bar yAxisId="left" dataKey="revenue" fill="#B87333" radius={[4, 4, 0, 0]} name="revenue" />
        <Bar yAxisId="right" dataKey="avg_ltv" fill="#4A7C59" radius={[4, 4, 0, 0]} name="avg_ltv" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LTVHistogram({ data }: { data: { bucket: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={35} />
        <Tooltip
          contentStyle={{ border: '1px solid #E5E0D8', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [value, 'Customers']}
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
        <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${((v as number) / 1000).toFixed(0)}k`} width={50} />
        <Tooltip
          contentStyle={{ border: '1px solid #E5E0D8', borderRadius: 8, fontSize: 12 }}
          formatter={(value, name) => [
            formatCurrency(value as number),
            name === 'commission' ? 'Commission Paid' : 'Network Revenue'
          ]}
        />
        <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#6B6B6B' }}>{v === 'commission' ? 'Commission' : 'Revenue'}</span>} />
        <Bar dataKey="commission" fill="#D4821A" radius={[4, 4, 0, 0]} name="commission" />
        <Bar dataKey="revenue" fill="#B87333" radius={[4, 4, 0, 0]} name="revenue" />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v as number).toFixed(1)}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={100} />
        <Tooltip
          contentStyle={{ border: '1px solid #E5E0D8', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Refund Rate']}
        />
        <Bar dataKey="rate" fill="#C0392B" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
