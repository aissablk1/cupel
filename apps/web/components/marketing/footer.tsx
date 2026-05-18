import { useTranslations } from 'next-intl';
import type { Locale } from '../../i18n';

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations('landing');
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-[var(--color-border)] bg-[var(--color-mist)]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-tight">Cupel</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-graphite)]">
              {t('footer_signature')}
            </p>
          </div>
          <div className="md:col-span-2 md:col-start-8">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-graphite)]">
              Produit
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href={`/${locale}/skills`} className="link-editorial">Catalogue</a></li>
              <li><a href={`/${locale}/cli`} className="link-editorial">CLI</a></li>
              <li><a href={`/${locale}/pricing`} className="link-editorial">Tarifs</a></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-graphite)]">
              Ressources
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="/docs" className="link-editorial">Docs</a></li>
              <li><a href="/changelog" className="link-editorial">Changelog</a></li>
              <li><a href="/status" className="link-editorial">Statut</a></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-graphite)]">
              Légal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="/terms" className="link-editorial">CGU</a></li>
              <li><a href="/privacy" className="link-editorial">Confidentialité</a></li>
              <li><a href="/security" className="link-editorial">Sécurité</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-linen)] pt-8 text-xs text-[var(--color-graphite)] md:flex-row md:items-center">
          <p>© {year} Aïssa BELKOUSSA — Tous droits réservés.</p>
          <p className="font-mono">v0.0.1</p>
        </div>
      </div>
    </footer>
  );
}
