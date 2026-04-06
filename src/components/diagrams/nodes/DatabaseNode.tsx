'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function DatabaseNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const borderColor = data.color ?? 'rgb(99,102,241)'
  const fillColor = data.color ? `${data.color}22` : 'rgba(99,102,241,0.1)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <div
        className="flex flex-col items-center justify-center cursor-default"
        style={{ width: 90, minHeight: 70 }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => inputRef.current?.select(), 0)
        }}
      >
        {/* SVG cylinder shape */}
        <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute">
          {/* Cylinder body */}
          <rect x="4" y="14" width="82" height="48" rx="2" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          {/* Bottom ellipse */}
          <ellipse cx="45" cy="62" rx="41" ry="8" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          {/* Top ellipse */}
          <ellipse cx="45" cy="14" rx="41" ry="8" fill={fillColor} stroke={borderColor} strokeWidth="2" />
        </svg>
        <div className="relative z-10 flex items-center justify-center mt-2" style={{ width: 80 }}>
          {editing ? (
            <input
              ref={inputRef}
              className="nodrag bg-transparent outline-none text-center text-xs font-medium w-full"
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
