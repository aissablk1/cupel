// =============================================================================
// Forgekit — Edge Function: skill-publish
// Author: Aïssa BELKOUSSA
// Runtime: Deno (Supabase Edge Functions)
// Description: Reçoit un zip URL (R2), vérifie l'ownership du skill,
//              déclenche le scan sécurité via HTTP interne, met à jour le
//              statut de la version.
// =============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { getCurrentUser, serviceClient } from '../_shared/supabase.ts';

const SECURITY_SCAN_URL = Deno.env.get('SECURITY_SCAN_URL') ?? '';
const SECURITY_SCAN_TOKEN = Deno.env.get('SECURITY_SCAN_TOKEN') ?? '';

interface PublishPayload {
  skill_id: string;
  version: string;
  r2_key: string;
  zip_sha256: string;
  zip_size_bytes: number;
  manifest: Record<string, unknown>;
  changelog_md?: string;
  min_claude_code_version?: string;
  min_cursor_version?: string;
  min_codex_version?: string;
}

function isValidPayload(p: unknown): p is PublishPayload {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.skill_id === 'string' &&
    typeof o.version === 'string' &&
    /^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(o.version) &&
    typeof o.r2_key === 'string' &&
    typeof o.zip_sha256 === 'string' &&
    o.zip_sha256.length === 64 &&
    typeof o.zip_size_bytes === 'number' &&
    o.zip_size_bytes > 0 &&
    o.zip_size_bytes < 50 * 1024 * 1024 &&
    typeof o.manifest === 'object'
  );
}

async function triggerSecurityScan(versionId: string, r2Key: string): Promise<{
  status: string;
  results: unknown;
}> {
  if (!SECURITY_SCAN_URL) {
    return { status: 'skipped', results: { reason: 'SECURITY_SCAN_URL not configured' } };
  }
  try {
    const resp = await fetch(SECURITY_SCAN_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${SECURITY_SCAN_TOKEN}`,
      },
      body: JSON.stringify({ version_id: versionId, r2_key: r2Key }),
    });
    if (!resp.ok) {
      return { status: 'failed', results: { http: resp.status } };
    }
    const data = await resp.json();
    return { status: data.status ?? 'completed', results: data };
  } catch (e) {
    return { status: 'failed', results: { error: String(e) } };
  }
}

serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const user = await getCurrentUser(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }
  if (!isValidPayload(body)) {
    return jsonResponse({ error: 'Invalid payload' }, 422);
  }
  const payload = body;

  const supa = serviceClient();

  // Vérifie ownership
  const { data: skill, error: skillErr } = await supa
    .from('skills')
    .select('id, creator_id, status')
    .eq('id', payload.skill_id)
    .maybeSingle();

  if (skillErr) return jsonResponse({ error: skillErr.message }, 500);
  if (!skill) return jsonResponse({ error: 'Skill not found' }, 404);
  if (skill.creator_id !== user.id) {
    return jsonResponse({ error: 'Forbidden — not skill owner' }, 403);
  }

  // Insert version (pending scan)
  const { data: version, error: vErr } = await supa
    .from('skill_versions')
    .insert({
      skill_id: payload.skill_id,
      version: payload.version,
      changelog_md: payload.changelog_md ?? null,
      r2_key: payload.r2_key,
      zip_sha256: payload.zip_sha256,
      zip_size_bytes: payload.zip_size_bytes,
      manifest: payload.manifest,
      min_claude_code_version: payload.min_claude_code_version ?? null,
      min_cursor_version: payload.min_cursor_version ?? null,
      min_codex_version: payload.min_codex_version ?? null,
      security_scan_status: 'pending',
    })
    .select('id')
    .single();

  if (vErr) return jsonResponse({ error: vErr.message }, 409);

  // Déclenche scan synchrone (Edge Function timeout-friendly : courte étape)
  const scan = await triggerSecurityScan(version.id, payload.r2_key);

  const passed = scan.status === 'passed' || scan.status === 'completed' || scan.status === 'skipped';
  const nextSkillStatus = passed ? 'in_review' : 'draft';

  await supa
    .from('skill_versions')
    .update({
      security_scan_status: scan.status,
      security_scan_results: scan.results,
    })
    .eq('id', version.id);

  await supa
    .from('skills')
    .update({
      status: nextSkillStatus,
      current_version_id: passed ? version.id : null,
      current_version: passed ? payload.version : null,
    })
    .eq('id', payload.skill_id);

  await supa.from('events').insert({
    user_id: user.id,
    event_type: 'skill.publish.submitted',
    entity_type: 'skill_version',
    entity_id: version.id,
    metadata: { scan_status: scan.status, sha256: payload.zip_sha256 },
  });

  return jsonResponse({
    ok: true,
    version_id: version.id,
    scan_status: scan.status,
    skill_status: nextSkillStatus,
  });
});
