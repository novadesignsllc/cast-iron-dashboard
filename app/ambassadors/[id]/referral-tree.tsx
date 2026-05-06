'use client'
import Link from 'next/link'
import type { ReferralTreeNode } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface TreeNodeProps {
  node: ReferralTreeNode
  children: ReferralTreeNode[]
  allNodes: ReferralTreeNode[]
  isLast: boolean
  depth: number
}

function TreeNode({ node, children, allNodes, isLast, depth }: TreeNodeProps) {
  const prefix = depth === 0 ? '' : isLast ? '└── ' : '├── '
  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 group">
        {depth > 0 && (
          <span
            className="font-mono text-[#C8C0B4] text-sm select-none"
            style={{ marginLeft: (depth - 1) * 24 }}
          >
            {prefix}
          </span>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: depth === 0 ? '#B87333' : depth === 1 ? '#4A7C59' : '#6B6B6B' }}
          >
            {node.first_name[0]}{node.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {node.is_ba ? (
                <Link
                  href={`/ambassadors/${node.id}`}
                  className="text-sm font-medium text-[#B87333] hover:underline truncate"
                >
                  {node.first_name} {node.last_name}
                </Link>
              ) : (
                <Link
                  href={`/customers/${node.id}`}
                  className="text-sm font-medium text-[#1C1C1C] hover:text-[#B87333] transition-colors truncate"
                >
                  {node.first_name} {node.last_name}
                </Link>
              )}
              {node.is_ba && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#B87333] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  <Star size={9} fill="currentColor" />
                  {node.ba_tier ?? 'BA'}
                </span>
              )}
              {depth > 0 && (
                <span className="text-xs text-[#6B6B6B]">
                  {depth === 1 ? 'direct referral' : `depth ${depth}`}
                </span>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-[#1C1C1C] ml-auto flex-shrink-0">
            {formatCurrency(node.net_ltv)}
          </span>
        </div>
      </div>
      {children.length > 0 && (
        <div>
          {children.map((child, i) => {
            const childChildren = allNodes.filter(n => n.referred_by_customer_id === child.id)
            return (
              <TreeNode
                key={child.id}
                node={child}
                children={childChildren}
                allNodes={allNodes}
                isLast={i === children.length - 1}
                depth={depth + 1}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ReferralTree({ baId, nodes }: { baId: string; nodes: ReferralTreeNode[] }) {
  if (nodes.length === 0) {
    return (
      <div className="py-8 text-center text-[#6B6B6B] text-sm">
        No referrals in network yet
      </div>
    )
  }

  const directReferrals = nodes.filter(n => n.referred_by_customer_id === baId)
  const totalLTV = nodes.reduce((s, n) => s + (n.net_ltv ?? 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs text-[#6B6B6B]">
        <span>{nodes.length} people in network</span>
        <span className="font-semibold text-[#1C1C1C]">Total network LTV: {formatCurrency(totalLTV)}</span>
      </div>
      <div className="font-mono text-xs text-[#6B6B6B] mb-3 pb-3 border-b border-[#E5E0D8]">
        Legend: <span className="text-[#B87333]">● BA</span> · <span className="text-[#4A7C59]">● Direct referral</span> · <span className="text-[#6B6B6B]">● Downstream</span>
      </div>
      <div className="space-y-0.5">
        {directReferrals.map((child, i) => {
          const childChildren = nodes.filter(n => n.referred_by_customer_id === child.id)
          return (
            <TreeNode
              key={child.id}
              node={child}
              children={childChildren}
              allNodes={nodes}
              isLast={i === directReferrals.length - 1}
              depth={1}
            />
          )
        })}
      </div>
    </div>
  )
}
