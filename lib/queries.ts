// READ ONLY — no writes permitted
import { createServerClient } from './supabase'
import type {
  Customer, Order, AmbassadorCommission, Refund,
  EmailEngagement, SyncLog, BaWithNetwork, ReferralTreeNode,
  OverviewStats, RevenueByMonth, ChannelBreakdown, CohortRow
} from './types'

// ─── Overview ────────────────────────────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStats> {
  const db = createServerClient()
  const [revenue, customers, bas, commissions] = await Promise.all([
    db.from('orders').select('total_price').then(r => r.data),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('customers').select('id', { count: 'exact', head: true }).eq('is_ba', true).eq('ba_status', 'active'),
    db.from('customers').select('ba_commission_paid').eq('is_ba', true).then(r => r.data),
  ])
  return {
    totalRevenue: (revenue ?? []).reduce((s, o) => s + (o.total_price ?? 0), 0),
    totalCustomers: customers.count ?? 0,
    totalActiveBAs: bas.count ?? 0,
    totalCommissionsPaid: (commissions ?? []).reduce((s, c) => s + (c.ba_commission_paid ?? 0), 0),
  }
}

export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
  const db = createServerClient()
  const { data } = await db
    .from('orders')
    .select('created_at, total_price, customer_id')
    .order('created_at', { ascending: true })
  if (!data) return []

  const byMonth: Record<string, { revenue: number; customers: Set<string> }> = {}
  for (const o of data) {
    const key = o.created_at.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = { revenue: 0, customers: new Set() }
    byMonth[key].revenue += o.total_price ?? 0
    byMonth[key].customers.add(o.customer_id)
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, d]) => ({ month, revenue: d.revenue, customers: d.customers.size }))
}

