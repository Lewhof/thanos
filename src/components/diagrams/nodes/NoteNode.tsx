'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function NoteNode({ id, data, selected }: NodeProps<AppNode>) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setNodes } = useReactFlow()

  const commitLabel = useCallback(() => {
    setEditing(false)
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    )
  }, [id, label, setNodes])

  const borderColor = data.color ?? 'rgb(245,158,11)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div
        className="bg-amber-950/30 border-2 border-amber-500 px-3 py-2 min-w-[120px] min-h-[60px] text-sm font-medium cursor-default shadow-sm relative"
        style={{
          borderColor,
          transform: 'skewX(-1deg)',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
        }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => textareaRef.current?.select(), 0)
        }}
      >
        {/* Folded corner */}
        <div
          className="absolute top-0 right-0 w-3 h-3"
          style={{
            background: 'linear-gradient(225deg, transparent 50%, rgba(245,158,11,0.4) 50%)',
          }}
        />
        {editing ? (
          <textarea
            ref={textareaRef}
            className="nodrag bg-transparent outline-none text-sm font-medium w-full resize-none"
            value={label}
            rows={3}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                commitLabel()
              }
              if (e.key === 'Escape') {
                setLabel(data.label)
                setEditing(false)
              }
            }}
            autoFocus
          />
        ) : (
          <span className="whitespace-pre-wrap">{data.label}</span>
        )}
      </div>
    </>
  )
}
