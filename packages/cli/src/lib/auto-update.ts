// Forgekit CLI — check de nouvelle version sur npm + prompt utilisateur
// Author: Aïssa BELKOUSSA

import { request } from 'undici';
import { config } from './config.js';
import { ui } from './ui.js';

const PACKAGE_NAME = '@forgekit/cli';
const REGISTRY = 'https://registry.npmjs.org';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 h

interface UpdateCacheEntry {
  lastCheck: number;
  latest: string;
}

interface ConfigShape {
  updateCache?: UpdateCacheEntry;
}

interface NpmRegistryResponse {
  'dist-tags'?: { latest?: string };
}

/**
 * Compare deux versions semver (sans pre-release). Retourne >0 si a>b.
 * Implémentation minimale — pas de dép externe semver (réduit la surface).
 */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const [a1, a2, a3] = parse(a);
  const [b1, b2, b3] = parse(b);
  if ((a1 ?? 0) !== (b1 ?? 0)) return (a1 ?? 0) - (b1 ?? 0);
  if ((a2 ?? 0) !== (b2 ?? 0)) return (a2 ?? 0) - (b2 ?? 0);
  return (a3 ?? 0) - (b3 ?? 0);
}

async function fetchLatest(): Promise<string | null> {
  try {
    const res = await request(`${REGISTRY}/${PACKAGE_NAME}`, {
      method: 'GET',
      headers: { accept: 'application/vnd.npm.install-v1+json' },
      headersTimeout: 3000,
      bodyTimeout: 3000,
    });
    if (res.statusCode >= 400) return null;
    const data = (await res.body.json()) as NpmRegistryResponse;
    return data['dist-tags']?.latest ?? null;
  } catch {
    return null;
  }
}

/**
 * Check non-bloquant. Cache 24 h. Retourne la version dispo si > currentVersion.
 */
export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  const cfg = config as unknown as {
    get: <K extends keyof ConfigShape>(k: K) => ConfigShape[K];
    set: <K extends keyof ConfigShape>(k: K, v: ConfigShape[K]) => void;
  };
  const cache = cfg.get('updateCache');
  const now = Date.now();

  if (cache && now - cache.lastCheck < CHECK_INTERVAL_MS) {
    return compareSemver(cache.latest, currentVersion) > 0 ? cache.latest : null;
  }

  const latest = await fetchLatest();
  if (!latest) return null;

  cfg.set('updateCache', { lastCheck: now, latest });
  return compareSemver(latest, currentVersion) > 0 ? latest : null;
}

/**
 * Affiche un encart non-bloquant si une mise à jour est dispo.
 * Pas de prompt interactif (ralentirait toute commande) — invite à exécuter
 * `npm i -g @forgekit/cli@latest`.
 */
export async function notifyIfUpdateAvailable(currentVersion: string): Promise<void> {
  const latest = await checkForUpdate(currentVersion);
  if (!latest) return;
  console.error('');
  console.error(ui.rule(60));
  console.error(ui.warn(`Forgekit ${currentVersion} ${ui.muted('→')} ${ui.title(latest)} disponible`));
  console.error(ui.muted(`  npm i -g ${PACKAGE_NAME}@latest`));
  console.error(ui.rule(60));
  console.error('');
}