export async function getChannelBreakdown(): Promise<ChannelBreakdown[]> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('origin_source, net_ltv')
    .gt('total_orders', 0)
  if (!data) return []

  const byChannel: Record<string, { customers: number; total: number }> = {}
  for (const c of data) {
    const src = c.origin_source ?? 'direct'
    if (!byChannel[src]) byChannel[src] = { customers: 0, total: 0 }
    byChannel[src].customers++
    byChannel[src].total += c.net_ltv ?? 0
  }
  return Object.entries(byChannel)
    .map(([origin_source, d]) => ({
      origin_source,
      customers: d.customers,
      total_revenue: d.total,
      avg_ltv: d.customers > 0 ? d.total / d.customers : 0,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
}

export async function getRecentOrders(limit = 10): Promise<(Order & { customer_name: string })[]> {
  const db = createServerClient()
  const { data } = await db
    .from('orders')
    .select('*, customers(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data) return []
  return data.map((o: Record<string, unknown>) => {
    const c = o.customers as { first_name: string; last_name: string } | null
    return {
      ...o,
      customers: undefined,
      customer_name: c ? `${c.first_name} ${c.last_name}` : 'Unknown',
    } as unknown as Order & { customer_name: string }
  })
}

export async function getSyncStatus(): Promise<SyncLog[]> {
  const db = createServerClient()
  const { data } = await db
    .from('sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50)
  return (data ?? []) as SyncLog[]
}

export async function getTopBasByNetworkRevenue(limit = 5): Promise<BaWithNetwork[]> {
  const db = createServerClient()
  const { data, error } = await db.rpc('get_ba_network_stats').limit(limit)
  if (error || !data) {
    // Fallback: simple query without RPC
    const { data: bas } = await db
      .from('customers')
      .select('*')
      .eq('is_ba', true)
      .order('ba_total_commission', { ascending: false })
      .limit(limit)
    return (bas ?? []).map(b => ({
      ...b,
      network_size: b.ba_referral_count ?? 0,
      network_revenue: b.net_ltv ?? 0,
      direct_revenue: b.net_ltv ?? 0,
      true_network_cac: 0,
      network_roi: 0,
      avg_referral_ltv: 0,
    })) as BaWithNetwork[]
  }
  return data as BaWithNetwork[]
}

// ─── Ambassadors ─────────────────────────────────────────────────────────────

export async function getAllBAsWithNetwork(): Promise<BaWithNetwork[]> {
  const db = createServerClient()

  // Main BA query using referral_chains view
  const { data: bas } = await db
    .from('customers')
    .select('*')
    .eq('is_ba', true)
    .order('ba_total_commission', { ascending: false })

  if (!bas || bas.length === 0) return []

  // Get network sizes from referral_chains view
  const { data: chains } = await db
    .from('referral_chains')
    .select('origin_ba_id, customer_id, net_ltv')

  const networkMap: Record<string, { size: number; revenue: number; ltvs: number[] }> = {}
  for (const chain of chains ?? []) {
    if (!chain.origin_ba_id) continue
    if (!networkMap[chain.origin_ba_id]) networkMap[chain.origin_ba_id] = { size: 0, revenue: 0, ltvs: [] }
    networkMap[chain.origin_ba_id].size++
    networkMap[chain.origin_ba_id].revenue += chain.net_ltv ?? 0
    networkMap[chain.origin_ba_id].ltvs.push(chain.net_ltv ?? 0)
  }

  // Get direct revenue per BA
  const { data: directOrders } = await db
    .from('orders')
    .select('origin_ba_id, total_price, referred_by_customer_id')
    .not('origin_ba_id', 'is', null)

  const directRevMap: Record<string, number> = {}
  for (const o of directOrders ?? []) {
    if (!o.origin_ba_id) continue
    directRevMap[o.origin_ba_id] = (directRevMap[o.origin_ba_id] ?? 0) + (o.total_price ?? 0)
  }

  return bas.map(ba => {
    const net = networkMap[ba.id] ?? { size: 0, revenue: 0, ltvs: [] }
    const commission = ba.ba_total_commission ?? 0
    const avgLtv = net.ltvs.length > 0 ? net.ltvs.reduce((a, b) => a + b, 0) / net.ltvs.length : 0
    return {
      ...ba,
      network_size: net.size,
      network_revenue: net.revenue,
      direct_revenue: directRevMap[ba.id] ?? 0,
      true_network_cac: net.size > 0 ? commission / net.size : 0,
      network_roi: commission > 0 ? net.revenue / commission : 0,
      avg_referral_ltv: avgLtv,
    } as BaWithNetwork
  })
}

export async function getBAById(id: string): Promise<Customer | null> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  return (data as Customer) ?? null
}

export async function getBACommissions(baId: string): Promise<AmbassadorCommission[]> {
  const db = createServerClient()
  const { data } = await db
    .from('ambassador_commissions')
    .select('*, referred_customer:referred_customer_id(first_name, last_name), orders(order_number)')
    .eq('ba_customer_id', baId)
    .order('created_at', { ascending: false })
  if (!data) return []
  return data.map((c: Record<string, unknown>) => {
    const customer = c.referred_customer as { first_name: string; last_name: string } | null
    const order = c.orders as { order_number: string } | null
    return {
      ...c,
      referred_customer: undefined,
      orders: undefined,
      referred_customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
      order_number: order?.order_number,
    } as unknown as AmbassadorCommission
  })
}

export async function getReferralTree(baId: string): Promise<ReferralTreeNode[]> {
  const db = createServerClient()
  // Use raw SQL via rpc or fall back to referral_chains view
  const { data } = await db
    .from('referral_chains')
    .select('customer_id, origin_ba_id, depth, path, customers(first_name, last_name, net_ltv, is_ba, ba_tier, referred_by_customer_id)')
    .eq('origin_ba_id', baId)
    .order('depth', { ascending: true })

  if (!data) return []

  return data.map((row: Record<string, unknown>) => {
    const c = row.customers as { first_name: string; last_name: string; net_ltv: number; is_ba: boolean; ba_tier: string; referred_by_customer_id: string } | null
    return {
      id: row.customer_id as string,
      first_name: c?.first_name ?? '',
      last_name: c?.last_name ?? '',
      net_ltv: c?.net_ltv ?? 0,
      referred_by_customer_id: c?.referred_by_customer_id,
      origin_ba_id: row.origin_ba_id as string,
      depth: row.depth as number,
      path: (row.path as string[]) ?? [],
      is_ba: c?.is_ba ?? false,
      ba_tier: c?.ba_tier as string,
    } as ReferralTreeNode
  })
}

export async function getBADirectReferrals(baId: string): Promise<Customer[]> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('*')
    .eq('referred_by_customer_id', baId)
    .order('first_purchase_date', { ascending: false })
  return (data ?? []) as Customer[]
}

export async function getBANetworkStats(baId: string): Promise<{
  network_size: number
  network_revenue: number
  direct_revenue: number
  true_network_cac: number
  network_roi: number
}> {
  const db = createServerClient()
  const [chainData, orderData, baData] = await Promise.all([
    db.from('referral_chains').select('customer_id, net_ltv').eq('origin_ba_id', baId),
    db.from('orders').select('total_price').eq('origin_ba_id', baId),
    db.from('customers').select('ba_total_commission').eq('id', baId).single(),
  ])

  const networkSize = chainData.data?.length ?? 0
  const networkRevenue = (chainData.data ?? []).reduce((s, r) => s + (r.net_ltv ?? 0), 0)
  const directRevenue = (orderData.data ?? []).reduce((s, o) => s + (o.total_price ?? 0), 0)
  const commission = baData.data?.ba_total_commission ?? 0

  return {
    network_size: networkSize,
    network_revenue: networkRevenue,
    direct_revenue: directRevenue,
    true_network_cac: networkSize > 0 ? commission / networkSize : 0,
    network_roi: commission > 0 ? networkRevenue / commission : 0,
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getAllCustomers(): Promise<Customer[]> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Customer[]
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  return (data as Customer) ?? null
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const db = createServerClient()
  const { data } = await db
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Order[]
}

export async function getCustomerRefunds(customerId: string): Promise<Refund[]> {
  const db = createServerClient()
  const { data } = await db
    .from('refunds')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Refund[]
}

export async function getCustomerEmailEngagement(customerId: string): Promise<EmailEngagement | null> {
  const db = createServerClient()
  const { data } = await db
    .from('email_engagement')
    .select('*')
    .eq('customer_id', customerId)
    .single()
  return (data as EmailEngagement) ?? null
}

export async function getCustomerDownstreamReferrals(customerId: string): Promise<Customer[]> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('*')
    .eq('referred_by_customer_id', customerId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Customer[]
}

export async function getReferredByCustomer(referredById: string | undefined): Promise<Customer | null> {
  if (!referredById) return null
  return getCustomerById(referredById)
}

export async function getOriginBA(originBAId: string | undefined): Promise<Customer | null> {
  if (!originBAId) return null
  return getCustomerById(originBAId)
}

// ─── Revenue ─────────────────────────────────────────────────────────────────

export async function getRevenueByChannel(): Promise<ChannelBreakdown[]> {
  return getChannelBreakdown()
}

export async function getCohortAnalysis(): Promise<CohortRow[]> {
  const db = createServerClient()
  const { data } = await db
    .from('customers')
    .select('first_purchase_date, net_ltv, subscription_status')
    .not('first_purchase_date', 'is', null)
    .gt('total_orders', 0)

  if (!data) return []

  const byCohort: Record<string, { ltvs: number[]; subscribed: number }> = {}
  for (const c of data) {
    const month = c.first_purchase_date!.slice(0, 7)
    if (!byCohort[month]) byCohort[month] = { ltvs: [], subscribed: 0 }
    byCohort[month].ltvs.push(c.net_ltv ?? 0)
    if (c.subscription_status === 'active') byCohort[month].subscribed++
  }

  return Object.entries(byCohort)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      customers: d.ltvs.length,
      avg_ltv: d.ltvs.length > 0 ? d.ltvs.reduce((a, b) => a + b, 0) / d.ltvs.length : 0,
      total_revenue: d.ltvs.reduce((a, b) => a + b, 0),
      pct_subscribed: d.ltvs.length > 0 ? (d.subscribed / d.ltvs.length) * 100 : 0,
    }))
}

