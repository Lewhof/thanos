'use client'

import { X, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { diagramTemplates, type DiagramTemplate } from '@/lib/diagram-templates'
import type { AppNode, AppEdge } from '@/lib/diagram-types'

interface TemplatesModalProps {
  open: boolean
  hasContent: boolean
  onClose: () => void
  onLoad: (nodes: AppNode[], edges: AppEdge[]) => void
}

export default function TemplatesModal({ open, hasContent, onClose, onLoad }: TemplatesModalProps) {
  if (!open) return null

  const handleLoad = (template: DiagramTemplate) => {
    if (hasContent) {
      if (!confirm(`Loading "${template.name}" will replace the current canvas. Continue?`)) {
        return
      }
    }
    onLoad(template.nodes, template.edges)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold">Diagram Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Choose a template to get started quickly. This will replace the current canvas.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {diagramTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleLoad(template)}
              className="text-left p-4 rounded-lg border border-border hover:border-blue-500 hover:bg-accent/50 transition-all group"
            >
              <div className="text-2xl mb-2 leading-none">{template.icon}</div>
              <div className="text-sm font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                {template.name}
              </div>
              <div className="text-xs text-muted-foreground leading-snug">
                {template.description}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {template.nodes.length} nodes · {template.edges.length} edges
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
