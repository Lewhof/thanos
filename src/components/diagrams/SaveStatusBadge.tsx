'use client'

import type { SaveStatus } from '@/lib/diagram-types'

interface SaveStatusBadgeProps {
  status: SaveStatus
  className?: string
}

const statusConfig: Record<SaveStatus, { color: string; label: string }> = {
  saved: { color: 'bg-green-500', label: 'Saved' },
  saving: { color: 'bg-yellow-500', label: 'Saving…' },
  unsaved: { color: 'bg-orange-500', label: 'Unsaved' },
  error: { color: 'bg-red-500', label: 'Error' },
}

export default function SaveStatusBadge({ status, className }: SaveStatusBadgeProps) {
  const { color, label } = statusConfig[status]
  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground${className ? ` ${className}` : ''}`}>
      <span className={`w-2 h-2 rounded-full ${color} ${status === 'saving' ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </div>
  )
}
