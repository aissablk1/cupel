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
      {/* Hero éditorial asymétrique — pas de centrage classique */}
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
                  className="inline-flex items-center justify-center rounded-[4px] bg-[var(--color-terracotta)] px-7 py-3 text-base font-medium text-[var(--color-ivory)] transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  {t('cta_primary')}
                </Link>
                <Link
                  href={`/${locale}/creator`}
                  className="link-editorial text-base"
                >
                  {t('cta_secondary')}
                </Link>
              </div>
            </div>
          </div>

          {/* Terminal asymétrique 8/12 décalé */}
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

      {/* Section usage — stacked rhythm, pas 3-col */}
      <section className="bg-[var(--color-mist)]">
        <div className="mx-auto max-w-[1280px] px-6 py-32 md:px-16 md:py-48">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('section_usage_kicker')}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {t('section_usage_title')}
              </h2>
            </div>
            <div className="space-y-24 md:col-span-8 md:col-start-5">
              <UsageRow
                index="01"
                title={t('usage_discover_title')}
                body={t('usage_discover_body')}
              />
              <UsageRow
                index="02"
                title={t('usage_install_title')}
                body={t('usage_install_body')}
              />
              <UsageRow
                index="03"
                title={t('usage_sell_title')}
                body={t('usage_sell_body')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plateformes — rail horizontal */}
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

function UsageRow({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <article className="border-t border-[var(--color-linen)] pt-12">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h3>
        <span className="font-mono text-xs text-[var(--color-graphite)]">{index}</span>
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-graphite)]">
        {body}
      </p>
    </article>
  );
}
