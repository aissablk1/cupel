// Cupel CLI — search
import chalk from 'chalk';
import { api } from '../lib/api.js';

interface SearchResult {
  slug: string;
  name: string;
  tagline: string;
  install_count: number;
  rating_avg: number | null;
  price_cents: number;
}

export async function searchCommand(
  query: string,
  opts: { category?: string; platform?: string },
): Promise<void> {
  const qs = new URLSearchParams({ q: query });
  if (opts.category) qs.set('category', opts.category);
  if (opts.platform) qs.set('platform', opts.platform);

  const results = await api.get<SearchResult[]>(`/v1/skills/search?${qs}`);
  if (results.length === 0) {
    console.log(chalk.hex('#3A3D40')('Aucun résultat.'));
    return;
  }
  console.log('');
  for (const r of results) {
    const price = r.price_cents === 0 ? 'Gratuit' : `${(r.price_cents / 100).toFixed(2)} €`;
    console.log(
      `  ${chalk.hex('#C9573B').bold(r.slug.padEnd(28))}` +
        chalk.hex('#3A3D40')(`${String(r.install_count).padStart(6)} installs  `) +
        chalk.hex('#7A8471')(price.padStart(10)),
    );
    console.log(`  ${chalk.hex('#3A3D40')(r.tagline)}\n`);
  }
}
