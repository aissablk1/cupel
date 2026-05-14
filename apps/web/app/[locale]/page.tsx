import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Locale } from '../../i18n';
import { TerminalDemo } from '../../components/marketing/terminal-demo';

export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LandingContent locale={locale} />;
}

function LandingContent({ locale }: { locale: Locale }) {
  const t = useTranslations('landing');

  return (
    <>
      {/* Hero éditorial asymétrique 8/12 + 4/12 décalé */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 pt-20 pb-32 md:px-16 md:pt-32 md:pb-48">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                ★ {t('announcement')}
              </p>
              <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
                {t('h1_top')}
                <br />
                <span className="font-italic-editorial">{t('h1_bottom')}</span>
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:mt-32">
              <p className="text-xl leading-relaxed text-[var(--color-graphite)]">
                {t('lede')}
              </p>
              <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <Link
                  href={`/${locale}/skills`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[var(--color-terracotta)] px-7 py-3 text-base font-medium text-[var(--color-ivory)] transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  {t('cta_primary')}
                </Link>
                <Link
                  href={`/${locale}/teams`}
                  className="link-editorial text-base"
                >
                  {t('cta_secondary')}
                </Link>
              </div>
            </div>
          </div>

          {/* Terminal asymétrique 9/12 décalé col 3 */}
          <div className="mt-20 grid md:grid-cols-12">
            <div className="md:col-span-9 md:col-start-3">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-graphite)]">
                {t('terminal_title')}
              </p>
              <TerminalDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Section split — 3 pistes éditoriales en stacked rhythm (pas 3-col uniforme) */}
      <section className="bg-[var(--color-mist)]">
        <div className="mx-auto max-w-[1280px] px-6 py-32 md:px-16 md:py-48">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('section_split_kicker')}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {t('section_split_title')}
              </h2>
            </div>
            <div className="space-y-28 md:col-span-8 md:col-start-5">
              <TrackRow
                index="01"
                label={t('track_free_label')}
                title={t('track_free_title')}
                body={t('track_free_body')}
                bullets={[
                  t('track_free_bullets_1'),
                  t('track_free_bullets_2'),
                  t('track_free_bullets_3'),
                ]}
                ctaHref={`/${locale}/skills`}
                ctaLabel={t('track_free_cta')}
                tone="default"
              />
              <TrackRow
                index="02"
                label={t('track_teams_label')}
                title={t('track_teams_title')}
                body={t('track_teams_body')}
                bullets={[
                  t('track_teams_bullets_1'),
                  t('track_teams_bullets_2'),
                  t('track_teams_bullets_3'),
                ]}
                ctaHref={`/${locale}/teams`}
                ctaLabel={t('track_teams_cta')}
                tone="featured"
              />
              <TrackRow
                index="03"
                label={t('track_enterprise_label')}
                title={t('track_enterprise_title')}
                body={t('track_enterprise_body')}
                bullets={[
                  t('track_enterprise_bullets_1'),
                  t('track_enterprise_bullets_2'),
                  t('track_enterprise_bullets_3'),
                ]}
                ctaHref={`/${locale}/pricing`}
                ctaLabel={t('track_enterprise_cta')}
                tone="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plateformes — rail horizontal éditorial */}
      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-graphite)]">
            {t('platforms_title')}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-12 gap-y-6 font-display text-2xl">
            <span>Claude Code</span>
            <span className="text-[var(--color-linen)]">·</span>
            <span>Cursor</span>
            <span className="text-[var(--color-linen)]">·</span>
            <span>Codex</span>
            <span className="text-[var(--color-linen)]">·</span>
            <span>Windsurf</span>
            <span className="text-[var(--color-linen)]">·</span>
            <span>Gemini CLI</span>
          </div>
        </div>
      </section>
    </>
  );
}

function TrackRow({
  index,
  label,
  title,
  body,
  bullets,
  ctaHref,
  ctaLabel,
  tone,
}: {
  index: string;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  ctaHref: string;
  ctaLabel: string;
  tone: 'default' | 'featured';
}) {
  const featured = tone === 'featured';
  return (
    <article
      className={
        featured
          ? 'relative -mx-6 border-y border-[var(--color-ink)] bg-[var(--color-ivory)] px-6 py-12 md:-mx-12 md:px-12'
          : 'border-t border-[var(--color-linen)] pt-12'
      }
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          {label}
        </p>
        <span className="font-mono text-xs text-[var(--color-graphite)]">{index}</span>
      </div>
      <h3 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">{title}</h3>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-graphite)]">
        {body}
      </p>
      <ul className="mt-6 grid gap-2 text-base md:max-w-2xl md:grid-cols-3 md:gap-x-8">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[var(--color-ink)]">
            <span aria-hidden className="mt-2 inline-block h-[6px] w-[6px] flex-none rounded-full bg-[var(--color-terracotta)]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href={ctaHref} className="link-editorial text-base">
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
