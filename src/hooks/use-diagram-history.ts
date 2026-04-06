'use client'

import { useRef, useState } from 'react'
import type { AppNode, AppEdge } from '@/lib/diagram-types'

interface Snapshot {
  nodes: AppNode[]
  edges: AppEdge[]
}

const MAX_HISTORY = 50

export function useDiagramHistory() {
  const past = useRef<Snapshot[]>([])
  const future = useRef<Snapshot[]>([])
  // Force re-renders when can undo/redo changes
  const [, setVersion] = useState(0)
  const bump = () => setVersion((v) => v + 1)

  const push = (nodes: AppNode[], edges: AppEdge[]) => {
    past.current.push({ nodes, edges })
    if (past.current.length > MAX_HISTORY) {
      past.current.shift()
    }
    future.current = []
    bump()
  }

  const undo = (): Snapshot | null => {
    if (past.current.length === 0) return null
    const snapshot = past.current.pop()!
    future.current.push(snapshot)
    bump()
    return past.current.length > 0 ? past.current[past.current.length - 1] : snapshot
  }

  const redo = (): Snapshot | null => {
    if (future.current.length === 0) return null
    const snapshot = future.current.pop()!
    past.current.push(snapshot)
    bump()
    return snapshot
  }

  return {
    push,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}
