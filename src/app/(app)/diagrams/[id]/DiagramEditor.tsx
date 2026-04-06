'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  type Connection,
  type EdgeMouseHandler,
  type IsValidConnection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { useUser } from '@clerk/nextjs'
import { nodeTypes } from '@/components/diagrams/nodes'
import NodePalette from '@/components/diagrams/NodePalette'
import DiagramToolbar from '@/components/diagrams/DiagramToolbar'
import EdgeInspector from '@/components/diagrams/EdgeInspector'
import AiGenerateModal from '@/components/diagrams/AiGenerateModal'
import TemplatesModal from '@/components/diagrams/TemplatesModal'
import EdgeLabelPopover from '@/components/diagrams/EdgeLabelPopover'
import CommentsPanel from '@/components/diagrams/CommentsPanel'
import PresentationMode from '@/components/diagrams/PresentationMode'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useDiagramHistory } from '@/hooks/use-diagram-history'
import { useDiagramShortcuts } from '@/hooks/use-diagram-shortcuts'
import { useExportPng } from '@/hooks/use-export-png'
import { useExportSvg } from '@/hooks/use-export-svg'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import type { AppNode, AppEdge, DiagramRow, CommentNodeData } from '@/lib/diagram-types'

const GRID_SIZE = 16

// --- Dagre layout helper ---
function applyDagreLayout(
  nodes: AppNode[],
  edges: AppEdge[],
  direction: 'TB' | 'LR' = 'TB'
): AppNode[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 })

  for (const node of nodes) {
    g.setNode(node.id, { width: 160, height: 60 })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - 80,
        y: pos.y - 30,
      },
    }
  })
}

interface DiagramEditorInnerProps {
  diagram: DiagramRow
}

