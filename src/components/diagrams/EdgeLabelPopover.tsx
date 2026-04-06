'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface EdgeLabelPopoverProps {
  position: { x: number; y: number } | null
  onConfirm: (label: string) => void
  onDismiss: () => void
}

export default function EdgeLabelPopover({ position, onConfirm, onDismiss }: EdgeLabelPopoverProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (position) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [position])

  if (!position) return null

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-3 w-56"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -110%)' }}
    >
      <p className="text-xs text-muted-foreground mb-2 font-medium">Edge label (optional)</p>
      <input
        ref={inputRef}
        className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="e.g. Yes / 1:N / 200 OK"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onConfirm((e.target as HTMLInputElement).value)
          }
          if (e.key === 'Escape') {
            onDismiss()
          }
        }}
      />
      <div className="flex gap-1.5 mt-2">
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 h-6 text-xs"
          onClick={onDismiss}
        >
          Skip
        </Button>
        <Button
          size="sm"
          className="flex-1 h-6 text-xs"
          onClick={() => onConfirm(inputRef.current?.value ?? '')}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
