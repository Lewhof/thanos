'use client'

import { useEffect, useRef, useState } from 'react'
import type { AppNode, AppEdge, SaveStatus } from '@/lib/diagram-types'

export function useAutoSave(
  id: string,
  nodes: AppNode[],
  edges: AppEdge[],
  enabled: boolean
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!enabled) return
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setSaveStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const res = await fetch(`/api/diagrams/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges }),
        })
        if (!res.ok) throw new Error('Save failed')
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nodes, edges, enabled])

  return saveStatus
}
