'use client'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { ChannelBreakdown } from '@/lib/types'
import { CHANNEL_LABELS, formatCurrency } from '@/lib/utils'

const COLORS = ['#4ade9a', '#f5a623', '#f05a5a', '#60a5fa', '#a78bfa', '#fb923c', '#888580']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChannelTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-[#181818] border border-[#2e2e2e] rounded-lg p-3">
      <p className="text-xs font-semibold text-[#f0ede8] mb-1 font-mono">{p.name}</p>
      <p className="text-xs text-[#888580] font-mono">{formatCurrency(p.value ?? 0)}</p>
      <p className="text-xs text-[#888580] font-mono">{p.payload?.customers ?? 0} customers</p>
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
          stroke="none"
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
          iconSize={7}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#888580', fontFamily: 'DM Mono, monospace' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
