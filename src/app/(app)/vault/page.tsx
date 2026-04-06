'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import VaultItemCard from '@/components/vault/VaultItemCard'
import VaultItemForm from '@/components/vault/VaultItemForm'
import { Plus, Lock } from 'lucide-react'
import type { VaultItem, VaultCategory } from '@/lib/vault-types'

const CATEGORIES: VaultCategory[] = ['Password', 'API Key', 'Secure Note', 'Card', 'Other']

type FilterCategory = 'All' | VaultCategory

export default function VaultPage() {
  const [items, setItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<VaultItem | undefined>(undefined)

  useEffect(() => {
    fetch('/api/vault')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = useCallback((saved: VaultItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === saved.id)
      if (exists) {
        return prev.map((i) => (i.id === saved.id ? saved : i))
      }
      return [saved, ...prev]
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handleEdit = useCallback((item: VaultItem) => {
    setEditItem(item)
    setFormOpen(true)
  }, [])

  const handleNewEntry = useCallback(() => {
    setEditItem(undefined)
    setFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditItem(undefined)
  }, [])

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || item.category === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Securely store passwords, API keys, and notes
          </p>
        </div>
        <Button onClick={handleNewEntry} className="gap-2">
          <Plus size={16} />
          New Entry
        </Button>
      </div>

      {/* Search + Category filters */}
      <div className="mb-5 space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as FilterCategory[]).map((cat) => (
            <Badge
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              className="cursor-pointer select-none px-3 py-1 text-xs"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <Skeleton className="w-16 h-4 mb-2 rounded-full" />
              <Skeleton className="w-3/4 h-4 mb-3" />
              <Skeleton className="w-1/2 h-3 mb-2" />
              <Skeleton className="w-full h-3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lock size={48} className="text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium mb-2">No vault entries yet</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Add your passwords, API keys, and secure notes.
          </p>
          <Button onClick={handleNewEntry} className="gap-2">
            <Plus size={16} />
            Add your first entry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lock size={48} className="text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <VaultItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <VaultItemForm
          item={editItem}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
