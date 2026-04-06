'use client'

import { useEffect } from 'react'
import type { AppNode, AppEdge } from '@/lib/diagram-types'

interface ShortcutOptions {
  nodes: AppNode[]
  edges: AppEdge[]
  setNodes: (updater: (nds: AppNode[]) => AppNode[]) => void
  setEdges: (updater: (eds: AppEdge[]) => AppEdge[]) => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
}

export function useDiagramShortcuts({
  nodes,
  edges,
  setNodes,
  setEdges,
  onUndo,
  onRedo,
  onSave,
}: ShortcutOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const ctrlOrMeta = e.ctrlKey || e.metaKey

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodeIds = new Set(
          nodes.filter((n) => n.selected).map((n) => n.id)
        )
        if (selectedNodeIds.size === 0) return
        setNodes((nds) => nds.filter((n) => !selectedNodeIds.has(n.id)))
        setEdges((eds) =>
          eds.filter(
            (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
          )
        )
        return
      }

      if (ctrlOrMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        onUndo()
        return
      }

      if (ctrlOrMeta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        onRedo()
        return
      }

      if (ctrlOrMeta && e.key === 's') {
        e.preventDefault()
        onSave()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nodes, edges, setNodes, setEdges, onUndo, onRedo, onSave])
}
