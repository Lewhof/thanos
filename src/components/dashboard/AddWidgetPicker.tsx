'use client'
import { Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DEFAULT_WIDGETS, WidgetDef } from '@/lib/dashboard-widgets'

interface Props {
  widgets: WidgetDef[]
  onAdd: (def: WidgetDef) => void
}

export function AddWidgetPicker({ widgets, onAdd }: Props) {
  const activeIds = new Set(widgets.map(w => w.id))
  const available = DEFAULT_WIDGETS.filter(w => !activeIds.has(w.id))
  const allActive = available.length === 0

  return (
    <Popover>
      <PopoverTrigger
        disabled={allActive}
        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 transition-colors"
      >
        <Plus className="h-4 w-4" />
        {allActive ? 'All widgets active' : '+ Add widget'}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Removed widgets</p>
        <div className="flex flex-col gap-0.5">
          {available.map(def => (
            <button
              key={def.id}
              onClick={() => onAdd(def)}
              className="text-left text-sm px-2 py-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors w-full"
            >
              {def.title}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
