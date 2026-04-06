'use client'

import { useReactFlow } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { AppEdge } from '@/lib/diagram-types'

interface EdgeInspectorProps {
  selectedEdge: AppEdge | null
  onClose: () => void
}

const EDGE_TYPES = [
  { value: 'smoothstep', label: 'Smooth' },
  { value: 'bezier', label: 'Bezier' },
  { value: 'step', label: 'Step' },
  { value: 'straight', label: 'Straight' },
] as const

export default function EdgeInspector({ selectedEdge, onClose }: EdgeInspectorProps) {
  const { setEdges } = useReactFlow()

  if (!selectedEdge) return null

  const updateEdge = (updates: Partial<AppEdge>) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdge.id ? { ...e, ...updates } : e
      )
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Edge Inspector
        </h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onClose}>
          <X size={12} />
        </Button>
      </div>

      {/* Edge type */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">Type</label>
        <div className="flex gap-1 flex-wrap">
          {EDGE_TYPES.map((t) => (
            <Button
              key={t.value}
              variant={selectedEdge.type === t.value ? 'default' : 'outline'}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => updateEdge({ type: t.value })}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Animated */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="edge-animated"
          checked={!!selectedEdge.animated}
          onChange={(e) => updateEdge({ animated: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="edge-animated" className="text-xs">Animated</label>
      </div>

      {/* Label */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Label</label>
        <Input
          value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
          onChange={(e) => updateEdge({ label: e.target.value })}
          placeholder="Edge label…"
          className="h-7 text-xs"
        />
      </div>
    </div>
  )
}
