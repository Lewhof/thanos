'use client'

import { useState, useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function CloudNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const borderColor = data.color ?? 'rgb(56,189,248)'
  const fillColor = data.color ? `${data.color}22` : 'rgba(56,189,248,0.1)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <div
        className="flex items-center justify-center cursor-default relative"
        style={{ width: 110, height: 70 }}
        onDoubleClick={() => {
          setEditing(true)
          setTimeout(() => inputRef.current?.select(), 0)
        }}
      >
        {/* SVG cloud shape */}
        <svg width="110" height="70" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <path
            d="M88 52H26C18.3 52 12 46 12 38.5C12 31.8 17 26.3 23.5 25.2C23.2 23.8 23 22.4 23 21C23 12.7 29.7 6 38 6C42.4 6 46.3 7.9 49.1 10.9C51.3 8.4 54.5 7 58 7C65.2 7 71 12.8 71 20C71 21.3 70.8 22.5 70.5 23.6C71 23.5 71.5 23.5 72 23.5C80.3 23.5 87 30.2 87 38.5C87 39.2 86.9 39.9 86.8 40.5C87 40.4 87.5 40.5 88 40.5C96.3 40.5 103 47.2 103 55.5C103 55.7 103 55.8 103 56C99.5 54.4 94 52 88 52Z"
            fill={fillColor}
            stroke={borderColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M22 52C14.3 52 8 46 8 38.5C8 31.8 13 26.3 19.5 25.2C19.2 23.8 19 22.4 19 21C19 12.7 25.7 6 34 6C38.4 6 42.3 7.9 45.1 10.9C47.3 8.4 50.5 7 54 7C61.2 7 67 12.8 67 20C67 21.3 66.8 22.5 66.5 23.6C67 23.5 67.5 23.5 68 23.5C76.3 23.5 83 30.2 83 38.5C83 46.8 76.3 53.5 68 53.5C67.3 53.5 66.7 53.4 66 53.3L22 52Z"
            fill={fillColor}
            stroke={borderColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Simpler cloud using circles + rectangle */}
        </svg>
        {/* Cleaner cloud approach */}
        <svg width="110" height="70" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <ellipse cx="55" cy="44" rx="46" ry="16" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          <ellipse cx="35" cy="36" rx="20" ry="18" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          <ellipse cx="55" cy="30" rx="22" ry="20" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          <ellipse cx="76" cy="36" rx="18" ry="16" fill={fillColor} stroke={borderColor} strokeWidth="2" />
          {/* Cover bottom seams */}
          <rect x="9" y="44" width="92" height="14" fill={fillColor} />
          <line x1="9" y1="58" x2="101" y2="58" stroke={borderColor} strokeWidth="2" />
          <line x1="9" y1="44" x2="9" y2="58" stroke={borderColor} strokeWidth="2" />
          <line x1="101" y1="44" x2="101" y2="58" stroke={borderColor} strokeWidth="2" />
        </svg>
        <span className="relative z-10 text-xs font-medium text-center leading-tight px-2 mt-4">
          {editing ? (
            <input
              ref={inputRef}
              className="nodrag bg-transparent outline-none text-center text-xs font-medium w-20"
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
            data.label
          )}
        </span>
      </div>
    </>
  )
}
