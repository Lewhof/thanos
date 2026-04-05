import OpenAI from 'openai'
import { auth } from '@clerk/nextjs/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json()

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2048,
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are Thanos — Lew's personal AI assistant. Direct, precise, no fluff.
Lead with the answer. Use tables when comparing options. No emojis. No exclamation marks.`,
      },
      ...messages,
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
