import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { MODELS, DEFAULT_MODEL, type ModelId } from '@/lib/models'

const SYSTEM_PROMPT = `You are Thanos — Lew's personal AI assistant. Direct, precise, no fluff.
Lead with the answer. Use tables when comparing options. No emojis. No exclamation marks.`

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { messages, model: rawModel } = await req.json()
  const modelId: ModelId = rawModel ?? DEFAULT_MODEL

  const config = MODELS.find((m) => m.id === modelId)
  if (!config) return new Response('Unknown model', { status: 400 })

  const apiKey = process.env[config.envKey]
  if (!apiKey) return new Response(`Provider not configured: ${config.provider}`, { status: 503 })

  const encoder = new TextEncoder()

  if (config.provider === 'openai') {
    const openai = new OpenAI({ apiKey })
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    })
    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  if (config.provider === 'anthropic') {
    const anthropic = new Anthropic({ apiKey })
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    })
    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  if (config.provider === 'google') {
    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages[messages.length - 1].content
    const chat = geminiModel.startChat({ history, systemInstruction: SYSTEM_PROMPT })
    const result = await chat.sendMessageStream(lastMessage)
    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        },
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  return new Response('Unhandled provider', { status: 500 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message + '\n' + err.stack : String(err)
    console.error('Chat route error:', msg)
    return new Response(msg, { status: 500 })
  }
}
