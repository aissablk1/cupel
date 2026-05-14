// =============================================================================
// Forgekit — Shared Supabase clients
// Author: Aïssa BELKOUSSA
// =============================================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

/** Service-role client : bypass RLS. À utiliser UNIQUEMENT côté serveur. */
export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client utilisateur : applique RLS via le JWT fourni dans Authorization. */
export function userClient(req: Request): SupabaseClient {
  const auth = req.headers.get('Authorization') ?? '';
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: auth } },
  });
}

/** Retourne l'utilisateur courant ou null. */
export async function getCurrentUser(req: Request) {
  const supa = userClient(req);
  const { data, error } = await supa.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}
