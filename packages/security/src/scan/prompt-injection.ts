// Forgekit Security — Anti prompt-injection heuristics
// Author: Aïssa BELKOUSSA

export const INJECTION_PATTERNS: Array<{ name: string; regex: RegExp; severity: 'critical' | 'high' | 'medium' }> = [
  { name: 'Ignore previous instructions (EN)', regex: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|rules|prompt)/gi, severity: 'critical' },
  { name: 'Ignore previous instructions (FR)', regex: /ignore[zr]?\s+(les?\s+)?(instructions?|consignes?|règles?)\s+(précédentes?|antérieures?)/gi, severity: 'critical' },
  { name: 'Override system prompt', regex: /(override|replace|forget)\s+(the\s+)?system\s+prompt/gi, severity: 'critical' },
  { name: 'You are now', regex: /you\s+are\s+now\s+(a\s+)?(different|new|developer|admin|root|sudo|unrestricted)/gi, severity: 'critical' },
  { name: 'Tu es maintenant', regex: /tu\s+es\s+maintenant\s+(un\s+|une\s+)?(autre|nouveau|administrateur|root|sans\s+restriction)/gi, severity: 'critical' },
  { name: 'DAN jailbreak', regex: /\b(DAN|do anything now)\b/gi, severity: 'high' },
  { name: 'Pretend / Roleplay escape', regex: /pretend\s+(you\s+(are|have))|roleplay\s+as/gi, severity: 'high' },
  { name: 'Hidden command via comment', regex: /<!--\s*(execute|run|eval|sudo)/gi, severity: 'high' },
  { name: 'Unicode confusables (Cyrillic A)', regex: /[А-Я]/g, severity: 'medium' },
  { name: 'Zero-width chars', regex: /[​-‍﻿]/g, severity: 'medium' },
  { name: 'Base64 long suspicious', regex: /[A-Za-z0-9+/]{200,}={0,2}/g, severity: 'medium' },
];

export interface InjectionFinding {
  pattern: string;
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  preview: string;
}

export function scanContentForPromptInjection(content: string, file: string): InjectionFinding[] {
  const findings: InjectionFinding[] = [];
  const lines = content.split('\n');
  for (const p of INJECTION_PATTERNS) {
    lines.forEach((line, idx) => {
      p.regex.lastIndex = 0;
      if (p.regex.test(line)) {
        findings.push({
          pattern: p.name,
          severity: p.severity,
          file,
          line: idx + 1,
          preview: line.slice(0, 80),
        });
      }
    });
  }
  return findings;
}
