import { getSupabaseServer } from '@/lib/supabase-server'

// One-time migration endpoint — safe to call multiple times (idempotent)
// Requires MIGRATE_SECRET env var to prevent unauthorized calls
export async function POST(req: Request) {
  const secret = req.headers.get('x-migrate-secret')
  const expected = process.env.MIGRATE_SECRET ?? 'ironman-migrate-2026'
  if (secret !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseServer()

  // Check if diagrams table exists by querying it
  const { error: checkError } = await supabase
    .from('diagrams')
    .select('id')
    .limit(1)

  if (!checkError) {
    return Response.json({ message: 'diagrams table already exists', created: false })
  }

  if (checkError.code !== 'PGRST205') {
    return Response.json({ error: checkError.message }, { status: 500 })
  }

  // Table doesn't exist — we can't create DDL via PostgREST
  // Return instructions for manual creation
  return Response.json({
    message: 'diagrams table does not exist',
    created: false,
    sql: `
CREATE TABLE IF NOT EXISTS diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default',
  title text NOT NULL DEFAULT 'Untitled Diagram',
  nodes jsonb NOT NULL DEFAULT '[]',
  edges jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS diagrams_user_id_idx ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagrams_updated_at_idx ON diagrams(updated_at DESC);
    `.trim(),
    instructions: 'Run the SQL above in the Supabase dashboard SQL editor',
  })
}

export async function GET() {
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('diagrams').select('id').limit(1)

  if (!error) {
    return Response.json({ status: 'ok', table: 'diagrams', exists: true })
  }

  if (error.code === 'PGRST205') {
    return Response.json({ status: 'missing', table: 'diagrams', exists: false })
  }

  return Response.json({ status: 'error', error: error.message }, { status: 500 })
}
