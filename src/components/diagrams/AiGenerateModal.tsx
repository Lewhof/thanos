'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, X, Loader2 } from 'lucide-react'

interface GeneratedNode {
  id: string
  type: string
  label: string
}

interface GeneratedEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface AiGenerateModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (nodes: GeneratedNode[], edges: GeneratedEdge[]) => void
}

export default function AiGenerateModal({ open, onClose, onGenerate }: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diagrams/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate')
      }
      const data = await res.json()
      onGenerate(data.nodes, data.edges)
      setPrompt('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [prompt, onGenerate, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="text-base font-semibold">AI Generate Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Describe what you want to diagram and AI will generate nodes and edges for you.
        </p>

        <textarea
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="e.g. User authentication flow, E-commerce checkout process, Microservices architecture..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleGenerate()
            }
          }}
          disabled={loading}
        />

        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}

        <div className="flex items-center justify-between mt-4 gap-3">
          <span className="text-xs text-muted-foreground">Ctrl+Enter to generate</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={14} className="mr-1.5" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
