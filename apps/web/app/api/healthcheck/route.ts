import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = { db: 'down', api: 'up', timestamp: new Date().toISOString() };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('skill_categories').select('slug').limit(1);
    checks.db = error ? 'down' : 'up';
  } catch {
    checks.db = 'down';
  }
  const ok = Object.values(checks).every((v) => v === 'up' || typeof v === 'string');
  return NextResponse.json(checks, { status: checks.db === 'up' ? 200 : 503 });
}
