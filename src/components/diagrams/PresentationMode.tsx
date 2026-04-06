'use client'

import { useState, useEffect, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { ChevronLeft, ChevronRight, X, Presentation } from 'lucide-react'
import type { AppNode } from '@/lib/diagram-types'

interface PresentationModeProps {
  active: boolean
  nodes: AppNode[]
  onExit: () => void
}

function getSortedSlideNodes(nodes: AppNode[]): AppNode[] {
  // Filter out comment nodes
  const eligible = nodes.filter((n) => n.type !== 'comment')

  // Nodes with slideIndex defined come first, sorted by slideIndex
  const withIndex = eligible.filter((n) => typeof n.data.slideIndex === 'number')
  const withoutIndex = eligible.filter((n) => typeof n.data.slideIndex !== 'number')

  withIndex.sort((a, b) => (a.data.slideIndex as number) - (b.data.slideIndex as number))
  // Default: sort left-to-right, top-to-bottom
  withoutIndex.sort((a, b) => {
    const yDiff = a.position.y - b.position.y
    if (Math.abs(yDiff) > 50) return yDiff
    return a.position.x - b.position.x
  })

  return withIndex.length > 0 ? withIndex : withoutIndex
}

export default function PresentationMode({ active, nodes, onExit }: PresentationModeProps) {
  const { fitBounds, getNode } = useReactFlow()
  const [currentIndex, setCurrentIndex] = useState(0)
  const slides = getSortedSlideNodes(nodes)
  const total = slides.length

  const goToSlide = useCallback(
    (index: number) => {
      const slide = slides[index]
      if (!slide) return

      const node = getNode(slide.id)
      if (!node) return

      const width = (node.measured?.width ?? node.width ?? 150)
      const height = (node.measured?.height ?? node.height ?? 60)

      fitBounds(
        {
          x: node.position.x - 60,
          y: node.position.y - 60,
          width: width + 120,
          height: height + 120,
        },
        { duration: 600, padding: 0.2 }
      )
    },
    [slides, getNode, fitBounds]
  )

  // Navigate to the current slide whenever index changes
  useEffect(() => {
    if (active && slides.length > 0) {
      goToSlide(currentIndex)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, currentIndex])

  // Reset to first slide when activated
  useEffect(() => {
    if (active) {
      setCurrentIndex(0)
    }
  }, [active])

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }, [])

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(total - 1, i + 1))
  }, [total])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, prev, onExit])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Semi-transparent overlay border */}
      <div className="absolute inset-0 ring-4 ring-purple-500/60 ring-inset pointer-events-none" />

      {/* Top label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
          <Presentation size={12} />
          Presentation Mode
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-xl">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm font-medium min-w-[48px] text-center">
            {total === 0 ? '0 / 0' : `${currentIndex + 1} / ${total}`}
          </span>

          <button
            onClick={next}
            disabled={currentIndex >= total - 1}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          <div className="w-px h-4 bg-white/30 mx-1" />

          <button
            onClick={onExit}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-500/60 transition-colors"
            title="Exit (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
