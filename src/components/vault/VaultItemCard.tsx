'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Copy, Check, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { VaultItem, VaultCategory } from '@/lib/vault-types'

interface VaultItemCardProps {
  item: VaultItem
  onEdit: (item: VaultItem) => void
  onDelete: (id: string) => void
}

const categoryColors: Record<VaultCategory, string> = {
  Password: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'API Key': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'Secure Note': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Card: 'bg-green-500/15 text-green-400 border-green-500/20',
  Other: 'bg-muted text-muted-foreground border-border',
}

export default function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.secret) return
    await navigator.clipboard.writeText(item.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    try {
      await fetch(`/api/vault/${item.id}`, { method: 'DELETE' })
      onDelete(item.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(item)
  }

  return (
    <Card className="group relative p-4 hover:shadow-md transition-shadow">
      {/* Category badge + title */}
      <div className="mb-2 pr-16">
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 mb-1.5 ${categoryColors[item.category]}`}
        >
          {item.category}
        </Badge>
        <h3 className="font-medium text-sm truncate">{item.title}</h3>
      </div>

      {/* Username */}
      {item.username && (
        <p className="text-xs text-muted-foreground truncate mb-1">{item.username}</p>
      )}

      {/* Secret */}
      {item.secret && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-muted-foreground font-mono flex-1 truncate">
            {showSecret ? item.secret : '••••••••'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSecret((v) => !v) }}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent transition-colors shrink-0"
            title={showSecret ? 'Hide' : 'Show'}
          >
            {showSecret ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
          <button
            onClick={handleCopy}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent transition-colors shrink-0"
            title="Copy secret"
          >
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
          </button>
        </div>
      )}

      {/* URL */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 truncate mt-1"
        >
          <ExternalLink size={10} className="shrink-0" />
          <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
        </a>
      )}

      {/* Edit + Delete buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleEdit}
          title="Edit"
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant={confirmDelete ? 'destructive' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleDelete}
          disabled={deleting}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </Card>
  )
}
