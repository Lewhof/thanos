'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, GitGraph } from 'lucide-react'
import type { DiagramRow } from '@/lib/diagram-types'

interface DiagramCardProps {
  diagram: DiagramRow
  onDelete: (id: string) => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

export default function DiagramCard({ diagram, onDelete }: DiagramCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    setDeleting(true)
    try {
      await fetch(`/api/diagrams/${diagram.id}`, { method: 'DELETE' })
      onDelete(diagram.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <Card className="group relative hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/diagrams/${diagram.id}`} className="block p-4">
        {/* Preview area */}
        <div className="w-full h-24 rounded-md bg-muted/50 flex items-center justify-center mb-3 border border-border">
          <GitGraph size={32} className="text-muted-foreground/40" />
        </div>

        {/* Info */}
        <div>
          <h3 className="font-medium text-sm truncate pr-6">{diagram.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {timeAgo(diagram.updated_at)}
          </p>
          <p className="text-xs text-muted-foreground">
            {diagram.nodes?.length ?? 0} nodes · {diagram.edges?.length ?? 0} edges
          </p>
        </div>
      </Link>

      {/* Delete button */}
      <Button
        variant={confirmDelete ? 'destructive' : 'ghost'}
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
        disabled={deleting}
        title={confirmDelete ? 'Click again to confirm' : 'Delete diagram'}
      >
        <Trash2 size={13} />
      </Button>
    </Card>
  )
}
