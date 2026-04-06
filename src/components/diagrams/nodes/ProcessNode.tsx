'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function ProcessNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const borderColor = data.color ?? 'rgb(168,85,247)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <div
        className="bg-card px-4 py-2 min-w-[100px] min-h-[40px] flex items-center justify-center text-sm font-medium border-2 ring-2 ring-offset-1 cursor-default shadow-sm"
        style={{
          borderColor,
          ringColor: borderColor,
          outline: `2px solid ${borderColor}`,
          outlineOffset: '3px',
        }}
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
