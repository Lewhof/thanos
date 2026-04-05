import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { MODELS, DEFAULT_MODEL, type ModelId } from '@/lib/models'

const SYSTEM_PROMPT = `You are Thanos — Lew's personal AI assistant. Direct, precise, no fluff.
Lead with the answer. Use tables when comparing options. No emojis. No exclamation marks.`

function makeStream(fn: (writer: WritableStreamDefaultWriter<Uint8Array>) => Promise<void>): ReadableStream<Uint8Array> {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  fn(writer).catch(() => {}).finally(() => writer.close().catch(() => {}))
  return readable
}

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
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' }

    if (config.provider === 'openai') {
      const openai = new OpenAI({ apiKey })
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 2048,
        stream: true,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      })
      return new Response(
        makeStream(async (writer) => {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) await writer.write(encoder.encode(text))
          }
        }),
        { headers }
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
        makeStream(async (writer) => {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              await writer.write(encoder.encode(event.delta.text))
            }
          }
        }),
        { headers }
      )
    }

    if (config.provider === 'google') {
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      })
      const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const lastMessage = messages[messages.length - 1].content
      const chat = geminiModel.startChat({ history })
      const result = await chat.sendMessageStream(lastMessage)
      return new Response(
        makeStream(async (writer) => {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) await writer.write(encoder.encode(text))
          }
        }),
        { headers }
      )
    }

    return new Response('Unhandled provider', { status: 500 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(msg, { status: 500 })
  }
}
