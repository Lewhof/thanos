'use client'
import { useState, useCallback } from 'react'
import { Layout, LayoutItem } from 'react-grid-layout'
import { WidgetDef, DEFAULT_WIDGETS, DEFAULT_LAYOUT, STORAGE_KEY } from './dashboard-widgets'

function loadLayout(): LayoutItem[] {
  if (typeof window === 'undefined') return [...DEFAULT_LAYOUT]
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return [...DEFAULT_LAYOUT]
}

function loadWidgets(): WidgetDef[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS
  try {
    const saved = localStorage.getItem(STORAGE_KEY + ':widgets')
    if (saved) {
      const ids: string[] = JSON.parse(saved)
      return DEFAULT_WIDGETS.filter(w => ids.includes(w.id))
    }
  } catch {}
  return DEFAULT_WIDGETS
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<LayoutItem[]>(loadLayout)
  const [widgets, setWidgets] = useState<WidgetDef[]>(loadWidgets)

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    const mutableLayout = [...newLayout]
    setLayout(mutableLayout)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mutableLayout))
  }, [])

  const deleteWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.filter(w => w.id !== id)
      localStorage.setItem(STORAGE_KEY + ':widgets', JSON.stringify(next.map(w => w.id)))
      return next
    })
    setLayout(prev => {
      const next = prev.filter(l => l.i !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const addWidget = useCallback((def: WidgetDef) => {
    const defaultItem = DEFAULT_LAYOUT.find(l => l.i === def.id)
    const newItem: LayoutItem = defaultItem
      ? { ...defaultItem, y: Infinity }
      : { i: def.id, x: 0, y: Infinity, w: 3, h: 3, minW: 2, minH: 2 }
    setWidgets(prev => {
      if (prev.find(w => w.id === def.id)) return prev
      const next = [...prev, def]
      localStorage.setItem(STORAGE_KEY + ':widgets', JSON.stringify(next.map(w => w.id)))
      return next
    })
    setLayout(prev => {
      if (prev.find(l => l.i === def.id)) return prev
      const next = [...prev, newItem]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const resetLayout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY + ':widgets')
    setLayout([...DEFAULT_LAYOUT])
    setWidgets(DEFAULT_WIDGETS)
  }, [])

  return { layout, widgets, handleLayoutChange, deleteWidget, addWidget, resetLayout }
}
