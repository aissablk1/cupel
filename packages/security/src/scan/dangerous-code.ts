// Forgekit Security — Détection code dangereux
// Author: Aïssa BELKOUSSA

export interface DangerPattern {
  name: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  why: string;
}

export const DANGER_PATTERNS: DangerPattern[] = [
  { name: 'eval()', regex: /\beval\s*\(/g, severity: 'critical', why: 'Exécution dynamique arbitraire' },
  { name: 'Function constructor', regex: /\bnew\s+Function\s*\(/g, severity: 'critical', why: 'Création de fonction depuis string' },
  { name: 'child_process', regex: /require\s*\(\s*['"]child_process['"]/g, severity: 'critical', why: 'Spawn de process système' },
  { name: 'child_process (ESM)', regex: /from\s+['"]child_process['"]/g, severity: 'critical', why: 'Spawn de process système' },
  { name: 'exec/execSync', regex: /\b(exec|execSync|execFile|spawn|spawnSync)\s*\(/g, severity: 'high', why: 'Exécution shell' },
  { name: 'fs.unlink/rm', regex: /\bfs\.(unlink|rm|rmdir)\s*\(/g, severity: 'high', why: 'Suppression de fichiers' },
  { name: 'fs.write', regex: /\bfs\.(write|writeFile|writeFileSync|appendFile)\s*\(/g, severity: 'medium', why: 'Écriture FS' },
  { name: 'Dynamic require', regex: /require\s*\(\s*[^'"\s)]+\s*\)/g, severity: 'high', why: 'Require dynamique non-littéral' },
  { name: 'Dynamic import via concat', regex: /import\s*\(\s*[^'"]*[+`]/g, severity: 'high', why: 'Import dynamique calculé' },
  { name: 'globalThis mutation', regex: /globalThis\.[a-zA-Z_$]+\s*=/g, severity: 'medium', why: 'Pollution global' },
  { name: 'Fetch to unknown', regex: /fetch\s*\(\s*[`'"]https?:\/\/(?!api\.forgekit\.dev|cdn\.forgekit\.dev)/g, severity: 'medium', why: 'Appel réseau externe' },
  { name: 'Network: http/https raw', regex: /require\s*\(\s*['"](http|https|net|dgram)['"]/g, severity: 'medium', why: 'Module réseau bas niveau' },
  { name: 'Crypto raw without context', regex: /createCipheriv|createDecipheriv|createHmac\s*\(\s*['"]md5['"]/gi, severity: 'low', why: 'Crypto faible ou usage suspect' },
  { name: 'Base64 obfuscation', regex: /Buffer\.from\s*\(\s*['"][A-Za-z0-9+/=]{40,}['"],?\s*['"]base64['"]\s*\)/g, severity: 'medium', why: 'Décodage base64 long (obfuscation possible)' },
];

export interface DangerFinding {
  pattern: string;
  severity: DangerPattern['severity'];
  why: string;
  file: string;
  line: number;
  preview: string;
}

export function scanContentForDangerousCode(content: string, file: string): DangerFinding[] {
  const findings: DangerFinding[] = [];
  const lines = content.split('\n');
  for (const p of DANGER_PATTERNS) {
    lines.forEach((line, idx) => {
      p.regex.lastIndex = 0;
      if (p.regex.test(line)) {
        findings.push({
          pattern: p.name,
          severity: p.severity,
          why: p.why,
          file,
          line: idx + 1,
          preview: line.slice(0, 80),
        });
      }
    });
  }
  return findings;
}
