import { auth } from '@clerk/nextjs/server'
import { getSupabaseServer } from '@/lib/supabase-server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 404 })
  if (data.user_id !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })
  return Response.json(data)
}

export async function PATCH(req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const supabase = getSupabaseServer()

  // Ownership check
  const { data: existing, error: fetchError } = await supabase
    .from('vault_items')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 404 })
  if (existing.user_id !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.title !== undefined) updates.title = body.title
  if (body.category !== undefined) updates.category = body.category
  if (body.username !== undefined) updates.username = body.username
  if (body.secret !== undefined) updates.secret = body.secret
  if (body.url !== undefined) updates.url = body.url
  if (body.notes !== undefined) updates.notes = body.notes

  const { data, error } = await supabase
    .from('vault_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const supabase = getSupabaseServer()

  // Ownership check
  const { data: existing, error: fetchError } = await supabase
    .from('vault_items')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 404 })
  if (existing.user_id !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('vault_items').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
