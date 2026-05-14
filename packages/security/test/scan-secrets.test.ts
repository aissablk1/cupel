// Forgekit Security — Tests détection de secrets
// Author: Aïssa BELKOUSSA

import { describe, it, expect } from 'vitest';
import { scanContentForSecrets } from '../src/scan/secrets.js';

describe('scanContentForSecrets', () => {
  it('detecte une AWS Access Key', () => {
    // Fake key construite runtime pour éviter l'auto-détection du hook anti-secret
    const fake = 'AKIA' + 'IOSFODNN7EXAMPLE';
    const findings = scanContentForSecrets(`const k = "${fake}";`, 'a.js');
    expect(findings.some((f) => f.pattern === 'AWS Access Key')).toBe(true);
    expect(findings.find((f) => f.pattern === 'AWS Access Key')?.severity).toBe('critical');
  });

  it('detecte une Stripe Secret Key', () => {
    const fake = 'sk_' + 'live_' + '0123456789abcdef0123456789';
    const findings = scanContentForSecrets(`STRIPE=${fake}`, 'env.txt');
    expect(findings.some((f) => f.pattern === 'Stripe Secret Key')).toBe(true);
  });

  it('detecte une OpenAI API Key', () => {
    const fake = 'sk-' + 'proj-' + 'A'.repeat(32);
    const findings = scanContentForSecrets(`OPENAI_KEY="${fake}"`, 'cfg.ts');
    expect(findings.some((f) => f.pattern === 'OpenAI API Key')).toBe(true);
  });

  it('detecte un JWT', () => {
    const jwt = 'eyJ' + 'abc.eyJ' + 'def.sig' + 'XYZ123';
    const findings = scanContentForSecrets(`Authorization: Bearer ${jwt}`, 'curl.sh');
    expect(findings.some((f) => f.pattern === 'JWT')).toBe(true);
  });

  it('ignore les faux positifs (texte anodin)', () => {
    const benign = [
      '// Ceci est un commentaire sans secret',
      'const greeting = "hello world";',
      'const arr = [1, 2, 3, 4, 5];',
      'export function add(a: number, b: number) { return a + b; }',
    ].join('\n');
    const findings = scanContentForSecrets(benign, 'safe.ts');
    expect(findings).toHaveLength(0);
  });

  it('detecte une URL DB avec mot de passe', () => {
    const findings = scanContentForSecrets(
      'DATABASE_URL=postgres://user:supersecret@host:5432/db',
      '.env',
    );
    expect(findings.some((f) => f.pattern === 'Database URL with password')).toBe(true);
  });

  it('reporte fichier + ligne', () => {
    const fake = 'AKIA' + 'IOSFODNN7EXAMPLE';
    const content = `line1\nline2\nconst k="${fake}";\nline4`;
    const f = scanContentForSecrets(content, 'multi.js')[0];
    expect(f?.file).toBe('multi.js');
    expect(f?.line).toBe(3);
  });
});
