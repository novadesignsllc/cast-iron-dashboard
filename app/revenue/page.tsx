// READ ONLY — no writes permitted
import { Suspense } from 'react'
import {
  getRevenueByChannel, getCohortAnalysis, getTopOrders,
  getRefundsByChannel, getCommissionVsRevenuByTier, getReferralFunnel, getLTVDistribution
} from '@/lib/queries'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChannelRevenueChart, LTVHistogram, CommissionVsRevenueChart, RefundRateChart
} from '@/components/charts/revenue-charts'
import { formatCurrency, formatPercent, formatNumber, CHANNEL_LABELS } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function ChannelRevenueSection() {
  const data = await getRevenueByChannel()
  return (
    <Card>
      <CardHeader><CardTitle>Revenue & Avg LTV by Channel</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <ChannelRevenueChart data={data} />
      </CardContent>
    </Card>
  )
}

async function LTVSection() {
  const data = await getLTVDistribution()
  return (
    <Card>
      <CardHeader><CardTitle>LTV Distribution</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <LTVHistogram data={data} />
      </CardContent>
    </Card>
  )
}

async function CohortSection() {
  const rows = await getCohortAnalysis()
  return (
    <Card>
      <CardHeader><CardTitle>Cohort Analysis</CardTitle></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#232323] bg-[#111111]">
              {['Cohort', 'Customers', 'Avg LTV', 'Total Revenue', '% Subscribed'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#888580] font-mono">No cohort data</td></tr>
            )}
            {rows.map(row => (
              <tr key={row.month} className="hover:bg-[#1e1e1e]">
                <td className="px-5 py-3 font-medium font-mono text-[#f0ede8]">
                  {new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3 tabular-nums font-mono text-[#f0ede8]">{formatNumber(row.customers)}</td>
                <td className="px-5 py-3 tabular-nums font-mono text-[#f0ede8]">{formatCurrency(row.avg_ltv)}</td>
                <td className="px-5 py-3 tabular-nums font-mono font-semibold text-[#4ade9a]">{formatCurrency(row.total_revenue)}</td>
                <td className="px-5 py-3 tabular-nums">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#232323] rounded-full overflow-hidden max-w-[80px]">
                      <div className="h-full bg-[#4ade9a] rounded-full" style={{ width: `${Math.min(row.pct_subscribed, 100)}%` }} />
                    </div>
                    <span className="font-mono text-[#f0ede8]">{formatPercent(row.pct_subscribed)}</span>
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

async function TopOrdersSection() {
  const orders = await getTopOrders(10)
  return (
    <Card>
      <CardHeader><CardTitle>Top 10 Orders by Value</CardTitle></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#232323] bg-[#111111]">
              {['Rank', 'Order #', 'Customer', 'Date', 'Total'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {orders.map((o, i) => (
              <tr key={o.id} className="hover:bg-[#1e1e1e]">
                <td className="px-5 py-3">
                  <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono"
                    style={{
                      background: i === 0 ? 'rgba(74,222,154,0.2)' : 'rgba(136,133,128,0.12)',
                      color: i === 0 ? '#4ade9a' : '#888580',
                    }}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-[#888580]">{o.order_number}</td>
                <td className="px-5 py-3 text-[#f0ede8]">{o.customer_name}</td>
                <td className="px-5 py-3 text-[#888580] font-mono text-xs">{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-5 py-3 font-bold font-mono text-[#4ade9a]">{formatCurrency(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

async function RefundRateSection() {
  const data = await getRefundsByChannel()
  return (
    <Card>
      <CardHeader><CardTitle>Refund Rate by Channel</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <RefundRateChart data={data} />
      </CardContent>
    </Card>
  )
}

async function CommissionSection() {
  const data = await getCommissionVsRevenuByTier()
  return (
    <Card>
      <CardHeader><CardTitle>Commission vs Revenue by Tier</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <CommissionVsRevenueChart data={data} />
      </CardContent>
    </Card>
  )
}

async function FunnelSection() {
  const funnel = await getReferralFunnel()
  const steps = [
    { label: 'Total Customers', value: funnel.total, color: '#4ade9a' },
    { label: 'Has Referral Code', value: funnel.hasCode, color: '#f5a623' },
    { label: 'Code Used 1+ Times', value: funnel.codeUsedOnce, color: '#60a5fa' },
    { label: 'Code Used 3+ Times', value: funnel.codeUsedThreePlus, color: '#a78bfa' },
  ]
  const max = steps[0].value || 1
  return (
    <Card>
      <CardHeader><CardTitle>Customer Referral Funnel</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#888580] font-mono">{step.label}</span>
                <span className="font-semibold tabular-nums font-mono text-[#f0ede8]">{formatNumber(step.value)}</span>
              </div>
              <div className="h-2 bg-[#222222] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(step.value / max) * 100}%`,
                    background: step.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              {i < steps.length - 1 && (
                <p className="text-xs text-[#888580] mt-1 font-mono">
                  {steps[i + 1].value > 0 ? `${formatPercent((steps[i + 1].value / Math.max(step.value, 1)) * 100)} conversion` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function RevenuePage() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-medium text-[#f0ede8] mb-1">Revenue & Attribution</h1>
        <p className="text-[#888580] text-sm font-mono">Channel performance, LTV analysis, and referral funnel</p>
      </div>

      <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
        <ChannelRevenueSection />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<Skeleton className="h-60 rounded-xl" />}><LTVSection /></Suspense>
        <Suspense fallback={<Skeleton className="h-60 rounded-xl" />}><FunnelSection /></Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
        <CohortSection />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}><CommissionSection /></Suspense>
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}><RefundRateSection /></Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
        <TopOrdersSection />
      </Suspense>
    </div>
  )
}
