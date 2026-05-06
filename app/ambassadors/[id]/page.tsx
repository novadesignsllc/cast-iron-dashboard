// READ ONLY — no writes permitted
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getBAById, getBACommissions, getReferralTree,
  getBADirectReferrals, getBANetworkStats
} from '@/lib/queries'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { ReferralTree } from './referral-tree'
import { formatCurrency, formatDate, formatNumber, formatRatio } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BADetailPage({ params }: Props) {
  const { id } = await params
  const [ba, commissions, treeNodes, directReferrals, netStats] = await Promise.all([
    getBAById(id),
    getBACommissions(id),
    getReferralTree(id),
    getBADirectReferrals(id),
    getBANetworkStats(id),
  ])

  if (!ba || !ba.is_ba) notFound()

  const totalCommission = ba.ba_total_commission ?? 0
  const paidCommission = commissions.filter(c => c.payout_status === 'paid').reduce((s, c) => s + c.commission_amount, 0)
  const pendingCommission = commissions.filter(c => c.payout_status === 'pending').reduce((s, c) => s + c.commission_amount, 0)

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <Link href="/ambassadors" className="inline-flex items-center gap-2 text-sm text-[#888580] hover:text-[#4ade9a] transition-colors">
        <ArrowLeft size={16} />
        Back to Leaderboard
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-mono flex-shrink-0"
              style={{ background: 'rgba(74,222,154,0.15)', color: '#4ade9a' }}
            >
              {ba.first_name[0]}{ba.last_name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-medium text-[#f0ede8]">
                  {ba.first_name} {ba.last_name}
                </h1>
                <Badge variant={ba.ba_tier}>{ba.ba_tier ?? 'Standard'}</Badge>
                <Badge variant={ba.ba_status}>{ba.ba_status ?? 'unknown'}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[#888580]">
                {ba.email && <span className="flex items-center gap-1.5"><Mail size={14} />{ba.email}</span>}
                {ba.phone && <span className="flex items-center gap-1.5"><Phone size={14} />{ba.phone}</span>}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Joined {formatDate(ba.created_at)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#888580] uppercase tracking-widest mb-1">True Network CAC</p>
              <p className="text-3xl font-semibold font-mono text-[#4ade9a]">
                {formatCurrency(netStats.true_network_cac)}
              </p>
              <p className="text-xs text-[#888580]">per network customer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Their LTV" value={formatCurrency(ba.net_ltv)} />
        <StatCard label="Direct Referrals" value={formatNumber(ba.ba_referral_count ?? 0)} />
        <StatCard label="Network Size" value={formatNumber(netStats.network_size)} />
        <StatCard label="Network Revenue" value={formatCurrency(netStats.network_revenue)} accent />
        <StatCard label="Network ROI" value={formatRatio(netStats.network_roi)} accent={netStats.network_roi >= 3} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Total Orders" value={formatNumber(ba.total_orders)} />
        <StatCard label="Total Commission" value={formatCurrency(totalCommission)} />
        <StatCard label="Commission Paid" value={formatCurrency(paidCommission)} />
        <StatCard label="Pending Commission" value={formatCurrency(pendingCommission)} />
      </div>

      {/* Referral Tree */}
      <Card>
        <CardHeader><CardTitle>Referral Network Tree</CardTitle></CardHeader>
        <CardContent>
          <ReferralTree baId={id} nodes={treeNodes} />
        </CardContent>
      </Card>

      {/* Commission History */}
      <Card>
        <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#232323] bg-[#111111]">
                {['Date', 'Customer', 'Order #', 'Amount', 'Attribution', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232323]">
              {commissions.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[#888580]">No commission history</td></tr>
              )}
              {commissions.map(c => (
                <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-5 py-3 text-[#888580] font-mono text-xs">{formatDate(c.earned_at)}</td>
                  <td className="px-5 py-3 text-[#f0ede8]">{c.referred_customer_name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#888580]">{c.order_number ?? '—'}</td>
                  <td className="px-5 py-3 font-semibold font-mono text-[#f0ede8]">{formatCurrency(c.commission_amount)}</td>
                  <td className="px-5 py-3 text-xs text-[#888580]">{c.attribution_method}</td>
                  <td className="px-5 py-3"><Badge variant={c.payout_status}>{c.payout_status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Direct Referrals Table */}
      <Card>
        <CardHeader><CardTitle>Direct Referrals ({directReferrals.length})</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#232323] bg-[#111111]">
                {['Name', 'First Order', 'Orders', 'LTV', 'Subscription', 'Their Referrals'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232323]">
              {directReferrals.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[#888580]">No direct referrals yet</td></tr>
              )}
              {directReferrals.map(c => (
                <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${c.id}`} className="font-medium text-[#f0ede8] hover:text-[#4ade9a] transition-colors">
                      {c.first_name} {c.last_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#888580] font-mono text-xs">{formatDate(c.first_purchase_date)}</td>
                  <td className="px-5 py-3 tabular-nums font-mono text-[#f0ede8]">{c.total_orders}</td>
                  <td className="px-5 py-3 font-semibold tabular-nums font-mono text-[#4ade9a]">{formatCurrency(c.net_ltv)}</td>
                  <td className="px-5 py-3">
                    {c.subscription_status
                      ? <Badge variant={c.subscription_status}>{c.subscription_status}</Badge>
                      : <span className="text-[#888580] text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3 tabular-nums font-mono text-[#f0ede8]">{c.ba_referral_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
