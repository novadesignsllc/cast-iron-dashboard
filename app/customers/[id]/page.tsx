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
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#B87333] transition-colors">
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ background: customer.is_ba ? '#B87333' : '#4A7C59' }}>
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-[#1C1C1C]" style={{ fontFamily: 'Playfair Display, serif' }}>
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
              <div className="flex flex-wrap gap-4 text-sm text-[#6B6B6B]">
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
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Origin Source</p>
                <p className="text-sm font-medium">
                  {CHANNEL_ICONS[customer.origin_source ?? 'direct'] ?? '🔗'}{' '}
                  {CHANNEL_LABELS[customer.origin_source ?? 'direct'] ?? customer.origin_source ?? 'Direct'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Referred By</p>
                {referredBy ? (
                  <Link href={`/customers/${referredBy.id}`} className="text-sm font-medium text-[#B87333] hover:underline">
                    {referredBy.first_name} {referredBy.last_name}
                  </Link>
                ) : <p className="text-sm text-[#6B6B6B]">—</p>}
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Origin Ambassador</p>
                {originBA ? (
                  <Link href={`/ambassadors/${originBA.id}`} className="text-sm font-medium text-[#B87333] hover:underline">
                    {originBA.first_name} {originBA.last_name}
                  </Link>
                ) : <p className="text-sm text-[#6B6B6B]">—</p>}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Their Referral Code</p>
                {customer.ba_referral_code ? (
                  <code className="text-sm font-mono bg-[#F9F6F1] px-2 py-1 rounded border border-[#E5E0D8]">
                    {customer.ba_referral_code}
                  </code>
                ) : <p className="text-sm text-[#6B6B6B]">No code assigned</p>}
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Code Uses</p>
                <p className="text-sm font-medium">{formatNumber(downstream.length)} people</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Revenue from Referrals</p>
                <p className="text-sm font-semibold text-[#B87333]">{formatCurrency(downstreamRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5E0D8] flex gap-6">
            <div className="flex items-center gap-2 text-sm">
              {customer.klaviyo_email_consent ? <CheckCircle2 size={16} className="text-[#4A7C59]" /> : <XCircle size={16} className="text-[#C0392B]" />}
              Email consent
            </div>
            <div className="flex items-center gap-2 text-sm">
              {customer.klaviyo_sms_consent ? <CheckCircle2 size={16} className="text-[#4A7C59]" /> : <XCircle size={16} className="text-[#C0392B]" />}
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
              <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
                {['Order #', 'Date', 'Total', 'Discount', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[#6B6B6B]">No orders</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#F9F6F1] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#6B6B6B]">{o.order_number}</td>
                  <td className="px-5 py-3 text-[#6B6B6B]">{formatDate(o.created_at)}</td>
                  <td className="px-5 py-3 font-semibold">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3 text-xs text-[#6B6B6B] font-mono">{o.discount_code ?? '—'}</td>
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
                <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
                  {['Date', 'Amount', 'Reason'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {refunds.map(r => (
                  <tr key={r.id} className="hover:bg-[#F9F6F1]">
                    <td className="px-5 py-3 text-[#6B6B6B]">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3 font-semibold text-[#C0392B]">{formatCurrency(r.amount)}</td>
                    <td className="px-5 py-3 text-xs text-[#6B6B6B]">{r.reason ?? '—'}</td>
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
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Total Opens</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{emailEng.total_opens}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Total Clicks</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{emailEng.total_clicks}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">Last Engaged</p>
                <p className="text-sm font-medium">{formatDate(emailEng.last_opened_at ?? emailEng.last_clicked_at)}</p>
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
                <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
                  {['Name', 'Joined', 'Orders', 'LTV', 'Subscription'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {downstream.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9F6F1] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${c.id}`} className="font-medium text-[#1C1C1C] hover:text-[#B87333] transition-colors">
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#6B6B6B]">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3 tabular-nums">{c.total_orders}</td>
                    <td className="px-5 py-3 font-semibold">{formatCurrency(c.net_ltv)}</td>
                    <td className="px-5 py-3">
                      {c.subscription_status ? <Badge variant={c.subscription_status}>{c.subscription_status}</Badge> : '—'}
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
