'use client'

import { Square, Diamond, Circle, FileText, Layers, Box } from 'lucide-react'

interface PaletteItem {
  type: string
  label: string
  icon: React.ReactNode
  className: string
}

const paletteItems: PaletteItem[] = [
  {
    type: 'default',
    label: 'Default',
    icon: <Square size={16} />,
    className: 'border-slate-500',
  },
  {
    type: 'input',
    label: 'Input',
    icon: <Circle size={16} className="text-blue-400" />,
    className: 'border-blue-500',
  },
  {
    type: 'output',
    label: 'Output',
    icon: <Circle size={16} className="text-green-400" />,
    className: 'border-green-500',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: <Diamond size={16} className="text-yellow-400" />,
    className: 'border-yellow-500',
  },
  {
    type: 'process',
    label: 'Process',
    icon: <Layers size={16} className="text-purple-400" />,
    className: 'border-purple-500',
  },
  {
    type: 'note',
    label: 'Note',
    icon: <FileText size={16} className="text-amber-400" />,
    className: 'border-amber-500',
  },
  {
    type: 'group',
    label: 'Group',
    icon: <Box size={16} className="text-slate-400" />,
    className: 'border-slate-400 border-dashed',
  },
]

export default function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border bg-card/50 overflow-y-auto">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Node Types
        </h3>
      </div>
      <div className="p-2 flex flex-col gap-1">
        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 bg-card cursor-grab active:cursor-grabbing text-sm font-medium hover:bg-accent transition-colors select-none ${item.className}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border mt-2">
        <p className="text-xs text-muted-foreground">
          Drag nodes onto the canvas to add them.
        </p>
      </div>
    </div>
  )
}
