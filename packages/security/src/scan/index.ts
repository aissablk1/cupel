// Forgekit Security — Scan orchestrateur
// Author: Aïssa BELKOUSSA

import { scanContentForSecrets, type SecretFinding } from './secrets.js';
import { scanContentForDangerousCode, type DangerFinding } from './dangerous-code.js';
import { scanContentForPromptInjection, type InjectionFinding } from './prompt-injection.js';

export interface ScanResult {
  verdict: 'pass' | 'warn' | 'fail';
  score: number;
  counts: { critical: number; high: number; medium: number; low: number };
  secrets: SecretFinding[];
  dangers: DangerFinding[];
  injections: InjectionFinding[];
}

export interface ScanInput {
  files: Array<{ path: string; content: string }>;
}

export function scanSkill(input: ScanInput): ScanResult {
  const secrets: SecretFinding[] = [];
  const dangers: DangerFinding[] = [];
  const injections: InjectionFinding[] = [];

  for (const f of input.files) {
    secrets.push(...scanContentForSecrets(f.content, f.path));
    dangers.push(...scanContentForDangerousCode(f.content, f.path));
    injections.push(...scanContentForPromptInjection(f.content, f.path));
  }

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const arr of [secrets, dangers, injections]) {
    for (const f of arr) {
      // narrow severity safely
      const s = (f as { severity: string }).severity;
      if (s === 'critical') counts.critical++;
      else if (s === 'high') counts.high++;
      else if (s === 'medium') counts.medium++;
      else counts.low++;
    }
  }

  // Score 100 = parfait. -25 par critical, -10 par high, -3 par medium, -1 par low
  const score = Math.max(
    0,
    100 - counts.critical * 25 - counts.high * 10 - counts.medium * 3 - counts.low,
  );

  let verdict: ScanResult['verdict'] = 'pass';
  if (counts.critical > 0) verdict = 'fail';
  else if (counts.high > 0 || score < 70) verdict = 'warn';

  return { verdict, score, counts, secrets, dangers, injections };
}

export * from './secrets.js';
export * from './dangerous-code.js';
export * from './prompt-injection.js';
