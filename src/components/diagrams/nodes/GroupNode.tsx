'use client'

import { useState, useRef, useCallback } from 'react'
import { NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react'
import type { AppNode } from '@/lib/diagram-types'
import NodeActionsToolbar from '../NodeActionsToolbar'

export default function GroupNode({ id, data, selected }: NodeProps<AppNode>) {
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

  const borderColor = data.color ?? 'rgb(148,163,184)'

  return (
    <>
      <NodeActionsToolbar nodeId={id} isVisible={!!selected} />
      <NodeResizer
        color={borderColor}
        isVisible={!!selected}
        minWidth={100}
        minHeight={50}
      />
      <div
        className="w-full h-full rounded-lg border-2 border-dashed bg-card/20 relative"
        style={{ borderColor }}
      >
        <div
          className="absolute top-2 left-2 text-xs font-medium text-muted-foreground cursor-default"
          onDoubleClick={() => {
            setEditing(true)
            setTimeout(() => inputRef.current?.select(), 0)
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="nodrag bg-transparent outline-none text-xs font-medium"
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
      </div>
    </>
  )
}
