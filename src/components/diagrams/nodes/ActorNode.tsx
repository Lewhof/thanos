'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function ActorNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const color = data.color ?? 'rgb(251,191,36)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <div
        className="flex flex-col items-center justify-start cursor-default select-none"
        style={{ width: 70, minHeight: 90 }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => inputRef.current?.select(), 0)
        }}
      >
        {/* Head */}
        <div
          className="rounded-full border-2 mb-1"
          style={{
            width: 24,
            height: 24,
            borderColor: color,
            backgroundColor: `${color}22`,
          }}
        />
        {/* Body */}
        <svg width="44" height="40" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Torso */}
          <line x1="22" y1="2" x2="22" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Arms */}
          <line x1="4" y1="12" x2="40" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Left leg */}
          <line x1="22" y1="24" x2="8" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Right leg */}
          <line x1="22" y1="24" x2="36" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {/* Label */}
        <div className="mt-1 text-center" style={{ width: 70 }}>
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
            <span className="text-xs font-medium leading-tight">{data.label}</span>
          )}
        </div>
      </div>
    </>
  )
}
