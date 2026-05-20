import { getTranslations } from 'next-intl/server';
import { createClient } from '../../../lib/supabase/server';
import type { Locale } from '../../../i18n';

export const revalidate = 60;

export default async function SkillsCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations('skills');

  let skills: SkillCardData[] | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('skills')
      .select('id, slug, name, tagline, icon_url, install_count, rating_avg, price_cents, pricing_model, platforms')
      .eq('status', 'published')
      .order('install_count', { ascending: false })
      .limit(48);
    skills = data as unknown as SkillCardData[] | null;
  } catch {
    skills = null;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
      <header className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Catalogue
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight md:text-6xl">
            {t('title')}
          </h1>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <input
            type="search"
            placeholder={t('search_placeholder')}
            className="w-full rounded-[4px] border border-[var(--color-linen)] bg-transparent px-4 py-3 text-sm transition-colors focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
      </header>

      <div className="mt-16 grid gap-12 md:grid-cols-12">
        <aside className="md:col-span-3">
          <FilterGroup title={t('filter_platform')} options={['Claude Code', 'Cursor', 'Codex', 'Windsurf']} />
          <FilterGroup title={t('filter_category')} options={['Frontend', 'Backend', 'SEO', 'Sécurité']} />
          <FilterGroup title={t('filter_price')} options={['Gratuit', '< 10 €', '10-50 €', '> 50 €']} />
          <FilterGroup title={t('filter_rating')} options={['★★★★★', '★★★★ et +']} />
        </aside>
        <section className="md:col-span-9">
          <p className="mb-8 font-mono text-xs text-[var(--color-graphite)]">
            {t('results_count', { count: skills?.length ?? 0 })}
          </p>
          {skills && skills.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} locale={locale} />
              ))}
            </ul>
          ) : (
            <p className="font-italic-editorial text-lg text-[var(--color-graphite)]">
              {t('empty_state')}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="mb-10">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-graphite)]">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {options.map((o) => (
          <li key={o}>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-[var(--color-terracotta)]" />
              <span>{o}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SkillCardData = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon_url: string | null;
  install_count: number;
  rating_avg: number | null;
  price_cents: number;
  pricing_model: string;
  platforms: string[];
};

function SkillCard({ skill, locale }: { skill: SkillCardData; locale: Locale }) {
  return (
    <li className="group border border-[var(--color-linen)] p-6 transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--color-ink)]">
      <a href={`/${locale}/skills/${skill.slug}`} className="block">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-[4px] bg-[var(--color-mist)]" />
          <span className="font-mono text-xs text-[var(--color-graphite)]">
            {skill.install_count.toLocaleString('fr-FR')} installs
          </span>
        </div>
        <h3 className="mt-6 font-display text-2xl tracking-tight">{skill.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-graphite)]">{skill.tagline}</p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--color-linen)] pt-4">
          <span className="font-mono text-xs">
            {skill.price_cents === 0
              ? 'Gratuit'
              : `${(skill.price_cents / 100).toFixed(2).replace('.', ',')} €`}
          </span>
          {skill.rating_avg !== null && (
            <span className="font-mono text-xs text-[var(--color-graphite)]">
              ★ {skill.rating_avg.toFixed(1)}
            </span>
          )}
        </div>
      </a>
    </li>
  );
}
