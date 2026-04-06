'use client'

import { useState } from 'react'
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, ChevronDown } from 'lucide-react'

const NODE_TYPES = [
  { value: 'default', label: 'Rectangle' },
  { value: 'input', label: 'Start' },
  { value: 'output', label: 'End' },
  { value: 'decision', label: 'Decision' },
  { value: 'process', label: 'Process' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'actor', label: 'Actor' },
  { value: 'note', label: 'Note' },
  { value: 'group', label: 'Group' },
]

const COLORS = [
  { label: 'Slate', value: 'rgb(100,116,139)' },
  { label: 'Blue', value: 'rgb(59,130,246)' },
  { label: 'Indigo', value: 'rgb(99,102,241)' },
  { label: 'Purple', value: 'rgb(168,85,247)' },
  { label: 'Green', value: 'rgb(34,197,94)' },
  { label: 'Teal', value: 'rgb(20,184,166)' },
  { label: 'Sky', value: 'rgb(56,189,248)' },
  { label: 'Yellow', value: 'rgb(234,179,8)' },
  { label: 'Amber', value: 'rgb(251,191,36)' },
  { label: 'Orange', value: 'rgb(249,115,22)' },
  { label: 'Red', value: 'rgb(239,68,68)' },
  { label: 'Rose', value: 'rgb(244,63,94)' },
]

interface NodeActionsToolbarProps {
  nodeId: string
  isVisible: boolean
}

export default function NodeActionsToolbar({ nodeId, isVisible }: NodeActionsToolbarProps) {
  const { setNodes, setEdges, getNode } = useReactFlow()
  const [typeOpen, setTypeOpen] = useState(false)

  const handleChangeType = (newType: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, type: newType } : n))
    )
    setTypeOpen(false)
  }

  const handleColorChange = (color: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, color } } : n
      )
    )
  }

  const handleDuplicate = () => {
    const node = getNode(nodeId)
    if (!node) return
    const newNode = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 30,
        y: node.position.y + 30,
      },
      selected: false,
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    )
  }

  return (
    <NodeToolbar isVisible={isVisible} position={Position.Top} className="flex items-center gap-1 bg-popover border border-border rounded-md px-2 py-1 shadow-md">
      {/* Type selector */}
      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
        <PopoverTrigger
          className="inline-flex items-center h-6 px-2 text-xs gap-1 rounded-md hover:bg-accent font-medium transition-colors"
        >
          Type <ChevronDown size={10} />
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="start">
          {NODE_TYPES.map((t) => (
            <button
              key={t.value}
              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-accent"
              onClick={() => handleChangeType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Color swatches — 12 colors in two rows */}
      <div className="flex items-center gap-0.5 flex-wrap" style={{ maxWidth: 66 }}>
        {COLORS.map((c) => (
          <button
            key={c.value}
            title={c.label}
            className="w-3.5 h-3.5 rounded-full border border-border/50 hover:scale-125 transition-transform"
            style={{ background: c.value }}
            onClick={() => handleColorChange(c.value)}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Duplicate */}
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDuplicate} title="Duplicate">
        <Copy size={12} />
      </Button>

      {/* Delete */}
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={handleDelete} title="Delete">
        <Trash2 size={12} />
      </Button>
    </NodeToolbar>
  )
}
