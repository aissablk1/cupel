import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Locale } from '../../../i18n';
import { TeamsFeature, type TeamsFeatureItem } from '../../../components/marketing/teams-feature';

export default async function TeamsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <TeamsContent locale={locale} />;
}

function TeamsContent({ locale }: { locale: Locale }) {
  const t = useTranslations('teams');

  const features: TeamsFeatureItem[] = [
    { id: 'sso', icon: 'sso', title: t('feature_sso_title'), body: t('feature_sso_body') },
    { id: 'audit', icon: 'audit', title: t('feature_audit_title'), body: t('feature_audit_body') },
    { id: 'allowlist', icon: 'allowlist', title: t('feature_allowlist_title'), body: t('feature_allowlist_body') },
    { id: 'private', icon: 'private', title: t('feature_private_title'), body: t('feature_private_body') },
    { id: 'cross', icon: 'cross', title: t('feature_cross_title'), body: t('feature_cross_body') },
    { id: 'support', icon: 'support', title: t('feature_support_title'), body: t('feature_support_body') },
  ];

  return (
    <>
      {/* Hero asymétrique 8/12 + 4/12 décalé */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 pt-20 pb-32 md:px-16 md:pt-32 md:pb-40">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('kicker')}
              </p>
              <h1 className="mt-8 font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                {t('title')}
                <br />
                <span className="font-italic-editorial">{t('title_italic')}</span>
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:mt-24">
              <p className="text-xl leading-relaxed text-[var(--color-graphite)]">{t('lede')}</p>
              <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:gap-6" id="demo">
                <Link
                  href={`/${locale}/pricing`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[var(--color-terracotta)] px-7 py-3 text-base font-medium text-[var(--color-ivory)] transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  {t('cta_primary')}
                </Link>
                <a href="mailto:teams@forgekit.dev?subject=Demo%20Forgekit%20Teams" className="link-editorial text-base">
                  {t('cta_secondary')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features éditoriales en grille asymétrique alternée */}
      <section className="bg-[var(--color-mist)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-40">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('features_kicker')}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {t('features_title')}
              </h2>
            </div>
            <div className="md:col-span-8">
              <TeamsFeature items={features} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial éditorial pleine largeur asymétrique 8/12 décalé */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-ink)] text-[var(--color-ivory)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-40">
          <div className="grid md:grid-cols-12">
            <figure className="md:col-span-9 md:col-start-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta-soft)]">
                ★
              </p>
              <blockquote className="mt-8 font-display text-3xl leading-tight tracking-tight md:text-5xl">
                <span className="font-italic-editorial">«&nbsp;</span>
                {t('testimonial_quote')}
                <span className="font-italic-editorial">&nbsp;»</span>
              </blockquote>
              <figcaption className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-linen)]">
                <span>{t('testimonial_author')}</span>
                <span aria-hidden>·</span>
                <span>{t('testimonial_role')}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Trust / Compliance — table éditoriale */}
      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('trust_kicker')}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {t('trust_title')}
              </h2>
            </div>
            <ul className="md:col-span-7 md:col-start-6">
              {[t('trust_1'), t('trust_2'), t('trust_3'), t('trust_4')].map((trust, i) => (
                <li
                  key={trust}
                  className={
                    i === 0
                      ? 'flex items-baseline justify-between border-y border-[var(--color-linen)] py-6'
                      : 'flex items-baseline justify-between border-b border-[var(--color-linen)] py-6'
                  }
                >
                  <span className="font-display text-2xl tracking-tight">{trust}</span>
                  <span aria-hidden className="font-mono text-xs text-[var(--color-graphite)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
