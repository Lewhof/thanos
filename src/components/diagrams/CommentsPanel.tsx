'use client'

import { X, MessageSquare, ChevronRight } from 'lucide-react'
import type { AppNode } from '@/lib/diagram-types'
import type { CommentNodeData } from '@/lib/diagram-types'
import type { Node } from '@xyflow/react'

type CommentNode = Node<CommentNodeData> & { type: 'comment' }

interface CommentsPanelProps {
  open: boolean
  nodes: AppNode[]
  onClose: () => void
  onSelectComment: (id: string) => void
}

export default function CommentsPanel({ open, nodes, onClose, onSelectComment }: CommentsPanelProps) {
  const commentNodes = nodes.filter((n): n is CommentNode => n.type === 'comment') as CommentNode[]

  return (
    <div
      className={`flex-shrink-0 border-l border-border bg-card/50 flex flex-col transition-all duration-200 ${
        open ? 'w-[240px]' : 'w-0 overflow-hidden'
      }`}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-yellow-400" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Comments ({commentNodes.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {commentNodes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 px-3">
            No comments yet. Use the toolbar to add a comment to the canvas.
          </p>
        ) : (
          commentNodes.map((node) => {
            const dateStr = node.data.createdAt
              ? new Date(node.data.createdAt).toLocaleDateString('en-ZA', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''
            return (
              <button
                key={node.id}
                onClick={() => onSelectComment(node.id)}
                className="w-full text-left p-2.5 rounded-lg border border-yellow-600/30 bg-yellow-950/20 hover:bg-yellow-950/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold flex-shrink-0"
                      style={{ background: 'rgb(161, 120, 0)' }}
                    >
                      {(node.data.author ?? 'A').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-yellow-400 truncate">{node.data.author ?? 'Anonymous'}</span>
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                  {node.data.text || <span className="italic">Empty comment</span>}
                </p>
                {dateStr && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{dateStr}</p>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
