// READ ONLY — no writes permitted
import { Suspense } from 'react'
import Link from 'next/link'
import {
  getOverviewStats, getRevenueByMonth, getChannelBreakdown,
  getRecentOrders, getLastSyncPerSource, getTopBasByNetworkRevenue
} from '@/lib/queries'
import { StatCard } from '@/components/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RevenueChart, CustomersChart } from '@/components/charts/revenue-chart'
import { ChannelPieChart } from '@/components/charts/channel-pie'
import { formatCurrency, formatDate, formatNumber, timeAgo } from '@/lib/utils'
import { DollarSign, Users, Star, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function OverviewStats() {
  const stats = await getOverviewStats()
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} accent icon={<DollarSign size={18} />} />
      <StatCard label="Total Customers" value={formatNumber(stats.totalCustomers)} icon={<Users size={18} />} />
      <StatCard label="Active Ambassadors" value={formatNumber(stats.totalActiveBAs)} icon={<Star size={18} />} />
      <StatCard label="Commissions Paid" value={formatCurrency(stats.totalCommissionsPaid)} icon={<TrendingUp size={18} />} />
    </div>
  )
}

async function RevenueSection() {
  const data = await getRevenueByMonth()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Revenue by Month</CardTitle></CardHeader>
        <CardContent className="pt-4"><RevenueChart data={data} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>New Customers by Month</CardTitle></CardHeader>
        <CardContent className="pt-4"><CustomersChart data={data} /></CardContent>
      </Card>
    </div>
  )
}

async function ChannelSection() {
  const data = await getChannelBreakdown()
  return (
    <Card>
      <CardHeader><CardTitle>Acquisition Channel Breakdown</CardTitle></CardHeader>
      <CardContent className="pt-4"><ChannelPieChart data={data} /></CardContent>
    </Card>
  )
}

async function TopBASection() {
  const bas = await getTopBasByNetworkRevenue(5)
  return (
    <Card>
      <CardHeader><CardTitle>Top Ambassadors by Revenue</CardTitle></CardHeader>
      <div className="divide-y divide-[#232323]">
        {bas.length === 0 && (
          <div className="px-6 py-8 text-center text-[#888580] text-sm font-mono">No ambassador data</div>
        )}
        {bas.map((ba, i) => (
          <Link key={ba.id} href={`/ambassadors/${ba.id}`}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#1e1e1e] transition-colors">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono"
              style={{
                background: i === 0 ? 'rgba(74,222,154,0.2)' : 'rgba(136,133,128,0.15)',
                color: i === 0 ? '#4ade9a' : '#888580',
              }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f0ede8] truncate">{ba.first_name} {ba.last_name}</p>
              <p className="text-xs text-[#888580] font-mono">{ba.ba_tier ?? 'Standard'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#f0ede8] font-mono">{formatCurrency(ba.network_revenue)}</p>
              <p className="text-xs text-[#888580] font-mono">network revenue</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

async function RecentOrdersSection() {
  const orders = await getRecentOrders(10)
  return (
    <Card>
      <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#232323]">
              {['Order #', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232323]">
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-[#888580] font-mono">No orders found</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-6 py-3 font-mono text-xs text-[#888580]">{o.order_number}</td>
                <td className="px-6 py-3 text-[#f0ede8]">{o.customer_name}</td>
                <td className="px-6 py-3 text-[#888580] font-mono text-xs">{formatDate(o.created_at)}</td>
                <td className="px-6 py-3 font-semibold text-[#f0ede8] font-mono">{formatCurrency(o.total)}</td>
                <td className="px-6 py-3"><Badge variant={o.fulfillment_status?.toLowerCase()}>{o.fulfillment_status ?? o.financial_status ?? 'unknown'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

async function SyncHealthSection() {
  const logs = await getLastSyncPerSource()
  return (
    <Card>
      <CardHeader><CardTitle>Sync Health</CardTitle></CardHeader>
      <div className="divide-y divide-[#232323]">
        {logs.length === 0 && (
          <div className="px-6 py-8 text-center text-[#888580] text-sm font-mono">No sync data</div>
        )}
        {logs.map(log => (
          <div key={log.id} className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm text-[#f0ede8]">{log.source}</p>
              <p className="text-xs text-[#888580] font-mono">{log.sync_type} · {timeAgo(log.completed_at ?? log.started_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              {log.records_processed != null && (
                <span className="text-xs text-[#888580] font-mono">{formatNumber(log.records_processed)} records</span>
              )}
              <Badge variant={log.status}>{log.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function OverviewPage() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-medium text-[#f0ede8] mb-1">Overview</h1>
        <p className="text-[#888580] text-sm font-mono">Cast Iron Nutrition · Internal Analytics</p>
      </div>
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>}>
        <OverviewStats />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-2 gap-4"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>}>
        <RevenueSection />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}><ChannelSection /></Suspense>
        </div>
        <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}><TopBASection /></Suspense>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}><RecentOrdersSection /></Suspense>
      <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}><SyncHealthSection /></Suspense>
    </div>
  )
}
