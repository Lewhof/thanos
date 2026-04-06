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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from '@/components/diagrams/nodes'
import NodePalette from '@/components/diagrams/NodePalette'
import DiagramToolbar from '@/components/diagrams/DiagramToolbar'
import EdgeInspector from '@/components/diagrams/EdgeInspector'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useDiagramHistory } from '@/hooks/use-diagram-history'
import { useDiagramShortcuts } from '@/hooks/use-diagram-shortcuts'
import { useExportPng } from '@/hooks/use-export-png'
import { useExportSvg } from '@/hooks/use-export-svg'
import type { AppNode, AppEdge, DiagramRow } from '@/lib/diagram-types'

const GRID_SIZE = 16

interface DiagramEditorInnerProps {
  diagram: DiagramRow
}

function DiagramEditorInner({ diagram }: DiagramEditorInnerProps) {
  const { fitView, screenToFlowPosition } = useReactFlow()
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
  const history = useDiagramHistory()
  const exportPng = useExportPng(title)
  const exportSvg = useExportSvg(title)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Enable auto-save after initial load
  useEffect(() => {
    const timer = setTimeout(() => setAutoSaveEnabled(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const saveStatus = useAutoSave(diagram.id, nodes, edges, autoSaveEnabled)

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

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
      history.push(nodes, [...edges, connection as AppEdge])
    },
    [setEdges, history, nodes, edges]
  )

  const onNodeDragStop = useCallback(() => {
    history.push(nodes, edges)
  }, [history, nodes, edges])

  const onEdgeClick: EdgeMouseHandler<AppEdge> = useCallback((_event, edge) => {
    setSelectedEdge(edge)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
  }, [])

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

      // Snap to grid if enabled
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
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFitView={() => fitView({ padding: 0.1 })}
        onExportPng={exportPng}
        onExportSvg={exportSvg}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        onToggleSnapToGrid={handleToggleSnapToGrid}
        onToggleColorMode={handleToggleColorMode}
        onTitleChange={handleTitleChange}
      />
      <div className="flex flex-1 overflow-hidden">
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
        </div>
      </div>
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
