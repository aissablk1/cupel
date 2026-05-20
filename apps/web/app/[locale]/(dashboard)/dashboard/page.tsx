/**
 * Dashboard buyer — /[locale]/dashboard
 * Author: Aïssa BELKOUSSA
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { StatCard } from '@/components/dashboard/stat-card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations('dashboard');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const [{ data: profile }, { count: installedCount }, { data: purchases }] = await Promise.all([
    supabase.from('profiles').select('display_name, username').eq('id', user.id).maybeSingle(),
    supabase.from('installations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('purchases')
      .select('id, amount_cents, created_at, skill:skills(name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const totalSpent =
    purchases?.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;
  const displayName = profile?.display_name ?? profile?.username ?? 'créateur';

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-16">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Espace personnel
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight md:text-6xl">
            {t('welcome', { name: displayName })}
          </h1>
        </div>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <StatCard label={t('stats_installed')} value={installedCount ?? 0} />
        <StatCard label={t('stats_purchases')} value={purchases?.length ?? 0} />
        <StatCard label={t('stats_savings')} value={formatPrice(totalSpent)} hint="dépensé total" />
      </section>

      <Separator className="my-16" />

      <section>
        <h2 className="font-display text-3xl tracking-tight mb-8">{t('recent_title')}</h2>
        {purchases && purchases.length > 0 ? (
          <ul className="border border-[var(--color-linen)] rounded-[4px] divide-y divide-[var(--color-linen)]">
            {purchases.map((p) => {
              const skill = Array.isArray(p.skill) ? p.skill[0] : p.skill;
              return (
              <li key={p.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <Badge variant="success">Achat</Badge>
                  <Link
                    href={`/${locale}/skills/${skill?.slug ?? ''}`}
                    className="link-editorial font-medium"
                  >
                    {skill?.name ?? 'Skill'}
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="font-mono">{formatPrice(p.amount_cents ?? 0)}</span>
                  <span className="text-[var(--color-graphite)]">{formatDate(p.created_at)}</span>
                </div>
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[var(--color-graphite)]">Aucune activité pour le moment.</p>
        )}
      </section>
    </div>
  );
}
