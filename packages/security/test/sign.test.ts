// Forgekit Security — Tests signature Ed25519
// Author: Aïssa BELKOUSSA

import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { signManifest, verifyManifest, hashManifest } from '../src/sign/index.js';

function genPrivHex(): string {
  return Buffer.from(randomBytes(32)).toString('hex');
}

describe('sign / verify Ed25519 roundtrip', () => {
  it('signe et vérifie un manifest valide', async () => {
    const priv = genPrivHex();
    const manifest = { name: 'my-skill', version: '1.0.0', files: ['SKILL.md'] };
    const signed = await signManifest(manifest, priv);
    expect(signed.algorithm).toBe('Ed25519');
    expect(signed.signature).toMatch(/^[0-9a-f]+$/);
    expect(signed.public_key).toMatch(/^[0-9a-f]+$/);
    const ok = await verifyManifest(manifest, signed);
    expect(ok).toBe(true);
  });

  it('rejette un manifest altéré (hash mismatch)', async () => {
    const priv = genPrivHex();
    const manifest = { name: 'my-skill', version: '1.0.0' };
    const signed = await signManifest(manifest, priv);
    const tampered = { name: 'my-skill', version: '1.0.1' };
    const ok = await verifyManifest(tampered, signed);
    expect(ok).toBe(false);
  });

  it('rejette une signature corrompue', async () => {
    const priv = genPrivHex();
    const manifest = { name: 's', version: '1.0.0' };
    const signed = await signManifest(manifest, priv);
    const flipped = signed.signature.replace(/^./, (c) => (c === 'a' ? 'b' : 'a'));
    const ok = await verifyManifest(manifest, { ...signed, signature: flipped });
    expect(ok).toBe(false);
  });

  it('hash deterministe quelle que soit la position des clés', () => {
    const a = hashManifest({ a: 1, b: 2 });
    const b = hashManifest({ b: 2, a: 1 });
    expect(a).toBe(b);
  });
});
