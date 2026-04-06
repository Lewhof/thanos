'use client'
import { X, GripHorizontal } from 'lucide-react'

interface Props {
  id: string
  title: string
  isEditMode: boolean
  onDelete: (id: string) => void
  children: React.ReactNode
}

export function WidgetWrapper({ id, title, isEditMode, onDelete, children }: Props) {
  return (
    <div className="relative h-full w-full flex flex-col">
      {isEditMode && (
        <div className="widget-drag-handle flex items-center gap-2 px-3 py-1.5 bg-muted/80 border-b border-border rounded-t-lg cursor-grab active:cursor-grabbing select-none transition-all">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground truncate flex-1">{title}</span>
          <button
            onClick={() => onDelete(id)}
            className="ml-auto p-0.5 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors"
            title="Remove widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className={`flex-1 overflow-auto transition-all ${isEditMode ? 'rounded-b-lg ring-2 ring-dashed ring-primary/30' : ''}`}>
        {children}
      </div>
    </div>
  )
}
