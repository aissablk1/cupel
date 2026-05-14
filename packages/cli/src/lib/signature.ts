// Forgekit CLI — vérification de signature Ed25519 avec public key pinning
// Author: Aïssa BELKOUSSA

import { createPublicKey, verify, createHash } from 'node:crypto';

/**
 * Clé publique Ed25519 du marketplace Forgekit (épinglée).
 * Format SPKI base64 (DER → base64). Remplacée à la rotation de clé via
 * release CLI signée. Ne JAMAIS lire depuis l'API : le pinning est la défense
 * primaire contre un compromis de la chaîne de distribution.
 *
 * TODO Phase 1 : remplacer par la vraie clé production après cérémonie de génération.
 */
export const FORGEKIT_PUBLIC_KEY_SPKI_B64 =
  process.env.FORGEKIT_PUBKEY_OVERRIDE ??
  'MCowBQYDK2VwAyEA1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH=';

export interface ManifestSignaturePayload {
  // SHA-256 hex du zip du skill
  zip_sha256: string;
  // Slug + version, ancrés pour empêcher un swap de fichier entre versions
  slug: string;
  version: string;
  // Timestamp ISO de signature (anti-replay côté serveur, validé côté client)
  signed_at: string;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
}

/**
 * Construit le payload canonique signé (ordre des clés déterministe).
 * Doit matcher EXACTEMENT le payload signé côté backend.
 */
export function canonicalPayload(p: ManifestSignaturePayload): Buffer {
  const ordered = {
    signed_at: p.signed_at,
    slug: p.slug,
    version: p.version,
    zip_sha256: p.zip_sha256,
  };
  return Buffer.from(JSON.stringify(ordered), 'utf8');
}

/**
 * Vérifie une signature Ed25519 base64 contre la clé publique épinglée.
 * Ed25519 est nativement supporté par Node.js (crypto.verify avec algo null).
 */
export function verifySignature(
  payload: ManifestSignaturePayload,
  signatureB64: string,
  publicKeySpkiB64: string = FORGEKIT_PUBLIC_KEY_SPKI_B64,
): VerifyResult {
  try {
    const key = createPublicKey({
      key: Buffer.from(publicKeySpkiB64, 'base64'),
      format: 'der',
      type: 'spki',
    });
    if (key.asymmetricKeyType !== 'ed25519') {
      return { valid: false, reason: 'Public key is not Ed25519' };
    }
    const data = canonicalPayload(payload);
    const sig = Buffer.from(signatureB64, 'base64');
    const ok = verify(null, data, key, sig);
    return ok ? { valid: true } : { valid: false, reason: 'Signature does not match' };
  } catch (err) {
    return {
      valid: false,
      reason: `Verification error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Vérifie le SHA-256 d'un buffer (intégrité du zip).
 */
export function verifyZipHash(buf: Buffer, expectedSha256: string): VerifyResult {
  const got = createHash('sha256').update(buf).digest('hex');
  if (got.toLowerCase() !== expectedSha256.toLowerCase()) {
    return { valid: false, reason: `SHA-256 mismatch (got ${got.slice(0, 12)}…)` };
  }
  return { valid: true };
}
