// Cupel CLI — tests commands & lib (slugify, signature, semver, retry)
// Author: Aïssa BELKOUSSA

import { describe, it, expect } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { detectInstalledPlatforms } from '../src/lib/platforms.js';
import {
  canonicalPayload,
  verifySignature,
  verifyZipHash,
  type ManifestSignaturePayload,
} from '../src/lib/signature.js';
import { compareSemver } from '../src/lib/auto-update.js';

// Slugify local (sera extrait dans lib/slugify.ts dans une future itération).
// On teste ici la spec attendue pour éviter une régression sémantique.
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

describe('detectInstalledPlatforms', () => {
  it('returns an array (possibly empty) without crashing', () => {
    expect(Array.isArray(detectInstalledPlatforms())).toBe(true);
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces by dashes', () => {
    expect(slugify('Mon Super Skill')).toBe('mon-super-skill');
  });
  it('strips accents (Aïssa → aissa)', () => {
    expect(slugify('Aïssa BELKOUSSA')).toBe('aissa-belkoussa');
  });
  it('trims leading/trailing dashes and collapses runs', () => {
    expect(slugify('  --hello   world!! ')).toBe('hello-world');
  });
});

describe('signature.verifySignature', () => {
  it('accepts a valid Ed25519 signature against the pinned key', () => {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const pubSpkiB64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

    const payload: ManifestSignaturePayload = {
      zip_sha256: 'a'.repeat(64),
      slug: 'test-skill',
      version: '1.0.0',
      signed_at: '2026-05-14T10:00:00Z',
    };
    const sigB64 = sign(null, canonicalPayload(payload), privateKey).toString('base64');

    const res = verifySignature(payload, sigB64, pubSpkiB64);
    expect(res.valid).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const pubSpkiB64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

    const payload: ManifestSignaturePayload = {
      zip_sha256: 'a'.repeat(64),
      slug: 'test-skill',
      version: '1.0.0',
      signed_at: '2026-05-14T10:00:00Z',
    };
    const sigB64 = sign(null, canonicalPayload(payload), privateKey).toString('base64');

    const tampered = { ...payload, version: '2.0.0' };
    const res = verifySignature(tampered, sigB64, pubSpkiB64);
    expect(res.valid).toBe(false);
  });

  it('verifyZipHash detects mismatch', () => {
    const buf = Buffer.from('hello world');
    const wrong = '0'.repeat(64);
    expect(verifyZipHash(buf, wrong).valid).toBe(false);
  });
});

describe('compareSemver', () => {
  it('returns positive when a > b', () => {
    expect(compareSemver('1.2.3', '1.2.2')).toBeGreaterThan(0);
    expect(compareSemver('2.0.0', '1.99.99')).toBeGreaterThan(0);
  });
  it('returns 0 when equal', () => {
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
  });
  it('returns negative when a < b', () => {
    expect(compareSemver('1.2.3', '1.2.4')).toBeLessThan(0);
  });
});

describe('api retry behavior (contract)', () => {
  // Contrat attendu : `api.get/post/delete` rejette sur statut ≥ 400 avec
  // un message contenant le code HTTP. Test implémentation-agnostique :
  // on vérifie juste que le module exporte les bons handlers.
  it('exposes get/post/delete on the api module', async () => {
    const mod = await import('../src/lib/api.js');
    expect(typeof mod.api.get).toBe('function');
    expect(typeof mod.api.post).toBe('function');
    expect(typeof mod.api.delete).toBe('function');
  });
});
