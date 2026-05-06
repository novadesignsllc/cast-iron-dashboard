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
  referral_count?: number
  ba_total_commission?: number
  total_orders: number
  net_ltv: number
  klaviyo_predicted_clv?: number
  klaviyo_churn_risk?: ChurnRisk
  subscription_status?: SubscriptionStatus
  origin_source?: OriginSource
  referred_by_customer_id?: string
  origin_ba_id?: string
  klaviyo_email_consent?: boolean
  klaviyo_sms_consent?: boolean
  first_purchase_date?: string
  last_purchase_date?: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  created_at: string
  ordered_at?: string
  total: number
  discount_code?: string
  fulfillment_status?: string
  financial_status?: string
  line_items?: Array<{ qty: number; price: number; product: string }>
}

export interface AmbassadorCommission {
  id: string
  ambassador_id: string
  customer_id: string
  order_id: string
  order_number?: string
  commission_amount: number
  commission_tier?: string
  attribution_method: string
  payout_status: 'paid' | 'pending' | 'reversed'
  earned_at: string
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
