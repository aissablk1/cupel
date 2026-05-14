/**
 * Dashboard creator — /[locale]/creator
 * Author: Aïssa BELKOUSSA
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { StatCard } from '@/components/dashboard/stat-card';
import { SkillsTable, type SkillRow } from '@/components/dashboard/skills-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('creator');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [{ data: skills }, { data: monthly }, { data: nextPayout }] = await Promise.all([
    supabase
      .from('skills')
      .select('id, slug, name, platforms, status, install_count, updated_at')
      .eq('creator_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('purchases')
      .select('amount_cents, skill:skills!inner(creator_id)')
      .eq('skill.creator_id', user.id)
      .gte('created_at', since.toISOString()),
    supabase
      .from('payouts')
      .select('amount_cents, scheduled_at')
      .eq('creator_id', user.id)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const mrrCents = monthly?.reduce((s, p) => s + (p.amount_cents ?? 0), 0) ?? 0;
  const installsMonth = monthly?.length ?? 0;
  const avgRating =
    skills && skills.length
      ? (skills.reduce((s, sk: any) => s + (sk.rating_avg ?? 0), 0) / skills.length).toFixed(1)
      : '—';

  const rows: SkillRow[] = (skills ?? []).map((s: any) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    platform: Array.isArray(s.platforms) ? s.platforms.join(', ') : '—',
    status: s.status,
    installs: s.install_count ?? 0,
    revenueCents: 0,
    updatedAt: s.updated_at,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
      <header className="grid gap-8 md:grid-cols-12 items-end">
        <div className="md:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Studio créateur
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight md:text-6xl">
            Vos skills, vos revenus.
          </h1>
        </div>
        <div className="md:col-span-4 flex md:justify-end">
          <Button asChild size="lg">
            <Link href={`/${locale}/creator/skills/new`}>{t('new_skill')}&nbsp;›</Link>
          </Button>
        </div>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-4">
        <StatCard label={t('mrr')} value={formatPrice(mrrCents)} />
        <StatCard label={t('installs_month')} value={installsMonth} />
        <StatCard label={t('rating_avg')} value={avgRating} hint="sur 5" />
        <StatCard
          label={t('payouts_next')}
          value={nextPayout ? formatPrice(nextPayout.amount_cents ?? 0) : '—'}
        />
      </section>

      <Separator className="my-16" />

      <section>
        <h2 className="font-display text-3xl tracking-tight mb-8">{t('skills_title')}</h2>
        <SkillsTable rows={rows} />
      </section>
    </div>
  );
}