export async function getTopOrders(limit = 10): Promise<(Order & { customer_name: string })[]> {
  const db = createServerClient()
  const { data } = await db
    .from('orders')
    .select('*, customers(first_name, last_name)')
    .order('total_price', { ascending: false })
    .limit(limit)
  if (!data) return []
  return data.map((o: Record<string, unknown>) => {
    const c = o.customers as { first_name: string; last_name: string } | null
    return {
      ...o,
      customers: undefined,
      customer_name: c ? `${c.first_name} ${c.last_name}` : 'Unknown',
    } as unknown as Order & { customer_name: string }
  })
}

export async function getRefundsByChannel(): Promise<{ origin_source: string; refund_rate: number; total_refunds: number }[]> {
  const db = createServerClient()
  const [{ data: orders }, { data: refunds }] = await Promise.all([
    db.from('orders').select('customer_id, total_price'),
    db.from('refunds').select('customer_id, amount'),
  ])
  const { data: customers } = await db.from('customers').select('id, origin_source')

  const sourceMap: Record<string, string> = {}
  for (const c of customers ?? []) {
    sourceMap[c.id] = c.origin_source ?? 'direct'
  }

  const byChannel: Record<string, { revenue: number; refunds: number; orders: number }> = {}
  for (const o of orders ?? []) {
    const src = sourceMap[o.customer_id] ?? 'direct'
    if (!byChannel[src]) byChannel[src] = { revenue: 0, refunds: 0, orders: 0 }
    byChannel[src].revenue += o.total_price ?? 0
    byChannel[src].orders++
  }
  for (const r of refunds ?? []) {
    const src = sourceMap[r.customer_id] ?? 'direct'
    if (!byChannel[src]) byChannel[src] = { revenue: 0, refunds: 0, orders: 0 }
    byChannel[src].refunds += r.amount ?? 0
  }

  return Object.entries(byChannel)
    .map(([origin_source, d]) => ({
      origin_source,
      total_refunds: d.refunds,
      refund_rate: d.revenue > 0 ? (d.refunds / d.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.total_refunds - a.total_refunds)
}

export async function getCommissionVsRevenuByTier(): Promise<{ tier: string; commission: number; revenue: number }[]> {
  const db = createServerClient()
  const { data: bas } = await db
    .from('customers')
    .select('id, ba_tier, ba_total_commission')
    .eq('is_ba', true)

  const { data: chains } = await db
    .from('referral_chains')
    .select('origin_ba_id, net_ltv')

  const revenueByBA: Record<string, number> = {}
  for (const c of chains ?? []) {
    if (!c.origin_ba_id) continue
    revenueByBA[c.origin_ba_id] = (revenueByBA[c.origin_ba_id] ?? 0) + (c.net_ltv ?? 0)
  }

  const byTier: Record<string, { commission: number; revenue: number }> = {}
  for (const ba of bas ?? []) {
    const tier = ba.ba_tier ?? 'Standard'
    if (!byTier[tier]) byTier[tier] = { commission: 0, revenue: 0 }
    byTier[tier].commission += ba.ba_total_commission ?? 0
    byTier[tier].revenue += revenueByBA[ba.id] ?? 0
  }

  return Object.entries(byTier).map(([tier, d]) => ({ tier, ...d }))
}

export async function getReferralFunnel(): Promise<{
  total: number
  hasCode: number
  codeUsedOnce: number
  codeUsedThreePlus: number
}> {
  const db = createServerClient()
  const [{ count: total }, { data: codes }] = await Promise.all([
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('referral_codes').select('uses_count'),
  ])

  const hasCode = codes?.length ?? 0
  const codeUsedOnce = (codes ?? []).filter(c => (c.uses_count ?? 0) >= 1).length
  const codeUsedThreePlus = (codes ?? []).filter(c => (c.uses_count ?? 0) >= 3).length

  return { total: total ?? 0, hasCode, codeUsedOnce, codeUsedThreePlus }
}

export async function getLTVDistribution(): Promise<{ bucket: string; count: number }[]> {
  const db = createServerClient()
  const { data } = await db.from('customers').select('net_ltv').gt('total_orders', 0)
  if (!data) return []

  const buckets: Record<string, number> = {
    '$0–50': 0, '$50–100': 0, '$100–200': 0, '$200–500': 0, '$500–1000': 0, '$1000+': 0,
  }
  for (const c of data) {
    const v = c.net_ltv ?? 0
    if (v < 50) buckets['$0–50']++
    else if (v < 100) buckets['$50–100']++
    else if (v < 200) buckets['$100–200']++
    else if (v < 500) buckets['$200–500']++
    else if (v < 1000) buckets['$500–1000']++
    else buckets['$1000+']++
  }
  return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }))
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function getSyncLogs(limit = 20): Promise<SyncLog[]> {
  const db = createServerClient()
  const { data } = await db
    .from('sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as SyncLog[]
}

export async function getLastSyncPerSource(): Promise<SyncLog[]> {
  const db = createServerClient()
  const { data } = await db
    .from('sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(100)
  if (!data) return []

  const seen = new Set<string>()
  const result: SyncLog[] = []
  for (const log of data) {
    const key = `${log.source}:${log.sync_type}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push(log as SyncLog)
    }
  }
  return result
}
