'use client'

import { useState } from 'react'
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, ChevronDown } from 'lucide-react'

const NODE_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'input', label: 'Input' },
  { value: 'output', label: 'Output' },
  { value: 'decision', label: 'Decision' },
  { value: 'process', label: 'Process' },
  { value: 'note', label: 'Note' },
  { value: 'group', label: 'Group' },
]

const COLORS = [
  { label: 'Slate', value: 'rgb(100,116,139)' },
  { label: 'Blue', value: 'rgb(59,130,246)' },
  { label: 'Green', value: 'rgb(34,197,94)' },
  { label: 'Yellow', value: 'rgb(234,179,8)' },
  { label: 'Red', value: 'rgb(239,68,68)' },
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
        <PopoverContent className="w-32 p-1" align="start">
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

      {/* Color swatches */}
      <div className="flex items-center gap-0.5">
        {COLORS.map((c) => (
          <button
            key={c.value}
            title={c.label}
            className="w-4 h-4 rounded-full border border-border hover:scale-110 transition-transform"
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
