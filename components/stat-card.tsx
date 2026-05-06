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
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#6B6B6B] font-medium uppercase tracking-wide mb-1">{label}</p>
          <p
            className="text-3xl font-bold"
            style={{ color: accent ? '#B87333' : '#1C1C1C', fontFamily: 'Playfair Display, serif' }}
          >
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-[#6B6B6B] mt-1">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2.5 rounded-lg bg-[#F9F6F1] text-[#B87333]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
