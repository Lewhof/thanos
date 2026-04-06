'use client'

import { useEffect, useRef } from 'react'
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
  // Clipboard stored in a ref to avoid stale closures
  const clipboardRef = useRef<{ nodes: AppNode[]; edges: AppEdge[] }>({ nodes: [], edges: [] })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const ctrlOrMeta = e.ctrlKey || e.metaKey

      // Delete selected nodes
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

      // Copy selected nodes + their internal edges
      if (ctrlOrMeta && e.key === 'c') {
        const selectedNodes = nodes.filter((n) => n.selected)
        if (selectedNodes.length === 0) return
        const selectedIds = new Set(selectedNodes.map((n) => n.id))
        const internalEdges = edges.filter(
          (ed) => selectedIds.has(ed.source) && selectedIds.has(ed.target)
        )
        clipboardRef.current = { nodes: selectedNodes, edges: internalEdges }
        return
      }

      // Paste
      if (ctrlOrMeta && e.key === 'v') {
        const { nodes: copiedNodes, edges: copiedEdges } = clipboardRef.current
        if (copiedNodes.length === 0) return
        e.preventDefault()

        const idMap = new Map<string, string>()
        const pastedNodes = copiedNodes.map((n) => {
          const newId = crypto.randomUUID()
          idMap.set(n.id, newId)
          return {
            ...n,
            id: newId,
            position: { x: n.position.x + 20, y: n.position.y + 20 },
            selected: true,
          }
        })
        const pastedEdges = copiedEdges.map((ed) => ({
          ...ed,
          id: crypto.randomUUID(),
          source: idMap.get(ed.source) ?? ed.source,
          target: idMap.get(ed.target) ?? ed.target,
        }))

        setNodes((nds) => [
          ...nds.map((n) => ({ ...n, selected: false })),
          ...pastedNodes,
        ])
        setEdges((eds) => [...eds, ...pastedEdges])
        return
      }

      // Select all
      if (ctrlOrMeta && e.key === 'a') {
        e.preventDefault()
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })))
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nodes, edges, setNodes, setEdges, onUndo, onRedo, onSave])
}
