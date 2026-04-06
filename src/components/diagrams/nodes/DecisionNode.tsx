'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function DecisionNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const borderColor = data.color ?? 'rgb(234,179,8)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <div
        className="flex items-center justify-center cursor-default"
        style={{ width: 80, height: 80 }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => inputRef.current?.select(), 0)
        }}
      >
        <div
          className="absolute flex items-center justify-center bg-card border-2"
          style={{
            width: 56,
            height: 56,
            transform: 'rotate(45deg)',
            borderColor,
          }}
        />
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="nodrag bg-transparent outline-none text-center text-xs font-medium w-14"
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
            <span className="text-xs font-medium text-center leading-tight px-1">{data.label}</span>
          )}
        </div>
      </div>
    </>
  )
}
