'use client'

import { useCallback } from 'react'

export function useExportPng(diagramTitle: string) {
  const exportPng = useCallback(async () => {
    const { toPng } = await import('html-to-image')
    const el = document.querySelector('.react-flow__renderer') as HTMLElement
    if (!el) return

    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#1a1a2e',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `${diagramTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [diagramTitle])

  return exportPng
}
