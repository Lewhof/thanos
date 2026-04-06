'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DiagramCard from '@/components/diagrams/DiagramCard'
import { Plus, GitGraph } from 'lucide-react'
import type { DiagramRow } from '@/lib/diagram-types'

export default function DiagramsPage() {
  const router = useRouter()
  const [diagrams, setDiagrams] = useState<DiagramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/diagrams')
      .then((res) => res.json())
      .then((data) => {
        setDiagrams(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/diagrams', { method: 'POST' })
      const data = await res.json()
      router.push(`/diagrams/${data.id}`)
    } catch {
      setCreating(false)
    }
  }, [router])

  const handleDelete = useCallback((id: string) => {
    setDiagrams((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Diagrams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your flow diagrams
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="gap-2">
          <Plus size={16} />
          {creating ? 'Creating…' : 'New Diagram'}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <Skeleton className="w-full h-24 mb-3 rounded-md" />
              <Skeleton className="w-3/4 h-4 mb-2" />
              <Skeleton className="w-1/2 h-3" />
            </div>
          ))}
        </div>
      ) : diagrams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <GitGraph size={48} className="text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium mb-2">No diagrams yet</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first diagram to get started.
          </p>
          <Button onClick={handleCreate} disabled={creating} className="gap-2">
            <Plus size={16} />
            {creating ? 'Creating…' : 'Create your first diagram'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {diagrams.map((diagram) => (
            <DiagramCard
              key={diagram.id}
              diagram={diagram}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
