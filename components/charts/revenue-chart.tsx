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
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-3 shadow-md">
      <p className="text-xs text-[#6B6B6B] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#1C1C1C]">{formatCurrency(payload[0].value ?? 0)}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-3 shadow-md">
      <p className="text-xs text-[#6B6B6B] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#1C1C1C]">{payload[0].value ?? 0} new customers</p>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={45} />
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#F4F0EA' }} />
        <Bar dataKey="revenue" fill="#B87333" radius={[4, 4, 0, 0]} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={35} />
        <Tooltip content={<CustomersTooltip />} cursor={{ fill: '#F4F0EA' }} />
        <Bar dataKey="customers" fill="#4A7C59" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
