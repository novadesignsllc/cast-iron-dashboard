// READ ONLY — no writes permitted
import { Suspense } from 'react'
import { getAllBAsWithNetwork } from '@/lib/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { AmbassadorTable } from './ambassador-table'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function AmbassadorData() {
  const bas = await getAllBAsWithNetwork()
  return <AmbassadorTable data={bas} />
}

export default function AmbassadorsPage() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-medium text-[#f0ede8] mb-1">Brand Ambassador Leaderboard</h1>
        <p className="text-[#f0ede8] text-sm font-mono">Sortable performance metrics for all brand ambassadors</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <AmbassadorData />
      </Suspense>
    </div>
  )
}
