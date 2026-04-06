'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODELS, DEFAULT_MODEL, type ModelId } from '@/lib/models'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  modelLabel?: string
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "I'm Thanos. What are we working on?",
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL)
  const [availableModels, setAvailableModels] = useState<ModelId[]>([DEFAULT_MODEL])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-model') as ModelId | null
      if (saved) setSelectedModel(saved)
    }
  }, [])

  useEffect(() => {
    fetch('/api/chat/models')
      .then((r) => r.json())
      .then(({ available }: { available: ModelId[] }) => {
        setAvailableModels(available)
        if (available.length > 0 && !available.includes(selectedModel)) {
          setSelectedModel(available[0])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-model', selectedModel)
    }
  }, [selectedModel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `HTTP ${res.status}`)
      }

      const modelConfig = MODELS.find((m) => m.id === selectedModel)
      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', modelLabel: modelConfig?.label },
      ])

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          )
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: msg },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    /*
     * On mobile the input is fixed to the bottom of the viewport.
     * We use padding-bottom on the messages area to keep content
     * visible above it, and dvh (dynamic viewport height) so the
     * layout shrinks when the soft keyboard appears.
     */
    <div className="flex flex-col h-screen md:h-screen" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
        <h1 className="text-sm font-semibold">Chat — Thanos</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-background p-0.5 overflow-x-auto max-w-[60vw] md:max-w-none">
          {MODELS.map((m) => {
            const isAvailable = availableModels.includes(m.id)
            const isSelected = selectedModel === m.id
            return (
              <button
                key={m.id}
                onClick={() => isAvailable && setSelectedModel(m.id)}
                disabled={!isAvailable}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  !isAvailable && 'opacity-30 cursor-not-allowed pointer-events-none'
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Messages — scrolls above the fixed input on mobile */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 pb-24 md:pb-6">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' ? (
              <div className="max-w-[85%] md:max-w-[70%]">
                {m.modelLabel && (
                  <p className="text-[10px] text-muted-foreground mb-1 px-1">{m.modelLabel}</p>
                )}
                <div className="rounded-xl px-4 py-3 text-sm leading-relaxed bg-card border border-border text-foreground">
                  {m.content || <span className="opacity-40">...</span>}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] md:max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed bg-primary text-primary-foreground">
                {m.content}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input — fixed on mobile, normal flow on desktop */}
      <div className="fixed md:relative bottom-14 md:bottom-auto left-0 right-0 md:left-auto md:right-auto px-4 md:px-6 py-3 md:py-4 border-t border-border bg-card shrink-0">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Message Thanos..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
