import { auth } from '@clerk/nextjs/server'
import { MODELS } from '@/lib/models'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const available = MODELS
    .filter((m) => Boolean(process.env[m.envKey]))
    .map((m) => m.id)

  return Response.json({ available })
}
