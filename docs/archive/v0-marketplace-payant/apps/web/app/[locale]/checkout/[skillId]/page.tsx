/**
 * ARCHIVED 2026-05-15 — Pivot v0 marketplace payant individuel → annuaire gratuit + B2B Teams.
 * Voir docs/archive/README.md. Ne plus importer ; conservé pour traçabilité.
 *
 * Checkout — /[locale]/checkout/[skillId]
 * Author: Aïssa BELKOUSSA
 */
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: Locale; skillId: string }>;
}

const VAT_RATE = 20;

export default async function CheckoutPage({ params }: PageProps) {
  const { locale, skillId } = await params;
  const t = await getTranslations('checkout');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?redirect=/checkout/${skillId}`);

  const { data: skill } = await supabase
    .from('skills')
    .select('id, slug, name, tagline, price_cents, pricing_model, version, creator:profiles!skills_creator_id_fkey(display_name)')
    .eq('id', skillId)
    .eq('status', 'published')
    .maybeSingle();

  if (!skill) notFound();

  const htCents = Math.round((skill.price_cents ?? 0) / (1 + VAT_RATE / 100));
  const vatCents = (skill.price_cents ?? 0) - htCents;

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-16 md:px-16">
      <Link href={`/${locale}/skills/${skill.slug}`} className="link-editorial text-sm">
        ‹ Retour au skill
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          Paiement sécurisé · Stripe MoR EU
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-tight md:text-6xl">{t('title')}</h1>
      </header>

      <div className="mt-16 grid gap-12 md:grid-cols-12">
        {/* Récap article 7/12 */}
        <section className="md:col-span-7">
          <h2 className="font-display text-2xl mb-6">Votre article</h2>
          <div className="border border-[var(--color-linen)] rounded-[4px] p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="accent">
                {skill.pricing_model === 'subscription' ? t('subscription') : t('one_shot')}
              </Badge>
              <span className="font-mono text-xs text-[var(--color-graphite)]">
                v{skill.version ?? '1.0.0'}
              </span>
            </div>
            <h3 className="font-display text-2xl">{skill.name}</h3>
            <p className="text-[var(--color-graphite)]">{skill.tagline}</p>
            <p className="text-sm text-[var(--color-graphite)]">
              Par {skill.creator?.display_name ?? '—'}
            </p>
          </div>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="text-[var(--color-sage)]">✓</span> {t('permanent_access')}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[var(--color-sage)]">✓</span> {t('updates_included')}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[var(--color-sage)]">✓</span> {t('refund')}
            </li>
          </ul>
        </section>

        {/* Récap montants 5/12 */}
        <aside className="md:col-span-5">
          <div className="border border-[var(--color-linen)] rounded-[4px] p-6 sticky top-8">
            <h2 className="font-display text-2xl mb-6">Récapitulatif</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-graphite)]">{t('ht')}</dt>
                <dd className="font-mono">{formatPrice(htCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-graphite)]">{t('vat', { rate: VAT_RATE })}</dt>
                <dd className="font-mono">{formatPrice(vatCents)}</dd>
              </div>
            </dl>
            <Separator className="my-6" />
            <div className="flex justify-between items-baseline">
              <span className="font-display text-xl">{t('total')}</span>
              <span className="font-display text-3xl">{formatPrice(skill.price_cents ?? 0)}</span>
            </div>
            <form action={`/api/checkout/${skill.id}`} method="POST" className="mt-8">
              <Button type="submit" size="lg" className="w-full">
                Payer&nbsp;{formatPrice(skill.price_cents ?? 0)}&nbsp;›
              </Button>
            </form>
            <p className="mt-4 text-xs text-[var(--color-graphite)] leading-relaxed">
              En finalisant cet achat, vous acceptez les conditions de vente Cupel. Paiement
              traité par Stripe en tant que Merchant of Record (TVA UE incluse).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
