import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  accent?: boolean
  icon?: React.ReactNode
}

export function StatCard({ label, value, subtext, accent, icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-[#888580] uppercase tracking-widest mb-2">{label}</p>
          <p
            className="text-2xl font-semibold font-mono"
            style={{ color: accent ? '#4ade9a' : '#f0ede8' }}
          >
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-[#888580] mt-1">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2 rounded-lg bg-[rgba(74,222,154,0.08)] text-[#4ade9a]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
