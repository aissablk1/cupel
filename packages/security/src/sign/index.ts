// Forgekit Security — Signature manifest (Ed25519)
// Author: Aïssa BELKOUSSA

import { sha256 } from '@noble/hashes/sha256';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Wire ed25519 sync hash (lib requires this in some envs)
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export interface SignedManifest {
  manifest_hash: string;
  signature: string;
  public_key: string;
  algorithm: 'Ed25519';
  signed_at: string;
}

function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map(
        (k) => JSON.stringify(k) + ':' + canonicalize((obj as Record<string, unknown>)[k]),
      )
      .join(',') +
    '}'
  );
}

export function hashManifest(manifest: unknown): string {
  const canon = canonicalize(manifest);
  return Buffer.from(sha256(new TextEncoder().encode(canon))).toString('hex');
}

export async function signManifest(
  manifest: unknown,
  privateKeyHex: string,
): Promise<SignedManifest> {
  const hash = hashManifest(manifest);
  const priv = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));
  const sig = await ed.signAsync(Buffer.from(hash, 'hex'), priv);
  const pub = await ed.getPublicKeyAsync(priv);
  return {
    manifest_hash: hash,
    signature: Buffer.from(sig).toString('hex'),
    public_key: Buffer.from(pub).toString('hex'),
    algorithm: 'Ed25519',
    signed_at: new Date().toISOString(),
  };
}

export async function verifyManifest(
  manifest: unknown,
  signed: SignedManifest,
): Promise<boolean> {
  const expected = hashManifest(manifest);
  if (expected !== signed.manifest_hash) return false;
  return ed.verifyAsync(
    Uint8Array.from(Buffer.from(signed.signature, 'hex')),
    Buffer.from(signed.manifest_hash, 'hex'),
    Uint8Array.from(Buffer.from(signed.public_key, 'hex')),
  );
}