function DiagramEditorInner({ diagram }: DiagramEditorInnerProps) {
  const { fitView, screenToFlowPosition, setCenter } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(diagram.nodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(diagram.edges ?? [])
  const [title, setTitle] = useState(diagram.title)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<AppEdge | null>(null)
  const [showMinimap, setShowMinimap] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [colorMode, setColorMode] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('diagram-color-mode') as 'dark' | 'light') ?? 'dark'
    }
    return 'dark'
  })

  // Feature A: AI Generate
  const [aiModalOpen, setAiModalOpen] = useState(false)

  // Feature B: Templates
  const [templatesOpen, setTemplatesOpen] = useState(false)

  // Feature D: Edge label popover
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [edgeLabelPos, setEdgeLabelPos] = useState<{ x: number; y: number } | null>(null)

  // Feature E: Comments
  const [showCommentsPanel, setShowCommentsPanel] = useState(false)

  // Feature F: Presentation Mode
  const [presentationActive, setPresentationActive] = useState(false)

  const { user } = useUser()
  const history = useDiagramHistory()
  const exportPng = useExportPng(title)
  const exportSvg = useExportSvg(title)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Feature C: Realtime sync
  const { collaborators, broadcastUpdate } = useRealtimeSync({
    diagramId: diagram.id,
    userId: user?.id ?? 'anonymous',
    displayName: user?.fullName ?? user?.username ?? 'Anonymous',
    nodes,
    edges,
    onRemoteUpdate: (remoteNodes, remoteEdges) => {
      setNodes(remoteNodes)
      setEdges(remoteEdges)
    },
  })

  // Enable auto-save after initial load
  useEffect(() => {
    const timer = setTimeout(() => setAutoSaveEnabled(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const saveStatus = useAutoSave(diagram.id, nodes, edges, autoSaveEnabled)

  // Broadcast on every nodes/edges change
  useEffect(() => {
    if (autoSaveEnabled) {
      broadcastUpdate()
    }
  }, [nodes, edges, autoSaveEnabled, broadcastUpdate])

  const handleSaveNow = useCallback(async () => {
    await fetch(`/api/diagrams/${diagram.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    })
  }, [diagram.id, nodes, edges])

  const handleTitleChange = useCallback(async (newTitle: string) => {
    setTitle(newTitle)
    await fetch(`/api/diagrams/${diagram.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
  }, [diagram.id])

  // Feature D: Smart Connectors - connection validation
  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      const { source, target } = connection

      // Self-loop prevention
      if (source === target) return false

      // Duplicate edge prevention
      const duplicate = edges.some(
        (e) => e.source === source && e.target === target
      )
      if (duplicate) return false

      return true
    },
    [edges]
  )

  // Feature D: onConnect with label popover
  const onConnect = useCallback(
    (connection: Connection) => {
      setPendingConnection(connection)
      // Try to position near center of screen as fallback
      const wrapperEl = reactFlowWrapper.current
      if (wrapperEl) {
        const rect = wrapperEl.getBoundingClientRect()
        setEdgeLabelPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      }
    },
    []
  )

  const confirmEdgeLabel = useCallback(
    (label: string) => {
      if (!pendingConnection) return
      const newEdge: AppEdge = {
        ...pendingConnection,
        id: crypto.randomUUID(),
        type: 'smoothstep',
        ...(label.trim() ? { label: label.trim() } : {}),
      } as AppEdge
      setEdges((eds) => addEdge(newEdge, eds))
      history.push(nodes, [...edges, newEdge])
      setPendingConnection(null)
      setEdgeLabelPos(null)
    },
    [pendingConnection, setEdges, history, nodes, edges]
  )

  const dismissEdgeLabel = useCallback(() => {
    if (pendingConnection) {
      // Add edge without label
      confirmEdgeLabel('')
    }
    setPendingConnection(null)
    setEdgeLabelPos(null)
  }, [pendingConnection, confirmEdgeLabel])

  const onNodeDragStop = useCallback(() => {
    history.push(nodes, edges)
  }, [history, nodes, edges])

  const onEdgeClick: EdgeMouseHandler<AppEdge> = useCallback((_event, edge) => {
    setSelectedEdge(edge)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    if (pendingConnection) dismissEdgeLabel()
  }, [pendingConnection, dismissEdgeLabel])

  const handleUndo = useCallback(() => {
    const snapshot = history.undo()
    if (snapshot) {
      setNodes(snapshot.nodes)
      setEdges(snapshot.edges)
    }
  }, [history, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    const snapshot = history.redo()
    if (snapshot) {
      setNodes(snapshot.nodes)
      setEdges(snapshot.edges)
    }
  }, [history, setNodes, setEdges])

  const handleToggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('diagram-color-mode', next)
      return next
    })
  }, [])

  const handleToggleSnapToGrid = useCallback(() => {
    setSnapToGrid((v) => !v)
  }, [])

  useDiagramShortcuts({
    nodes,
    edges,
    setNodes,
    setEdges,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSaveNow,
  })

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData('application/reactflow')
      if (!nodeType) return

      let position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      if (snapToGrid) {
        position = {
          x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
        }
      }

      const newNode: AppNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: { label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1) },
      }

      setNodes((nds) => {
        const updated = [...nds, newNode]
        history.push(updated, edges)
        return updated
      })
    },
    [screenToFlowPosition, setNodes, history, edges, snapToGrid]
  )

  // Feature A: AI Generate - insert nodes with dagre layout
  const handleAiGenerate = useCallback(
    (generatedNodes: Array<{ id: string; type: string; label: string }>, generatedEdges: Array<{ id: string; source: string; target: string; label?: string }>) => {
      const offsetX = 100
      const offsetY = nodes.length > 0 ? Math.max(...nodes.map((n) => n.position.y + 100)) + 100 : 0

      const appNodes: AppNode[] = generatedNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: offsetX, y: offsetY },
        data: { label: n.label },
      }))

      const appEdges: AppEdge[] = generatedEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        ...(e.label ? { label: e.label } : {}),
      }))

      // Apply dagre layout
      const laid = applyDagreLayout(appNodes, appEdges)

      setNodes((nds) => {
        const updated = [...nds, ...laid]
        history.push(updated, [...edges, ...appEdges])
        return updated
      })
      setEdges((eds) => [...eds, ...appEdges])

      setTimeout(() => fitView({ padding: 0.15 }), 100)
    },
    [nodes, edges, setNodes, setEdges, history, fitView]
  )

  // Feature B: Load template
  const handleLoadTemplate = useCallback(
    (templateNodes: AppNode[], templateEdges: AppEdge[]) => {
      setNodes(templateNodes)
      setEdges(templateEdges)
      history.push(templateNodes, templateEdges)
      setTimeout(() => fitView({ padding: 0.15 }), 100)
    },
    [setNodes, setEdges, history, fitView]
  )

  // Feature E: Add Comment
  const handleAddComment = useCallback(() => {
    const wrapperEl = reactFlowWrapper.current
    let position = { x: 100, y: 100 }
    if (wrapperEl) {
      const rect = wrapperEl.getBoundingClientRect()
      position = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }

    const commentData: CommentNodeData = {
      label: 'Comment',
      text: '',
      author: user?.fullName ?? user?.username ?? 'Anonymous',
      createdAt: new Date().toISOString(),
    }

    const newNode: AppNode = {
      id: crypto.randomUUID(),
      type: 'comment',
      position,
      data: commentData,
    }

    setNodes((nds) => {
      const updated = [...nds, newNode]
      history.push(updated, edges)
      return updated
    })
  }, [screenToFlowPosition, user, setNodes, history, edges])

  // Feature E: Select comment (pan to it)
  const handleSelectComment = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setCenter(node.position.x + 80, node.position.y + 50, { duration: 500, zoom: 1.2 })
      }
    },
    [nodes, setCenter]
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DiagramToolbar
        diagramId={diagram.id}
        title={title}
        saveStatus={saveStatus}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        showMinimap={showMinimap}
        snapToGrid={snapToGrid}
        colorMode={colorMode}
        collaborators={collaborators}
        presentationActive={presentationActive}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFitView={() => fitView({ padding: 0.1 })}
        onExportPng={exportPng}
        onExportSvg={exportSvg}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        onToggleSnapToGrid={handleToggleSnapToGrid}
        onToggleColorMode={handleToggleColorMode}
        onTitleChange={handleTitleChange}
        onAiGenerate={() => setAiModalOpen(true)}
        onTemplates={() => setTemplatesOpen(true)}
        onAddComment={handleAddComment}
        onTogglePresentation={() => setPresentationActive((v) => !v)}
        onToggleComments={() => setShowCommentsPanel((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <NodePalette />
        <div
          ref={reactFlowWrapper}
          className="flex-1 relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            fitView
            colorMode={colorMode}
            deleteKeyCode={null}
            snapToGrid={snapToGrid}
            snapGrid={[GRID_SIZE, GRID_SIZE]}
          >
            <Controls />
            {showMinimap && <MiniMap />}
            <Background
              variant={snapToGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots}
              gap={GRID_SIZE}
              size={snapToGrid ? 0.5 : 1}
            />
            <Panel position="bottom-right">
              <EdgeInspector
                selectedEdge={selectedEdge}
                onClose={() => setSelectedEdge(null)}
              />
            </Panel>
          </ReactFlow>

          {/* Feature F: Presentation mode overlay */}
          <PresentationMode
            active={presentationActive}
            nodes={nodes}
            onExit={() => setPresentationActive(false)}
          />
        </div>

        {/* Feature E: Comments panel */}
        <CommentsPanel
          open={showCommentsPanel}
          nodes={nodes}
          onClose={() => setShowCommentsPanel(false)}
          onSelectComment={handleSelectComment}
        />
      </div>

      {/* Feature A: AI Generate Modal */}
      <AiGenerateModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleAiGenerate}
      />

      {/* Feature B: Templates Modal */}
      <TemplatesModal
        open={templatesOpen}
        hasContent={nodes.length > 0}
        onClose={() => setTemplatesOpen(false)}
        onLoad={handleLoadTemplate}
      />

      {/* Feature D: Edge label popover */}
      <EdgeLabelPopover
        position={edgeLabelPos}
        onConfirm={confirmEdgeLabel}
        onDismiss={dismissEdgeLabel}
      />
    </div>
  )
}

interface DiagramEditorProps {
  id: string
}

export default function DiagramEditor({ id }: DiagramEditorProps) {
  const [diagram, setDiagram] = useState<DiagramRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/diagrams/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load diagram')
        return res.json()
      })
      .then(setDiagram)
      .catch((err: Error) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!diagram) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading diagram…</div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <DiagramEditorInner diagram={diagram} />
    </ReactFlowProvider>
  )
}
