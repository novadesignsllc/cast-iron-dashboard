// READ ONLY — no writes permitted

export type BaTier = 'Founder' | 'Growth' | 'Standard'
export type BaStatus = 'active' | 'paused' | 'churned'
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'none'
export type ChurnRisk = 'low' | 'medium' | 'high'
export type OriginSource =
  | 'instagram'
  | 'tiktok'
  | 'google'
  | 'organic_search'
  | 'ba_referral'
  | 'customer_referral'
  | 'direct'
  | string

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  created_at: string
  is_ba: boolean
  ba_tier?: BaTier
  ba_status?: BaStatus
  ba_referral_code?: string
  ba_referral_count?: number
  ba_total_commission?: number
  ba_commission_paid?: number
  ba_commission_pending?: number
  total_orders: number
  net_ltv: number
  predicted_clv?: number
  churn_risk?: ChurnRisk
  subscription_status?: SubscriptionStatus
  origin_source?: OriginSource
  referred_by_customer_id?: string
  origin_ba_id?: string
  email_consent: boolean
  sms_consent: boolean
  first_purchase_date?: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  created_at: string
  total_price: number
  discount_codes?: string
  status: string
  line_items?: Array<{ title: string; quantity: number; price: number }>
  origin_ba_id?: string
  referred_by_customer_id?: string
}

export interface ReferralCode {
  id: string
  customer_id: string
  code: string
  created_at: string
  uses_count: number
  total_revenue_generated: number
}

export interface AmbassadorCommission {
  id: string
  ba_customer_id: string
  referred_customer_id: string
  order_id: string
  order_number?: string
  amount: number
  attribution_method: string
  status: 'paid' | 'pending' | 'reversed'
  created_at: string
  paid_at?: string
  referred_customer_name?: string
}

export interface Refund {
  id: string
  order_id: string
  customer_id: string
  amount: number
  reason?: string
  created_at: string
}

export interface EmailEngagement {
  customer_id: string
  total_opens: number
  total_clicks: number
  last_opened_at?: string
  last_clicked_at?: string
}

export interface SyncLog {
  id: string
  source: string
  sync_type: string
  status: 'success' | 'failed' | 'pending'
  records_processed?: number
  records_created?: number
  records_updated?: number
  error_message?: string
  started_at: string
  completed_at?: string
}

export interface BaWithNetwork extends Customer {
  network_size: number
  network_revenue: number
  direct_revenue: number
  true_network_cac: number
  network_roi: number
  avg_referral_ltv: number
}

export interface ReferralTreeNode {
  id: string
  first_name: string
  last_name: string
  net_ltv: number
  referred_by_customer_id?: string
  origin_ba_id?: string
  depth: number
  path: string[]
  is_ba?: boolean
  ba_tier?: BaTier
}

export interface OverviewStats {
  totalRevenue: number
  totalCustomers: number
  totalActiveBAs: number
  totalCommissionsPaid: number
}

export interface RevenueByMonth {
  month: string
  revenue: number
  customers: number
}

export interface ChannelBreakdown {
  origin_source: string
  customers: number
  total_revenue: number
  avg_ltv: number
}

export interface CohortRow {
  month: string
  customers: number
  avg_ltv: number
  total_revenue: number
  pct_subscribed: number
}
