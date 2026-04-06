import { auth } from '@clerk/nextjs/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('diagrams')
    .insert({
      user_id: userId,
      title: 'Untitled Diagram',
      nodes: [],
      edges: [],
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
