// READ ONLY — no writes permitted
import { Suspense } from 'react'
import { getAllCustomers, getCustomerById } from '@/lib/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomerTable } from './customer-table'
import type { Customer } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function CustomerData() {
  const customers = await getAllCustomers()

  const referrerIds = [...new Set(customers.map(c => c.referred_by_customer_id).filter(Boolean) as string[])]
  const originBAIds = [...new Set(customers.map(c => c.origin_ba_id).filter(Boolean) as string[])]

  const allLookupIds = [...new Set([...referrerIds, ...originBAIds])]
  const lookupMap: Record<string, Customer> = {}
  await Promise.all(
    allLookupIds.map(async id => {
      const c = await getCustomerById(id)
      if (c) lookupMap[id] = c
    })
  )

  const enriched = customers.map(c => ({
    ...c,
    referred_by_name: c.referred_by_customer_id && lookupMap[c.referred_by_customer_id]
      ? `${lookupMap[c.referred_by_customer_id].first_name} ${lookupMap[c.referred_by_customer_id].last_name}`
      : undefined,
    origin_ba_name: c.origin_ba_id && lookupMap[c.origin_ba_id]
      ? `${lookupMap[c.origin_ba_id].first_name} ${lookupMap[c.origin_ba_id].last_name}`
      : undefined,
  }))

  return <CustomerTable data={enriched} />
}

export default function CustomersPage() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-medium text-[#f0ede8] mb-1">Customer Explorer</h1>
        <p className="text-[#888580] text-sm font-mono">Search, filter, and explore all customers</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <CustomerData />
      </Suspense>
    </div>
  )
}
