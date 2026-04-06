import { LucideIcon, GitFork, FileText, MessageSquare, Activity } from 'lucide-react'
import { Layout } from 'react-grid-layout'

export type WidgetType = 'nav-stat' | 'agent-card' | 'recent-list'

export interface NavStatProps {
  title: string
  icon: LucideIcon
  value: string
  description: string
  href: string
}

export interface AgentCardProps {
  modelId: string
  label: string
}

export interface RecentListProps {
  title: string
  emptyMessage: string
}

export interface WidgetDef {
  id: string
  type: WidgetType
  title: string
  props: NavStatProps | AgentCardProps | RecentListProps
}

export const STORAGE_KEY = 'thanos:dashboard:layout'

export const DEFAULT_WIDGETS: WidgetDef[] = [
  { id: 'nav-diagrams', type: 'nav-stat', title: 'Diagrams', props: { title: 'Diagrams', icon: GitFork, value: '0', description: 'Flows & charts', href: '/diagrams' } },
  { id: 'nav-documents', type: 'nav-stat', title: 'Documents', props: { title: 'Documents', icon: FileText, value: '0', description: 'Uploaded files', href: '/documents' } },
  { id: 'nav-chat', type: 'nav-stat', title: 'Chat', props: { title: 'Chat', icon: MessageSquare, value: 'Online', description: 'AI assistant', href: '/chat' } },
  { id: 'nav-activity', type: 'nav-stat', title: 'Activity', props: { title: 'Activity', icon: Activity, value: 'Today', description: 'Recent actions', href: '#' } },
  { id: 'recent-documents', type: 'recent-list', title: 'Recent Documents', props: { title: 'Recent Documents', emptyMessage: 'No documents yet' } },
  { id: 'recent-diagrams', type: 'recent-list', title: 'Recent Diagrams', props: { title: 'Recent Diagrams', emptyMessage: 'No diagrams yet' } },
  { id: 'agent-gpt4o', type: 'agent-card', title: 'GPT-4o', props: { modelId: 'gpt-4o', label: 'GPT-4o' } },
  { id: 'agent-claude', type: 'agent-card', title: 'Claude', props: { modelId: 'claude-sonnet', label: 'Claude' } },
  { id: 'agent-gemini', type: 'agent-card', title: 'Gemini', props: { modelId: 'gemini-pro', label: 'Gemini' } },
]

export const DEFAULT_LAYOUT: Layout[] = [
  { i: 'nav-diagrams',    x: 0, y: 0,  w: 3, h: 3,  minW: 2, minH: 2 },
  { i: 'nav-documents',   x: 3, y: 0,  w: 3, h: 3,  minW: 2, minH: 2 },
  { i: 'nav-chat',        x: 6, y: 0,  w: 3, h: 3,  minW: 2, minH: 2 },
  { i: 'nav-activity',    x: 9, y: 0,  w: 3, h: 3,  minW: 2, minH: 2 },
  { i: 'recent-documents',x: 0, y: 3,  w: 6, h: 4,  minW: 3, minH: 3 },
  { i: 'recent-diagrams', x: 6, y: 3,  w: 6, h: 4,  minW: 3, minH: 3 },
  { i: 'agent-gpt4o',     x: 0, y: 7,  w: 4, h: 7,  minW: 3, minH: 5 },
  { i: 'agent-claude',    x: 4, y: 7,  w: 4, h: 7,  minW: 3, minH: 5 },
  { i: 'agent-gemini',    x: 8, y: 7,  w: 4, h: 7,  minW: 3, minH: 5 },
]
