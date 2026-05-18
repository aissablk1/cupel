// Cupel — Shared utils

import { REVENUE_SHARE, VAT_RATES_EU } from '../constants';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function compareSemver(a: string, b: string): number {
  const pa = a.split(/[.-]/).map((p) => parseInt(p, 10) || 0);
  const pb = b.split(/[.-]/).map((p) => parseInt(p, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Split d'un montant net en parts creator/platform — toujours en cents entiers */
export function splitRevenue(netCents: number): { creator: number; platform: number } {
  const platform = Math.round(netCents * REVENUE_SHARE.PLATFORM);
  const creator = netCents - platform;
  return { creator, platform };
}

/** Calcule TVA EU depuis pays + montant HT */
export function computeVAT(amountHTCents: number, countryCode: string): {
  vat: number;
  ttc: number;
  rate: number;
} {
  const rate = VAT_RATES_EU[countryCode] ?? 0;
  const vat = Math.round(amountHTCents * rate);
  return { vat, ttc: amountHTCents + vat, rate };
}

export function formatPrice(cents: number, currency = 'EUR', locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
