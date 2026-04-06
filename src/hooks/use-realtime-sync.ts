'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import type { AppNode, AppEdge } from '@/lib/diagram-types'

interface CollaboratorInfo {
  userId: string
  displayName: string
  initials: string
  color: string
}

interface BroadcastPayload {
  type: 'update'
  nodes: AppNode[]
  edges: AppEdge[]
  userId: string
}

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444',
]

function getColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface UseRealtimeSyncOptions {
  diagramId: string
  userId: string
  displayName: string
  nodes: AppNode[]
  edges: AppEdge[]
  onRemoteUpdate: (nodes: AppNode[], edges: AppEdge[]) => void
}

export function useRealtimeSync({
  diagramId,
  userId,
  displayName,
  nodes,
  edges,
  onRemoteUpdate,
}: UseRealtimeSyncOptions) {
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([])
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseBrowser>['channel']> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const supabase = getSupabaseBrowser()
    const channelName = `diagram:${diagramId}`

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    })

    channelRef.current = channel

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ displayName: string }>()
      const others: CollaboratorInfo[] = Object.entries(state)
        .filter(([key]) => key !== userId)
        .map(([key, presences]) => {
          const name = (presences as Array<{ displayName: string }>)[0]?.displayName ?? key
          return {
            userId: key,
            displayName: name,
            initials: getInitials(name),
            color: getColor(key),
          }
        })
      if (mountedRef.current) setCollaborators(others)
    })

    channel.on(
      'broadcast',
      { event: 'update' },
      ({ payload }: { payload: BroadcastPayload }) => {
        if (payload.userId !== userId) {
          onRemoteUpdate(payload.nodes, payload.edges)
        }
      }
    )

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ displayName })
      }
    })

    return () => {
      mountedRef.current = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId, userId])

  const broadcastUpdate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'update',
          payload: { type: 'update', nodes, edges, userId } as BroadcastPayload,
        })
      }
    }, 500)
  }, [nodes, edges, userId])

  return { collaborators, broadcastUpdate }
}
