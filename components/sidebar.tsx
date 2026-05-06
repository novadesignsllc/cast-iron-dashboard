'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Star, Users, BarChart2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/ambassadors', label: 'Ambassadors', icon: Star },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/revenue', label: 'Revenue', icon: BarChart2 },
  { href: '/sync', label: 'Sync Health', icon: Activity },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#111111] flex flex-col z-50 border-r border-[#232323]">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#232323]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0f0f0f] font-bold text-sm font-mono"
            style={{ background: '#4ade9a' }}
          >
            CI
          </div>
          <div>
            <p className="text-[#f0ede8] font-medium text-sm leading-tight">Cast Iron</p>
            <p className="text-[#f0ede8] text-xs">Nutrition</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-[rgba(74,222,154,0.12)] text-[#4ade9a] font-medium'
                  : 'text-[#f0ede8] hover:text-[#f0ede8] hover:bg-[#1e1e1e]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#232323]">
        <p className="text-[#f0ede8] text-xs">Internal Dashboard</p>
        <p className="text-[#f0ede8] text-xs">Read-only · v1.0</p>
      </div>
    </aside>
  )
}
