'use client'

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Plus, Save } from 'lucide-react'

const initialNodes = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: { label: 'Start' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 250, y: 220 },
    data: { label: 'Process' },
  },
  {
    id: '3',
    position: { x: 250, y: 340 },
    data: { label: 'End' },
    type: 'output',
  },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
]

let nodeId = 4

export default function DiagramsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [diagramName] = useState('Untitled Diagram')

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const addNode = useCallback(() => {
    setNodes((nds) => [
      ...nds,
      {
        id: String(nodeId++),
        position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
        data: { label: `Node ${nodeId - 1}` },
      },
    ])
  }, [setNodes])

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <h1 className="text-sm font-semibold">{diagramName}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addNode}>
            <Plus size={14} className="mr-1" /> Add Node
          </Button>
          <Button size="sm">
            <Save size={14} className="mr-1" /> Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}
