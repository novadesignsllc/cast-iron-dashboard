// READ ONLY — no writes permitted
import { Suspense } from 'react'
import { getSyncLogs, getLastSyncPerSource } from '@/lib/queries'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatNumber, timeAgo } from '@/lib/utils'
import { Activity } from 'lucide-react'
import type { SyncLog } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function lastSuccessfulSync(logs: SyncLog[]): string {
  const successful = logs.filter(l => l.status === 'success' && l.completed_at)
  if (successful.length === 0) return 'Never'
  const latest = successful.sort((a, b) =>
    new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
  )[0]
  return timeAgo(latest.completed_at)
}

async function SyncHealthPage() {
  const [allLogs, sourceLogs] = await Promise.all([
    getSyncLogs(20),
    getLastSyncPerSource(),
  ])

  const failedCount = sourceLogs.filter(l => l.status === 'failed').length
  const successCount = sourceLogs.filter(l => l.status === 'success').length
  const lastSuccess = lastSuccessfulSync(allLogs)

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          Sync Health
        </h1>
        <p className="text-[#6B6B6B] text-sm">Data pipeline status and sync history</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Last Successful Sync" value={lastSuccess} icon={<Activity size={20} />} />
        <StatCard label="Active Sources" value={formatNumber(sourceLogs.length)} />
        <StatCard label="Healthy Sources" value={formatNumber(successCount)} />
        <StatCard label="Failed Sources" value={formatNumber(failedCount)} accent={failedCount > 0} />
      </div>

      {/* Per-source status */}
      <Card>
        <CardHeader><CardTitle>Status by Source</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
                {['Source', 'Type', 'Status', 'Last Sync', 'Processed', 'Created', 'Updated', 'Error'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {sourceLogs.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[#6B6B6B]">No sync data</td></tr>
              )}
              {sourceLogs.map(log => (
                <tr key={log.id}
                  className={`hover:bg-[#F9F6F1] transition-colors ${log.status === 'failed' ? 'bg-red-50/50' : ''}`}>
                  <td className="px-5 py-3 font-medium">{log.source}</td>
                  <td className="px-5 py-3 text-[#6B6B6B] text-xs">{log.sync_type}</td>
                  <td className="px-5 py-3"><Badge variant={log.status}>{log.status}</Badge></td>
                  <td className="px-5 py-3 text-[#6B6B6B]">{timeAgo(log.completed_at ?? log.started_at)}</td>
                  <td className="px-5 py-3 tabular-nums">{log.records_processed != null ? formatNumber(log.records_processed) : '—'}</td>
                  <td className="px-5 py-3 tabular-nums text-[#4A7C59]">{log.records_created != null ? formatNumber(log.records_created) : '—'}</td>
                  <td className="px-5 py-3 tabular-nums text-[#D4821A]">{log.records_updated != null ? formatNumber(log.records_updated) : '—'}</td>
                  <td className="px-5 py-3 text-xs text-[#C0392B] max-w-[200px] truncate">
                    {log.error_message ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Full sync log */}
      <Card>
        <CardHeader><CardTitle>Recent Sync Log (Last 20)</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F9F6F1]">
                {['Started', 'Completed', 'Source', 'Type', 'Status', 'Processed', 'Error'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {allLogs.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[#6B6B6B]">No sync history</td></tr>
              )}
              {allLogs.map(log => (
                <tr key={log.id}
                  className={`hover:bg-[#F9F6F1] transition-colors ${log.status === 'failed' ? 'bg-red-50/60' : ''}`}>
                  <td className="px-5 py-3 text-[#6B6B6B] text-xs whitespace-nowrap">
                    {new Date(log.started_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-5 py-3 text-[#6B6B6B] text-xs whitespace-nowrap">
                    {log.completed_at ? new Date(log.completed_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : '—'}
                  </td>
                  <td className="px-5 py-3 font-medium">{log.source}</td>
                  <td className="px-5 py-3 text-xs text-[#6B6B6B]">{log.sync_type}</td>
                  <td className="px-5 py-3"><Badge variant={log.status}>{log.status}</Badge></td>
                  <td className="px-5 py-3 tabular-nums">{log.records_processed != null ? formatNumber(log.records_processed) : '—'}</td>
                  <td className="px-5 py-3 text-xs text-[#C0392B] max-w-[200px] truncate" title={log.error_message ?? undefined}>
                    {log.error_message ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default function SyncPage() {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48 rounded" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    }>
      <SyncHealthPage />
    </Suspense>
  )
}
