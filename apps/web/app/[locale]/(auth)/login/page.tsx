import { getTranslations } from 'next-intl/server';
import { createClient } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Locale } from '../../../../i18n';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('login');

  async function signInWith(provider: 'google' | 'github') {
    'use server';
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=/${locale}/dashboard` },
    });
    if (error || !data.url) return;
    redirect(data.url);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-32">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Bienvenue
          </p>
          <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">{t('title')}</h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--color-graphite)]">{t('lede')}</p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <form className="space-y-3">
            <button
              formAction={() => signInWith('google')}
              className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[var(--color-ink)] bg-[var(--color-ivory)] px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]"
            >
              {t('google')}
            </button>
            <button
              formAction={() => signInWith('github')}
              className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[var(--color-ink)] bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-ivory)] transition-colors hover:bg-transparent hover:text-[var(--color-ink)]"
            >
              {t('github')}
            </button>
          </form>
          <p className="mt-8 text-xs leading-relaxed text-[var(--color-graphite)]">{t('tos')}</p>
        </div>
      </div>
    </div>
  );
}
