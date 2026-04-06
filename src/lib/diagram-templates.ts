import type { AppNode, AppEdge } from './diagram-types'

export interface DiagramTemplate {
  id: string
  name: string
  description: string
  icon: string
  nodes: AppNode[]
  edges: AppEdge[]
}

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Start → decision → branches → end flow',
    icon: '⬥',
    nodes: [
      { id: 'n1', type: 'input', position: { x: 200, y: 0 }, data: { label: 'Start' } },
      { id: 'n2', type: 'process', position: { x: 200, y: 100 }, data: { label: 'Validate Input' } },
      { id: 'n3', type: 'decision', position: { x: 200, y: 220 }, data: { label: 'Valid?' } },
      { id: 'n4', type: 'process', position: { x: 50, y: 360 }, data: { label: 'Show Error' } },
      { id: 'n5', type: 'process', position: { x: 350, y: 360 }, data: { label: 'Process Request' } },
      { id: 'n6', type: 'default', position: { x: 350, y: 480 }, data: { label: 'Save to DB' } },
      { id: 'n7', type: 'output', position: { x: 200, y: 600 }, data: { label: 'End' } },
    ] as AppNode[],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
      { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
      { id: 'e3', source: 'n3', target: 'n4', label: 'No', type: 'smoothstep' },
      { id: 'e4', source: 'n3', target: 'n5', label: 'Yes', type: 'smoothstep' },
      { id: 'e5', source: 'n4', target: 'n7', type: 'smoothstep' },
      { id: 'e6', source: 'n5', target: 'n6', type: 'smoothstep' },
      { id: 'e7', source: 'n6', target: 'n7', type: 'smoothstep' },
    ] as AppEdge[],
  },
  {
    id: 'erd',
    name: 'ERD',
    description: 'Entity-relationship diagram with 3 entities',
    icon: '⬜',
    nodes: [
      { id: 'n1', type: 'group', position: { x: 0, y: 100 }, data: { label: 'User\n─────\nid (PK)\nname\nemail\ncreated_at' }, style: { width: 160, height: 130 } },
      { id: 'n2', type: 'group', position: { x: 300, y: 100 }, data: { label: 'Order\n─────\nid (PK)\nuser_id (FK)\nstatus\ntotal' }, style: { width: 160, height: 130 } },
      { id: 'n3', type: 'group', position: { x: 600, y: 100 }, data: { label: 'Product\n─────\nid (PK)\nname\nprice\nstock' }, style: { width: 160, height: 130 } },
      { id: 'n4', type: 'group', position: { x: 300, y: 340 }, data: { label: 'OrderItem\n─────\norder_id (FK)\nproduct_id (FK)\nquantity' }, style: { width: 160, height: 110 } },
    ] as AppNode[],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: '1 : N', type: 'smoothstep' },
      { id: 'e2', source: 'n2', target: 'n4', label: '1 : N', type: 'smoothstep' },
      { id: 'e3', source: 'n3', target: 'n4', label: 'N : M', type: 'smoothstep' },
    ] as AppEdge[],
  },
  {
    id: 'sequence',
    name: 'Sequence',
    description: 'Swimlane-style message sequence diagram',
    icon: '↕',
    nodes: [
      { id: 'a1', type: 'actor', position: { x: 80, y: 20 }, data: { label: 'Client' } },
      { id: 'a2', type: 'actor', position: { x: 300, y: 20 }, data: { label: 'API Gateway' } },
      { id: 'a3', type: 'actor', position: { x: 520, y: 20 }, data: { label: 'Auth Service' } },
      { id: 'a4', type: 'database', position: { x: 740, y: 20 }, data: { label: 'Database' } },
      { id: 'm1', type: 'default', position: { x: 180, y: 120 }, data: { label: 'POST /login' } },
      { id: 'm2', type: 'default', position: { x: 400, y: 200 }, data: { label: 'Validate token' } },
      { id: 'm3', type: 'default', position: { x: 620, y: 280 }, data: { label: 'Query user' } },
      { id: 'm4', type: 'default', position: { x: 400, y: 360 }, data: { label: 'JWT issued' } },
      { id: 'm5', type: 'default', position: { x: 180, y: 440 }, data: { label: '200 OK + token' } },
    ] as AppNode[],
    edges: [
      { id: 'e1', source: 'a1', target: 'm1', type: 'smoothstep' },
      { id: 'e2', source: 'm1', target: 'a2', type: 'smoothstep' },
      { id: 'e3', source: 'a2', target: 'm2', type: 'smoothstep' },
      { id: 'e4', source: 'm2', target: 'a3', type: 'smoothstep' },
      { id: 'e5', source: 'a3', target: 'm3', type: 'smoothstep' },
      { id: 'e6', source: 'm3', target: 'a4', type: 'smoothstep' },
      { id: 'e7', source: 'a3', target: 'm4', label: 'success', type: 'smoothstep' },
      { id: 'e8', source: 'a2', target: 'm5', type: 'smoothstep' },
      { id: 'e9', source: 'm5', target: 'a1', type: 'smoothstep' },
    ] as AppEdge[],
  },
  {
    id: 'org-chart',
    name: 'Org Chart',
    description: '3-level hierarchy with 8 nodes',
    icon: '🏢',
    nodes: [
      { id: 'n1', type: 'default', position: { x: 300, y: 0 }, data: { label: 'CEO' } },
      { id: 'n2', type: 'default', position: { x: 100, y: 120 }, data: { label: 'CTO' } },
      { id: 'n3', type: 'default', position: { x: 500, y: 120 }, data: { label: 'COO' } },
      { id: 'n4', type: 'default', position: { x: 0, y: 260 }, data: { label: 'Engineering' } },
      { id: 'n5', type: 'default', position: { x: 160, y: 260 }, data: { label: 'Design' } },
      { id: 'n6', type: 'default', position: { x: 350, y: 260 }, data: { label: 'Operations' } },
      { id: 'n7', type: 'default', position: { x: 510, y: 260 }, data: { label: 'Finance' } },
      { id: 'n8', type: 'default', position: { x: 670, y: 260 }, data: { label: 'HR' } },
    ] as AppNode[],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
      { id: 'e2', source: 'n1', target: 'n3', type: 'smoothstep' },
      { id: 'e3', source: 'n2', target: 'n4', type: 'smoothstep' },
      { id: 'e4', source: 'n2', target: 'n5', type: 'smoothstep' },
      { id: 'e5', source: 'n3', target: 'n6', type: 'smoothstep' },
      { id: 'e6', source: 'n3', target: 'n7', type: 'smoothstep' },
      { id: 'e7', source: 'n3', target: 'n8', type: 'smoothstep' },
    ] as AppEdge[],
  },
]
