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

export interface CommentNodeData extends Record<string, unknown> {
  label: string
  text: string
  author: string
  createdAt: string
  color?: string
  slideIndex?: number
}

export interface StandardNodeData extends Record<string, unknown> {
  label: string
  color?: string
  slideIndex?: number
}

export type AppNode =
  | Node<StandardNodeData>
  | Node<CommentNodeData>

export type AppEdge = Edge

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'
