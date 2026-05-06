'use client'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { ChannelBreakdown } from '@/lib/types'
import { CHANNEL_LABELS, formatCurrency } from '@/lib/utils'

const COLORS = ['#B87333', '#4A7C59', '#1C1C1C', '#D4821A', '#6B6B6B', '#8B6B4A', '#C0392B']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChannelTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-3 shadow-md">
      <p className="text-xs font-semibold text-[#1C1C1C] mb-1">{p.name}</p>
      <p className="text-xs text-[#6B6B6B]">{formatCurrency(p.value ?? 0)}</p>
      <p className="text-xs text-[#6B6B6B]">{p.payload?.customers ?? 0} customers</p>
    </div>
  )
}

export function ChannelPieChart({ data }: { data: ChannelBreakdown[] }) {
  const formatted = data.map(d => ({
    ...d,
    name: CHANNEL_LABELS[d.origin_source] ?? d.origin_source,
    value: d.total_revenue,
  }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={formatted}
          dataKey="value"
          nameKey="name"
          cx="40%"
          cy="50%"
          outerRadius={95}
          innerRadius={50}
          paddingAngle={2}
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChannelTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#6B6B6B' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
