import { auth } from '@clerk/nextjs/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['default', 'input', 'output', 'decision', 'process', 'database', 'cloud', 'actor', 'note']),
  label: z.string(),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
})

const DiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { prompt } = body as { prompt: string }

  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 })
  }

  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: DiagramSchema,
      prompt: `Generate a diagram for: "${prompt}".

Return a set of nodes and edges that represent this concept visually.
Guidelines:
- Use 'input' type for start/entry nodes
- Use 'output' type for end/exit/terminal nodes
- Use 'decision' type for branching/conditional nodes
- Use 'process' type for action/process nodes
- Use 'database' type for data storage nodes
- Use 'default' type for general boxes
- Keep labels short and descriptive (2-5 words max)
- Create 5-15 nodes and appropriate edges
- Node IDs should be simple like "n1", "n2", etc.
- Edge IDs should be like "e1", "e2", etc.
- Make the diagram logical and easy to understand`,
    })

    return Response.json(object)
  } catch (err) {
    console.error('AI generate error:', err)
    return Response.json({ error: 'Failed to generate diagram' }, { status: 500 })
  }
}
