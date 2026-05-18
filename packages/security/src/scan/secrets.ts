// Cupel Security — Scan secrets
// Author: Aïssa BELKOUSSA
// NOTE: les patterns ci-dessous détectent les fuites de secrets dans
// le contenu des skills uploadés. Le contenu littéral des regex est
// volontairement assemblé runtime pour éviter le faux positif des
// scanners statiques sur ce propre fichier source.

const PEM_HEADER = ['-----BEGIN ', '(RSA |EC |DSA |OPENSSH |PGP )?', 'PRIVATE KEY-----'].join('');
const SSH_HEADER = ['-----BEGIN ', 'OPENSSH ', 'PRIVATE KEY-----'].join('');

export interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium';
}

export const SECRET_PATTERNS: SecretPattern[] = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
  { name: 'Stripe Secret Key', regex: /sk_(live|test)_[0-9a-zA-Z]{24,99}/g, severity: 'critical' },
  { name: 'Stripe Publishable', regex: /pk_(live|test)_[0-9a-zA-Z]{24,99}/g, severity: 'medium' },
  { name: 'Stripe Webhook Secret', regex: /whsec_[0-9a-zA-Z]{32,}/g, severity: 'critical' },
  { name: 'GitHub Personal Token', regex: /ghp_[0-9a-zA-Z]{36,}/g, severity: 'critical' },
  { name: 'GitHub OAuth Token', regex: /gho_[0-9a-zA-Z]{36,}/g, severity: 'critical' },
  { name: 'GitHub App Token', regex: /ghs_[0-9a-zA-Z]{36,}/g, severity: 'critical' },
  { name: 'OpenAI API Key', regex: /sk-(proj-)?[a-zA-Z0-9]{20,}/g, severity: 'critical' },
  { name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9_-]{32,}/g, severity: 'critical' },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z_-]{35}/g, severity: 'critical' },
  { name: 'Slack Token', regex: /xox[abpr]-[0-9a-zA-Z-]{10,}/g, severity: 'critical' },
  { name: 'Slack Webhook', regex: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9/]+/g, severity: 'high' },
  { name: 'JWT', regex: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, severity: 'medium' },
  { name: 'PEM Private Key', regex: new RegExp(PEM_HEADER, 'g'), severity: 'critical' },
  { name: 'SSH Private Key', regex: new RegExp(SSH_HEADER, 'g'), severity: 'critical' },
  { name: 'Database URL with password', regex: /(postgres|postgresql|mysql|mongodb|redis):\/\/[^:]+:[^@\s]+@/gi, severity: 'critical' },
  { name: 'Generic API key hint', regex: /(api[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}/gi, severity: 'high' },
  { name: 'Password literal', regex: /(password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{6,}["']/gi, severity: 'high' },
  { name: 'NEXT_PUBLIC_ secret-looking', regex: /NEXT_PUBLIC_[A-Z_]*(SECRET|KEY|TOKEN)[A-Z_]*/g, severity: 'high' },
  { name: 'Mailgun API Key', regex: /key-[a-z0-9]{32}/g, severity: 'high' },
  { name: 'SendGrid API Key', regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, severity: 'high' },
];

export interface SecretFinding {
  pattern: string;
  severity: SecretPattern['severity'];
  file: string;
  line: number;
  preview: string;
}

export function scanContentForSecrets(content: string, file: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split('\n');
  for (const { name, regex, severity } of SECRET_PATTERNS) {
    lines.forEach((line, idx) => {
      regex.lastIndex = 0;
      const match = regex.exec(line);
      if (match) {
        findings.push({
          pattern: name,
          severity,
          file,
          line: idx + 1,
          preview: line.slice(0, 80) + (line.length > 80 ? '…' : ''),
        });
      }
    });
  }
  return findings;
}
