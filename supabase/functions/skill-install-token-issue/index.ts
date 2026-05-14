// =============================================================================
// Forgekit — Edge Function: skill-install-token-issue
// Author: Aïssa BELKOUSSA
// Runtime: Deno (Supabase Edge Functions)
// Description: Génère un token CLI opaque, stocke uniquement son hash SHA-256
//              en base. Le token clair n'est renvoyé qu'UNE seule fois.
// =============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { encodeHex } from 'https://deno.land/std@0.224.0/encoding/hex.ts';
import { encodeBase64Url } from 'https://deno.land/std@0.224.0/encoding/base64url.ts';
import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { getCurrentUser, serviceClient } from '../_shared/supabase.ts';

const TOKEN_PREFIX = 'fk_';

interface IssuePayload {
  name?: string;
  scopes?: string[];
  expires_in_days?: number;
}

const ALLOWED_SCOPES = new Set(['install', 'list', 'publish']);

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return encodeHex(new Uint8Array(buf));
}

function generateToken(): { token: string; prefix: string } {
  // 32 bytes = 256 bits — encodage base64url sans padding
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = encodeBase64Url(bytes);
  const token = `${TOKEN_PREFIX}${raw}`;
  return { token, prefix: token.slice(0, 10) };
}

serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const user = await getCurrentUser(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body: IssuePayload = {};
  if (req.headers.get('content-length') !== '0') {
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
  }

  const name = (body.name ?? 'CLI token').slice(0, 80);
  const scopes = Array.isArray(body.scopes) && body.scopes.length > 0
    ? body.scopes.filter((s) => ALLOWED_SCOPES.has(s))
    : ['install', 'list'];

  if (scopes.length === 0) {
    return jsonResponse({ error: 'No valid scopes' }, 422);
  }

  const days = Math.min(Math.max(body.expires_in_days ?? 365, 1), 730);
  const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();

  const { token, prefix } = generateToken();
  const tokenHash = await sha256Hex(token);

  const supa = serviceClient();
  const { data, error } = await supa
    .from('install_tokens')
    .insert({
      user_id: user.id,
      name,
      token_hash: tokenHash,
      token_prefix: prefix,
      scopes,
      expires_at: expiresAt,
    })
    .select('id, name, token_prefix, scopes, expires_at, created_at')
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  await supa.from('events').insert({
    user_id: user.id,
    event_type: 'token.issued',
    entity_type: 'install_token',
    entity_id: data.id,
    metadata: { scopes, expires_at: expiresAt },
  });

  // Token clair retourné UNE seule fois — jamais relogué côté serveur.
  return jsonResponse({
    ok: true,
    token,
    token_id: data.id,
    name: data.name,
    prefix: data.token_prefix,
    scopes: data.scopes,
    expires_at: data.expires_at,
  });
});
