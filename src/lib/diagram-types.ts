import type { Node, Edge } from '@xyflow/react'

export interface DiagramRow {
  id: string
  user_id: string
  title: string
  nodes: AppNode[]
  edges: AppEdge[]
  created_at: string
  updated_at: string
}

export type AppNode = Node<{ label: string; color?: string }>

export type AppEdge = Edge

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'
