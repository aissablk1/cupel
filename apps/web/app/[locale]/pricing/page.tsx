import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Locale } from '../../../i18n';
import { PricingTable } from '../../../components/marketing/pricing-table';

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <PricingContent locale={locale} />;
}

function PricingContent({ locale }: { locale: Locale }) {
  const t = useTranslations('pricing');

  const plans = [
    {
      id: 'free' as const,
      name: t('plan_free_name'),
      price: t('plan_free_price'),
      unit: t('plan_free_unit'),
      pitch: t('plan_free_pitch'),
      features: [
        t('plan_free_feature_1'),
        t('plan_free_feature_2'),
        t('plan_free_feature_3'),
        t('plan_free_feature_4'),
        t('plan_free_feature_5'),
      ],
      ctaLabel: t('plan_free_cta'),
      ctaHref: `/${locale}/skills`,
    },
    {
      id: 'teams' as const,
      name: t('plan_teams_name'),
      price: t('plan_teams_price'),
      unit: t('plan_teams_unit'),
      pitch: t('plan_teams_pitch'),
      features: [
        t('plan_teams_feature_1'),
        t('plan_teams_feature_2'),
        t('plan_teams_feature_3'),
        t('plan_teams_feature_4'),
        t('plan_teams_feature_5'),
        t('plan_teams_feature_6'),
        t('plan_teams_feature_7'),
      ],
      ctaLabel: t('plan_teams_cta'),
      ctaHref: `/${locale}/teams`,
      featured: true,
      badge: t('featured_badge'),
    },
    {
      id: 'enterprise' as const,
      name: t('plan_ent_name'),
      price: t('plan_ent_price'),
      unit: t('plan_ent_unit'),
      pitch: t('plan_ent_pitch'),
      features: [
        t('plan_ent_feature_1'),
        t('plan_ent_feature_2'),
        t('plan_ent_feature_3'),
        t('plan_ent_feature_4'),
        t('plan_ent_feature_5'),
        t('plan_ent_feature_6'),
        t('plan_ent_feature_7'),
      ],
      ctaLabel: t('plan_ent_cta'),
      ctaHref: `/${locale}/teams#demo`,
    },
  ];

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
  ];

  return (
    <>
      {/* Hero éditorial asymétrique 7/12 + 5/12 */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 pt-20 pb-24 md:px-16 md:pt-32 md:pb-32">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('kicker')}
              </p>
              <h1 className="mt-8 font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                {t('title')}
                <br />
                <span className="font-italic-editorial">{t('title_italic')}</span>
              </h1>
            </div>
            <div className="md:col-span-5 md:col-start-8 md:mt-16">
              <p className="text-xl leading-relaxed text-[var(--color-graphite)]">
                {t('lede')}
              </p>
              <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <Link
                  href={`/${locale}/skills`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[var(--color-terracotta)] px-7 py-3 text-base font-medium text-[var(--color-ivory)] transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  {t('cta_primary')}
                </Link>
                <Link href={`/${locale}/teams#demo`} className="link-editorial text-base">
                  {t('cta_secondary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing table éditorial asymétrique (Free 4 / Teams 5 featured / Enterprise 3) */}
      <section className="bg-[var(--color-mist)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-32">
          <PricingTable plans={plans} />
        </div>
      </section>

      {/* FAQ — layout éditorial 4/12 + 8/12 */}
      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-16 md:py-32">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
                {t('faq_kicker')}
              </p>
              <h2 className="mt-6 font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {t('faq_title')}
              </h2>
            </div>
            <dl className="md:col-span-7 md:col-start-6">
              {faqs.map((f, i) => (
                <div
                  key={f.q}
                  className={
                    i === 0
                      ? 'border-y border-[var(--color-linen)] py-8'
                      : 'border-b border-[var(--color-linen)] py-8'
                  }
                >
                  <dt className="font-display text-2xl tracking-tight">{f.q}</dt>
                  <dd className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-graphite)]">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
