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
            className="font-mono text-[#444444] text-sm select-none"
            style={{ marginLeft: (depth - 1) * 24 }}
          >
            {prefix}
          </span>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
            style={{
              background: depth === 0 ? 'rgba(74,222,154,0.2)' : depth === 1 ? 'rgba(245,166,35,0.15)' : 'rgba(136,133,128,0.15)',
              color: depth === 0 ? '#4ade9a' : depth === 1 ? '#f5a623' : '#f0ede8',
            }}
          >
            {node.first_name[0]}{node.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {node.is_ba ? (
                <Link
                  href={`/ambassadors/${node.id}`}
                  className="text-sm font-medium text-[#4ade9a] hover:underline truncate"
                >
                  {node.first_name} {node.last_name}
                </Link>
              ) : (
                <Link
                  href={`/customers/${node.id}`}
                  className="text-sm font-medium text-[#f0ede8] hover:text-[#4ade9a] transition-colors truncate"
                >
                  {node.first_name} {node.last_name}
                </Link>
              )}
              {node.is_ba && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#4ade9a] bg-[rgba(74,222,154,0.1)] border border-[rgba(74,222,154,0.25)] px-1.5 py-0.5 rounded-full font-mono">
                  <Star size={9} fill="currentColor" />
                  {node.ba_tier ?? 'BA'}
                </span>
              )}
              {depth > 0 && (
                <span className="text-xs text-[#f0ede8] font-mono">
                  {depth === 1 ? 'direct referral' : `depth ${depth}`}
                </span>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-[#f0ede8] ml-auto flex-shrink-0 font-mono">
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
      <div className="py-8 text-center text-[#f0ede8] text-sm font-mono">
        No referrals in network yet
      </div>
    )
  }

  const directReferrals = nodes.filter(n => n.referred_by_customer_id === baId)
  const totalLTV = nodes.reduce((s, n) => s + (n.net_ltv ?? 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs text-[#f0ede8] font-mono">
        <span>{nodes.length} people in network</span>
        <span className="font-semibold text-[#f0ede8]">Total network LTV: {formatCurrency(totalLTV)}</span>
      </div>
      <div className="font-mono text-xs text-[#f0ede8] mb-3 pb-3 border-b border-[#232323]">
        Legend: <span className="text-[#4ade9a]">● BA</span> · <span className="text-[#f5a623]">● Direct referral</span> · <span className="text-[#f0ede8]">● Downstream</span>
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
