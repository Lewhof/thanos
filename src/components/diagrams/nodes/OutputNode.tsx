'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function OutputNode({ id, data, selected }: NodeProps<AppNode>) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setNodes } = useReactFlow()

  const commitLabel = useCallback(() => {
    setEditing(false)
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    )
  }, [id, label, setNodes])

  const borderColor = data.color ?? 'rgb(34,197,94)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <div
        className="rounded-lg bg-card px-4 py-2 min-w-[100px] min-h-[40px] flex items-center justify-center text-sm font-medium border-2 border-green-500 cursor-default shadow-sm"
        style={{ borderColor }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => inputRef.current?.select(), 0)
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            className="nodrag bg-transparent outline-none text-center text-sm font-medium w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitLabel()
              if (e.key === 'Escape') {
                setLabel(data.label)
                setEditing(false)
              }
            }}
            autoFocus
          />
        ) : (
          <span>{data.label}</span>
        )}
      </div>
    </>
  )
}
