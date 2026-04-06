// vault-001 SQL (run manually in Supabase):
//
// create table vault_items (
//   id uuid primary key default gen_random_uuid(),
//   user_id text not null,
//   title text not null,
//   category text not null default 'Other',
//   username text,
//   secret text,
//   url text,
//   notes text,
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );
//
// create index vault_items_user_id_idx on vault_items (user_id);
// alter table vault_items enable row level security;

export type VaultCategory = 'Password' | 'API Key' | 'Secure Note' | 'Card' | 'Other'

export interface VaultItem {
  id: string
  user_id: string
  title: string
  category: VaultCategory
  username: string | null
  secret: string | null
  url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
