// READ ONLY — no writes permitted
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getCustomerById, getCustomerOrders, getCustomerRefunds,
  getCustomerEmailEngagement, getCustomerDownstreamReferrals,
  getReferredByCustomer, getOriginBA
} from '@/lib/queries'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import {
  formatCurrency, formatDate, formatNumber, CHANNEL_LABELS
} from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', google: '🔍', organic_search: '🌿',
  ba_referral: '⭐', customer_referral: '👥', direct: '🔗',
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const [customer, orders, refunds, emailEng, downstream, referredBy, originBA] = await Promise.all([
    getCustomerById(id),
    getCustomerOrders(id),
    getCustomerRefunds(id),
    getCustomerEmailEngagement(id),
    getCustomerDownstreamReferrals(id),
    getCustomerById(id).then(c => c ? getReferredByCustomer(c.referred_by_customer_id) : null),
    getCustomerById(id).then(c => c ? getOriginBA(c.origin_ba_id) : null),
  ])

  if (!customer) notFound()

  const downstreamRevenue = downstream.reduce((s, c) => s + (c.net_ltv ?? 0), 0)

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-[#888580] hover:text-[#4ade9a] transition-colors font-mono">
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-mono flex-shrink-0"
              style={{
                background: customer.is_ba ? 'rgba(74,222,154,0.15)' : 'rgba(245,166,35,0.12)',
                color: customer.is_ba ? '#4ade9a' : '#f5a623',
              }}>
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-medium text-[#f0ede8]">
                  {customer.first_name} {customer.last_name}
                </h1>
                {customer.is_ba && <Badge variant={customer.ba_tier}>{customer.ba_tier ?? 'BA'}</Badge>}
                {customer.subscription_status && (
                  <Badge variant={customer.subscription_status}>{customer.subscription_status}</Badge>
                )}
                {customer.klaviyo_churn_risk && (
                  <Badge variant={customer.klaviyo_churn_risk}>Churn: {customer.klaviyo_churn_risk}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[#888580] font-mono">
                <span className="flex items-center gap-1.5"><Mail size={14} />{customer.email}</span>
                {customer.phone && <span className="flex items-center gap-1.5"><Phone size={14} />{customer.phone}</span>}
                <span className="flex items-center gap-1.5"><Calendar size={14} />Joined {formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Orders" value={formatNumber(customer.total_orders)} />
        <StatCard label="LTV" value={formatCurrency(customer.net_ltv)} accent />
        <StatCard label="Predicted CLV" value={customer.klaviyo_predicted_clv ? formatCurrency(customer.klaviyo_predicted_clv) : '—'} />
        <StatCard label="Referrals Generated" value={formatNumber(downstream.length)} />
      </div>

      {/* Attribution */}
      <Card>
        <CardHeader><CardTitle>Attribution</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Origin Source</p>
                <p className="text-sm text-[#f0ede8]">
                  {CHANNEL_ICONS[customer.origin_source ?? 'direct'] ?? '🔗'}{' '}
                  {CHANNEL_LABELS[customer.origin_source ?? 'direct'] ?? customer.origin_source ?? 'Direct'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Referred By</p>
                {referredBy ? (
                  <Link href={`/customers/${referredBy.id}`} className="text-sm font-medium text-[#4ade9a] hover:underline">
                    {referredBy.first_name} {referredBy.last_name}
                  </Link>
                ) : <p className="text-sm text-[#888580]">—</p>}
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Origin Ambassador</p>
                {originBA ? (
                  <Link href={`/ambassadors/${originBA.id}`} className="text-sm font-medium text-[#4ade9a] hover:underline">
                    {originBA.first_name} {originBA.last_name}
                  </Link>
                ) : <p className="text-sm text-[#888580]">—</p>}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Their Referral Code</p>
                {customer.ba_referral_code ? (
                  <code className="text-sm font-mono bg-[#111111] px-2 py-1 rounded border border-[#232323] text-[#4ade9a]">
                    {customer.ba_referral_code}
                  </code>
                ) : <p className="text-sm text-[#888580]">No code assigned</p>}
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Code Uses</p>
                <p className="text-sm text-[#f0ede8]">{formatNumber(downstream.length)} people</p>
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Revenue from Referrals</p>
                <p className="text-sm font-semibold text-[#4ade9a] font-mono">{formatCurrency(downstreamRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#232323] flex gap-6">
            <div className="flex items-center gap-2 text-sm text-[#888580]">
              {customer.klaviyo_email_consent ? <CheckCircle2 size={16} className="text-[#4ade9a]" /> : <XCircle size={16} className="text-[#f05a5a]" />}
              Email consent
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888580]">
              {customer.klaviyo_sms_consent ? <CheckCircle2 size={16} className="text-[#4ade9a]" /> : <XCircle size={16} className="text-[#f05a5a]" />}
              SMS consent
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader><CardTitle>Order History ({orders.length})</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#232323] bg-[#111111]">
                {['Order #', 'Date', 'Total', 'Discount', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232323]">
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[#888580] font-mono">No orders</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#888580]">{o.order_number}</td>
                  <td className="px-5 py-3 text-[#888580] font-mono text-xs">{formatDate(o.created_at)}</td>
                  <td className="px-5 py-3 font-semibold font-mono text-[#f0ede8]">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3 text-xs text-[#888580] font-mono">{o.discount_code ?? '—'}</td>
                  <td className="px-5 py-3"><Badge variant={o.fulfillment_status?.toLowerCase()}>{o.fulfillment_status ?? o.financial_status ?? 'unknown'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Refunds */}
      {refunds.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Refunds ({refunds.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#232323] bg-[#111111]">
                  {['Date', 'Amount', 'Reason'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232323]">
                {refunds.map(r => (
                  <tr key={r.id} className="hover:bg-[#1e1e1e]">
                    <td className="px-5 py-3 text-[#888580] font-mono text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3 font-semibold font-mono text-[#f05a5a]">{formatCurrency(r.amount)}</td>
                    <td className="px-5 py-3 text-xs text-[#888580]">{r.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Email Engagement */}
      {emailEng && (
        <Card>
          <CardHeader><CardTitle>Email Engagement</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Total Opens</p>
                <p className="text-2xl font-semibold font-mono text-[#f0ede8]">{emailEng.total_opens}</p>
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Total Clicks</p>
                <p className="text-2xl font-semibold font-mono text-[#f0ede8]">{emailEng.total_clicks}</p>
              </div>
              <div>
                <p className="text-xs text-[#888580] uppercase tracking-widest mb-1 font-mono">Last Engaged</p>
                <p className="text-sm font-mono text-[#f0ede8]">{formatDate(emailEng.last_opened_at ?? emailEng.last_clicked_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Downstream Referrals */}
      {downstream.length > 0 && (
        <Card>
          <CardHeader><CardTitle>People They Referred ({downstream.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#232323] bg-[#111111]">
                  {['Name', 'Joined', 'Orders', 'LTV', 'Subscription'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#888580] uppercase tracking-widest font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232323]">
                {downstream.map(c => (
                  <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${c.id}`} className="font-medium text-[#f0ede8] hover:text-[#4ade9a] transition-colors">
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#888580] font-mono text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3 tabular-nums font-mono text-[#f0ede8]">{c.total_orders}</td>
                    <td className="px-5 py-3 font-semibold font-mono text-[#4ade9a]">{formatCurrency(c.net_ltv)}</td>
                    <td className="px-5 py-3">
                      {c.subscription_status ? <Badge variant={c.subscription_status}>{c.subscription_status}</Badge> : <span className="text-[#888580]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
