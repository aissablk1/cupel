/**
 * Page détail skill — /[locale]/skills/[slug]
 * Direction : Editorial Premium — layout asymétrique 8/12 + 4/12
 * Author: Aïssa BELKOUSSA
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommandBlock } from '@/components/cli/command-block';
import { formatPrice, formatDate } from '@/lib/utils';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations('skill_detail');
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from('skills')
    .select(
      'id, slug, name, tagline, description, install_count, rating_avg, price_cents, pricing_model, platforms, version, verified, signed, audited, updated_at, creator:profiles!skills_creator_id_fkey(username, display_name, avatar_url)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!skill) notFound();

  const creator = Array.isArray(skill.creator) ? skill.creator[0] : skill.creator;
  const installCmd = `cupel install ${skill.slug}`;
  const isFree = skill.pricing_model === 'free' || skill.price_cents === 0;

  return (
    <article className="mx-auto max-w-[1280px] px-6 py-16 md:px-16">
      {/* Header asymétrique 8/12 + 4/12 */}
      <header className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="flex items-center gap-3 mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
              {Array.isArray(skill.platforms) ? skill.platforms.join(' · ') : ''}
            </p>
            {skill.verified && <Badge variant="gold">{t('verified')}</Badge>}
            {skill.signed && <Badge variant="success">{t('signed')}</Badge>}
            {skill.audited && <Badge variant="outline">{t('audited')}</Badge>}
          </div>
          <h1 className="font-display text-5xl tracking-tight md:text-6xl leading-[0.98]">
            {skill.name}
          </h1>
          <p className="mt-6 text-xl text-[var(--color-graphite)] max-w-[60ch]">
            {skill.tagline}
          </p>

          <div className="mt-10">
            <CommandBlock command={installCmd} label="Installation" />
          </div>
        </div>

        {/* Sidebar 4/12 décalée */}
        <aside className="md:col-span-4 md:pt-16">
          <div className="border border-[var(--color-linen)] rounded-[4px] p-6 flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">Prix</p>
              <p className="font-display text-4xl tracking-tight mt-1">
                {isFree ? t('install_cta') : formatPrice(skill.price_cents)}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">
                  Installs
                </p>
                <p className="font-mono mt-1">{(skill.install_count ?? 0).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">Note</p>
                <p className="font-mono mt-1">{Number(skill.rating_avg ?? 0).toFixed(1)} / 5</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">
                  {t('version')}
                </p>
                <p className="font-mono mt-1">{skill.version ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">
                  Mis à jour
                </p>
                <p className="font-mono mt-1 text-xs">
                  {skill.updated_at ? formatDate(skill.updated_at) : '—'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              {isFree ? (
                <Button asChild size="lg">
                  <Link href={`/${locale}/cli`}>
                    {t('install_cta')}&nbsp;›
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href={`/${locale}/checkout/${skill.id}`}>
                    {t('add_to_cart')}&nbsp;›
                  </Link>
                </Button>
              )}
              <Button variant="secondary" asChild>
                <Link href={`/${locale}/creators/${creator?.username ?? ''}`}>
                  {t('creator')}&nbsp;: {creator?.display_name ?? '—'}
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </header>

      <div className="mt-24 max-w-[880px]">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">{t('tab_description')}</TabsTrigger>
            <TabsTrigger value="screenshots">{t('tab_screenshots')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('tab_reviews')}</TabsTrigger>
            <TabsTrigger value="changelog">{t('tab_changelog')}</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div className="prose-editorial text-base leading-[1.65] text-[var(--color-ink)] whitespace-pre-line">
              {skill.description ?? skill.tagline}
            </div>
          </TabsContent>
          <TabsContent value="screenshots">
            <p className="text-[var(--color-graphite)]">Aucune capture pour le moment.</p>
          </TabsContent>
          <TabsContent value="reviews">
            <p className="text-[var(--color-graphite)]">Aucun avis publié pour le moment.</p>
          </TabsContent>
          <TabsContent value="changelog">
            <p className="text-[var(--color-graphite)]">
              Version {skill.version ?? '—'} — dernière mise à jour le{' '}
              {skill.updated_at ? formatDate(skill.updated_at) : '—'}.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}
