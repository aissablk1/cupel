import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '../../i18n';

export function Nav({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-16">
        <Link href={`/${locale}`} className="font-display text-2xl tracking-tight">
          Cupel
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href={`/${locale}/skills`} className="link-editorial">
            {t('explore')}
          </Link>
          <Link href={`/${locale}/creator`} className="link-editorial">
            {t('create')}
          </Link>
          <Link href={`/${locale}/pricing`} className="link-editorial">
            {t('pricing')}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="rounded-[4px] border border-[var(--color-ink)] px-5 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]"
          >
            {t('login')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
