'use client'

import { useCallback } from 'react'

export function useExportSvg(diagramTitle: string) {
  const exportSvg = useCallback(async () => {
    const { toSvg } = await import('html-to-image')
    const el = document.querySelector('.react-flow__renderer') as HTMLElement
    if (!el) return

    try {
      const dataUrl = await toSvg(el, {
        backgroundColor: '#1a1a2e',
      })
      const link = document.createElement('a')
      link.download = `${diagramTitle.replace(/\s+/g, '-').toLowerCase()}.svg`
      link.href = dataUrl
      link.click()
    } catch (err) {
      // Export failed silently — user can retry
      void err
    }
  }, [diagramTitle])

  return exportSvg
}
