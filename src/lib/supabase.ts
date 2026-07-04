// Supabase client with reactivity-aware auth state handling.
// The browser only ever sees VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// (the anon key is safe to expose when RLS policies are correctly scoped).

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl, isDemoMode } from './env'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client

  _client = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    },
  )
  return _client
}

export const supabase = getSupabase()

export type { Session }
export { isDemoMode }
