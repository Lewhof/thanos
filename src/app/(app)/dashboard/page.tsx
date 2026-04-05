'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GitFork, FileText, MessageSquare, Activity, Send, ArrowRight } from 'lucide-react'
import { MODELS, type ModelId } from '@/lib/models'

const widgets = [
  {
    title: 'Diagrams',
    icon: GitFork,
    value: '0',
    description: 'Flows & charts',
    href: '/diagrams',
  },
  {
    title: 'Documents',
    icon: FileText,
    value: '0',
    description: 'Uploaded files',
    href: '/documents',
  },
  {
    title: 'Chat',
    icon: MessageSquare,
    value: 'Online',
    description: 'AI assistant',
    href: '/chat',
  },
  {
    title: 'Activity',
    icon: Activity,
    value: 'Today',
    description: 'Recent actions',
    href: '#',
  },
]

type AgentCardState = {
  input: string
  response: string
  streaming: boolean
}

function AgentCard({
  modelId,
  label,
  isAvailable,
}: {
  modelId: ModelId
  label: string
  isAvailable: boolean
}) {
  const router = useRouter()
  const [state, setState] = useState<AgentCardState>({
    input: '',
    response: '',
    streaming: false,
  })

  const send = async () => {
    const text = state.input.trim()
    if (!text || state.streaming || !isAvailable) return

    setState((s) => ({ ...s, input: '', response: '', streaming: true }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          model: modelId,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setState((s) => ({ ...s, response: s.response + chunk }))
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setState((s) => ({ ...s, response: msg }))
    } finally {
      setState((s) => ({ ...s, streaming: false }))
    }
  }

  const openChat = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-model', modelId)
    }
    router.push('/chat')
  }

  return (
    <Card className="flex flex-col min-h-[280px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-muted-foreground'}`}
          />
          <span className={isAvailable ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
            {isAvailable ? 'Online' : 'Offline'}
          </span>
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {/* Quick-send input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={state.input}
            onChange={(e) => setState((s) => ({ ...s, input: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                send()
              }
            }}
            disabled={!isAvailable || state.streaming}
            placeholder={isAvailable ? 'Ask something…' : 'Model offline'}
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={send}
            disabled={!isAvailable || state.streaming || !state.input.trim()}
            size="icon"
            variant="secondary"
            className="shrink-0"
          >
            <Send size={14} />
          </Button>
        </div>

        {/* Response area */}
        <div className="flex-1 min-h-[100px] max-h-[160px] overflow-y-auto rounded-md border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed">
          {state.streaming && !state.response ? (
            <span className="text-muted-foreground">...</span>
          ) : state.response ? (
            <span className="whitespace-pre-wrap">
              {state.response}
              {state.streaming && <span className="animate-pulse">▍</span>}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              Response will appear here.
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <button
          onClick={openChat}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Open chat <ArrowRight size={12} />
        </button>
      </CardFooter>
    </Card>
  )
}

export default function DashboardPage() {
  const [availableModels, setAvailableModels] = useState<ModelId[]>([])

  useEffect(() => {
    fetch('/api/chat/models')
      .then((r) => r.json())
      .then(({ available }: { available: ModelId[] }) => {
        setAvailableModels(available)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Lew.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {widgets.map(({ title, icon: Icon, value, description }) => (
          <Card key={title} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No documents yet. Upload your first file.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Diagrams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No diagrams yet. Create your first flow.</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODELS.map((model) => (
            <AgentCard
              key={model.id}
              modelId={model.id}
              label={model.label}
              isAvailable={availableModels.includes(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
