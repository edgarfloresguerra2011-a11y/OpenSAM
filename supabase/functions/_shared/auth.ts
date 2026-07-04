// Auth helper — verifies the Supabase JWT sent by the browser client.
// Every protected Edge Function should call `requireUser(req)` first.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AuthContext {
  userId: string;
  email: string | null;
  supabase: SupabaseClient;
}

/**
 * Extracts the user from the Authorization header (Bearer JWT) and returns
 * a Supabase client scoped to that user (so RLS policies apply).
 *
 * Throws an Error with a human-readable message if auth fails — callers
 * should convert that into a 401 JSON response.
 */
export async function requireUser(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    throw new AuthError('Server misconfigured: missing Supabase env vars', 500);
  }

  // Client running with the user's JWT — RLS will enforce row ownership.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('Invalid or expired session', 401);
  }

  return { userId: user.id, email: user.email ?? null, supabase };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
