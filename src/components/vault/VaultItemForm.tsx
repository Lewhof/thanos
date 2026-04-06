'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { VaultItem, VaultCategory } from '@/lib/vault-types'

const CATEGORIES: VaultCategory[] = ['Password', 'API Key', 'Secure Note', 'Card', 'Other']

interface VaultItemFormProps {
  item?: VaultItem
  onSave: (item: VaultItem) => void
  onClose: () => void
}

export default function VaultItemForm({ item, onSave, onClose }: VaultItemFormProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [category, setCategory] = useState<VaultCategory>(item?.category ?? 'Password')
  const [username, setUsername] = useState(item?.username ?? '')
  const [secret, setSecret] = useState(item?.secret ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const payload = {
      title: title.trim(),
      category,
      username: username.trim() || null,
      secret: secret || null,
      url: url.trim() || null,
      notes: notes.trim() || null,
    }

    try {
      const res = item
        ? await fetch(`/api/vault/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/vault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }

      const saved = await res.json()
      onSave(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [title, category, username, secret, url, notes, item, onSave, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">
            {item ? 'Edit Entry' : 'New Vault Entry'}
          </h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GitHub, AWS root, Stripe API..."
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    category === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Username / Email
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username@example.com"
              disabled={loading}
            />
          </div>

          {/* Secret */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {category === 'API Key' ? 'API Key' : category === 'Secure Note' ? 'Content' : 'Password / Secret'}
            </label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={category === 'API Key' ? 'sk-...' : '••••••••'}
                disabled={loading}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
              >
                {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              URL
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive mt-3">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              item ? 'Save Changes' : 'Add Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
