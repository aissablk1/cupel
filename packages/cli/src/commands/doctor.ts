// Cupel CLI — `cupel doctor`
// Scan local & home-installed AI dev skills, score risk, emit report.
// Local-only. Zero network. Works offline.
// Author: Aïssa BELKOUSSA

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import chalk from 'chalk';
import type { Platform } from '@cupel/shared';
import { PLATFORM_LABELS } from '@cupel/shared';
import {
  detectInstalledPlatforms,
  getPlatformSkillsRoot,
  getProjectLocalSkillsRoots,
} from '../lib/platforms.js';

// ─── Types ────────────────────────────────────────────────────────────────

type Tier = 'ok' | 'warn' | 'danger';

interface Signal {
  kind: string;
  weight: number;
  evidence?: string;
}

interface SkillAudit {
  slug: string;
  path: string;
  scope: 'home' | 'project';
  platform: Platform;
  fileCount: number;
  totalBytes: number;
  ageDays: number;
  signals: Signal[];
  score: number;
  tier: Tier;
}

interface DoctorOptions {
  path?: string;
  json?: boolean;
  sarif?: boolean;
  strict?: boolean;
  verbose?: boolean;
}

// ─── Risk heuristics ──────────────────────────────────────────────────────

// Weights are intentionally conservative — false positives cost trust,
// missed signals cost users. Each rule fires at most once per file per skill.
const RULES: Array<{
  kind: string;
  weight: number;
  regex: RegExp;
  describe: (m: RegExpMatchArray) => string;
}> = [
  {
    kind: 'shell_pipe_to_interpreter',
    weight: 50,
    regex: /\b(curl|wget)\b[^\n]*\|\s*(bash|sh|zsh|python)\b/i,
    describe: (m) => `pipe distant → shell : ${m[0].slice(0, 80)}`,
  },
  {
    kind: 'rm_rf_root',
    weight: 40,
    regex: /\brm\s+-rf?\s+(\/|~|\$HOME|\*)/,
    describe: (m) => `destructif : ${m[0]}`,
  },
  {
    kind: 'reverse_shell_tcp',
    weight: 50,
    regex: /\/dev\/(tcp|udp)\/[0-9a-f.:]+\/\d+/i,
    describe: (m) => `socket reverse-shell : ${m[0]}`,
  },
  {
    kind: 'prompt_injection',
    weight: 25,
    regex: /\b(ignore|disregard|forget|oublie[zr]?)\s+(all\s+|toutes?\s+|les\s+)?(previous|prior|above|earlier|précédentes?|antérieures?)\s+(instructions|prompts|rules|context|consignes)\b/i,
    describe: (m) => `injection LLM probable : « ${m[0].slice(0, 60)} »`,
  },
  {
    kind: 'cred_file_read',
    weight: 35,
    regex: /(?:cat|less|head|tail|cp|scp|base64|xxd)\s+[^\n]*(\~\/\.ssh\/(id_[a-z]+|config)|\~\/\.aws\/credentials|\.env(\.\w+)?|\~\/\.netrc|\~\/\.docker\/config\.json|\~\/\.kube\/config)\b/i,
    describe: (m) => `lecture fichier sensible : ${m[0].slice(0, 70)}`,
  },
  {
    kind: 'rc_shell_rewrite',
    weight: 30,
    regex: />>\s*(\~|\$HOME)\/\.(bash_profile|bashrc|zshrc|zprofile|profile|config\/fish\/config\.fish)\b/,
    describe: (m) => `réécriture rc shell : ${m[0]}`,
  },
  {
    kind: 'powershell_iwr_iex',
    weight: 50,
    regex: /\b(iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\n]*\|\s*iex\b/i,
    describe: (m) => `PowerShell pipe distant → iex : ${m[0].slice(0, 80)}`,
  },
  {
    kind: 'eval_dynamic',
    weight: 35,
    regex: /\b(eval|Function)\s*\(\s*(atob|Buffer\.from|decodeURIComponent)\s*\(/,
    describe: (m) => `exécution dynamique obfusquée : ${m[0]}`,
  },
  {
    kind: 'webhook_exfil',
    weight: 30,
    regex: /https?:\/\/(?:[a-z0-9-]+\.)?(webhook\.site|discord\.com\/api\/webhooks|requestbin|ngrok\.io|pipedream\.net)/i,
    describe: (m) => `endpoint d'exfil suspect : ${m[0]}`,
  },
  {
    kind: 'env_dump',
    weight: 20,
    regex: /\b(printenv|env\s*\|\s*curl|process\.env\s*=>\s*fetch)/i,
    describe: (m) => `dump variables d'env : ${m[0]}`,
  },
  {
    kind: 'credential_pattern',
    weight: 25,
    regex: /(?!.*(?:EXAMPLE|XXXX|YOUR_|REDACTED))(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{30,})/,
    describe: () => `clé secrète littérale détectée dans le contenu`,
  },
  {
    kind: 'long_base64_blob',
    weight: 8,
    regex: /[A-Za-z0-9+/]{600,}={0,2}/,
    describe: (m) => `blob base64 anormalement long (${m[0].length} chars)`,
  },
  // ─── Règles 2026 — ASCII smuggling, tool poisoning, hex obfuscation ──
  // Source : Snyk ToxicSkills (mai 2026), Invariant Labs MCP tool poisoning (avril 2025),
  // Joseph Thacker & Riley Goodside red team Anthropic 2025.
  {
    kind: 'invisible_unicode',
    weight: 45,
    // Zero-width characters, RLO/LRO/RLE/LRE/PDF, BOM mid-file, Unicode Tags (E0000-E007F)
    regex: /[​-‏‪-‮⁠-⁯﻿]|[\uDB40][\uDC00-\uDC7F]/,
    describe: () => `caractère Unicode invisible (smuggling LLM)`,
  },
  {
    kind: 'tool_poisoning_directive',
    weight: 40,
    // Directives cachées ciblant l'agent dans commentaires HTML ou texte
    regex: /<!--\s*(?:SYSTEM|INTERNAL|ASSISTANT|CLAUDE|GPT|AI)[\s:]|\b(?:IMPORTANT FOR (?:ASSISTANT|AI|MODEL|LLM)|BEFORE RESPONDING|HIDDEN INSTRUCTION|DO NOT (?:TELL|MENTION|REVEAL) (?:THE )?USER)\b/i,
    describe: (m) => `directive cachée ciblant l'agent : ${m[0].slice(0, 60)}`,
  },
  {
    kind: 'hex_escape_chain',
    weight: 30,
    // Chaînes de \xNN ou \uNNNN consécutives (>= 8) — pattern d'obfuscation typique
    regex: /(?:\\x[0-9a-f]{2}){8,}|(?:\\u[0-9a-f]{4}){6,}|String\.fromCharCode\(\s*\d+\s*(?:,\s*\d+\s*){10,}\)/i,
    describe: (m) => `chaîne d'échappements hex/unicode (obfuscation) : ${m[0].slice(0, 60)}`,
  },
];

const TEXT_EXT = new Set([
  '.md', '.mdx', '.txt', '.json', '.yaml', '.yml', '.toml',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.py', '.rb', '.sh', '.bash', '.zsh', '.fish', '.ps1',
  '.go', '.rs', '.html', '.css',
]);

const TRUSTED_INSTALL_HOSTS = [
  'sh.rustup.rs',
  'raw.githubusercontent.com/nvm-sh',
  'get.docker.com',
  'bun.sh/install',
  'astral.sh/uv/install.sh',
];

const MAX_FILE_BYTES_SCAN = 512 * 1024;
const SIZE_ANOMALY_BYTES = 2 * 1024 * 1024;
const STALE_DAYS = 365;

// ─── Scanner ──────────────────────────────────────────────────────────────

function walkSkillFiles(skillDir: string): string[] {
  const out: string[] = [];
  function recurse(dir: string, depth: number): void {
    if (depth > 6) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isSymbolicLink()) continue;
      if (e.name.startsWith('.') && e.name !== '.cupel-sig') continue;
      if (e.name === 'node_modules') continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) recurse(p, depth + 1);
      else if (e.isFile()) out.push(p);
    }
  }
  recurse(skillDir, 0);
  return out;
}

function readTextSafe(path: string, capBytes: number): string | null {
  try {
    const buf = readFileSync(path);
    if (buf.length === 0) return '';
    return buf.subarray(0, Math.min(buf.length, capBytes)).toString('utf8');
  } catch {
    return null;
  }
}

function isTextFile(path: string): boolean {
  const i = path.lastIndexOf('.');
  if (i < 0) return false;
  return TEXT_EXT.has(path.slice(i).toLowerCase());
}

function auditSkill(
  slug: string,
  skillPath: string,
  platform: Platform,
  scope: 'home' | 'project',
): SkillAudit {
  const files = walkSkillFiles(skillPath);
  const signals: Signal[] = [];
  let totalBytes = 0;
  let newestMtime = 0;
  let hasManifest = false;
  let hasSignature = false;
  let oversizedFile = false;

  for (const f of files) {
    let st;
    try {
      st = statSync(f);
    } catch {
      continue;
    }
    totalBytes += st.size;
    if (st.mtimeMs > newestMtime) newestMtime = st.mtimeMs;
    if (st.size > SIZE_ANOMALY_BYTES) oversizedFile = true;

    const base = f.slice(skillPath.length + 1).toLowerCase();
    if (base === 'skill.md' || base === 'readme.md' || base === 'manifest.json') {
      hasManifest = true;
    }
    if (base === '.cupel-sig' || base === 'signature.json' || base.endsWith('.sig')) {
      hasSignature = true;
    }

    if (!isTextFile(f)) continue;
    const txt = readTextSafe(f, MAX_FILE_BYTES_SCAN);
    if (txt === null || txt.length === 0) continue;

    const isSvg = base.endsWith('.svg');
    const hasInlineDataUri = /data:(image|font)\//i.test(txt);

    const seen = new Set<string>();
    for (const rule of RULES) {
      if (seen.has(rule.kind)) continue;
      if (rule.kind === 'long_base64_blob' && (isSvg || hasInlineDataUri)) continue;
      const m = txt.match(rule.regex);
      if (m) {
        seen.add(rule.kind);
        let kind = rule.kind;
        let weight = rule.weight;
        if (rule.kind === 'shell_pipe_to_interpreter') {
          const ev = m[0];
          if (TRUSTED_INSTALL_HOSTS.some((h) => ev.includes(h))) {
            kind = 'shell_pipe_to_known_installer';
            weight = Math.floor(rule.weight / 2);
          }
        }
        signals.push({
          kind,
          weight,
          evidence: `${base} — ${rule.describe(m)}`,
        });
      }
    }
  }

  if (!hasManifest) {
    signals.push({ kind: 'no_manifest', weight: 10, evidence: 'pas de SKILL.md / README.md / manifest.json' });
  }
  if (!hasSignature) {
    signals.push({ kind: 'unsigned', weight: 10, evidence: 'aucune signature détectée' });
  }
  if (oversizedFile) {
    signals.push({ kind: 'oversized_file', weight: 10, evidence: `fichier > ${SIZE_ANOMALY_BYTES / 1024 / 1024} MiB` });
  }

  const ageDays =
    newestMtime > 0 ? Math.floor((Date.now() - newestMtime) / (1000 * 60 * 60 * 24)) : 0;
  if (ageDays > STALE_DAYS) {
    signals.push({ kind: 'stale', weight: 5, evidence: `dernière modif il y a ${ageDays} j` });
  }

  const score = Math.min(100, signals.reduce((s, sig) => s + sig.weight, 0));
  const tier: Tier = score >= 50 ? 'danger' : score >= 20 ? 'warn' : 'ok';

  return {
    slug,
    path: skillPath,
    scope,
    platform,
    fileCount: files.length,
    totalBytes,
    ageDays,
    signals,
    score,
    tier,
  };
}

function scanRoot(
  root: string,
  platform: Platform,
  scope: 'home' | 'project',
): SkillAudit[] {
  if (!existsSync(root)) return [];
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: SkillAudit[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('.')) continue;
    out.push(auditSkill(e.name, join(root, e.name), platform, scope));
  }
  return out;
}

// ─── Renderer ─────────────────────────────────────────────────────────────

const COLORS = {
  brand: '#C9573B',
  ink: '#0B0D0E',
  sage: '#7A8471',
  danger: '#962D2D',
  warn: '#B8860B',
  ok: '#5E7D5E',
} as const;

function tierColor(t: Tier): (s: string) => string {
  if (t === 'danger') return chalk.hex(COLORS.danger).bold;
  if (t === 'warn') return chalk.hex(COLORS.warn);
  return chalk.hex(COLORS.ok);
}

function tierGlyph(t: Tier): string {
  return t === 'danger' ? '●' : t === 'warn' ? '◐' : '○';
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 / 1024).toFixed(1)} MiB`;
}

function renderReport(audits: SkillAudit[], verbose: boolean): void {
  const ink = chalk.hex(COLORS.ink);
  const sage = chalk.hex(COLORS.sage);
  const brand = chalk.hex(COLORS.brand);

  if (audits.length === 0) {
    console.log(ink('\n  Aucun skill détecté sur cette machine.\n'));
    console.log(sage('  Plateformes scannées :'));
    console.log(sage('    ~/.claude/skills/        ~/.config/cursor/skills/'));
    console.log(sage('    ~/.codex/skills/         ~/.config/windsurf/skills/'));
    console.log(sage('    ~/.gemini/skills/        ~/.continue/skills/'));
    console.log();
    console.log(sage('  Pour tester cupel sur un dossier précis :'));
    console.log(brand('    cupel --path /chemin/vers/dossier/skills') + sage('\n'));
    return;
  }

  const totals = { ok: 0, warn: 0, danger: 0 };
  for (const a of audits) totals[a.tier]++;

  console.log(ink('\n  Inventaire skills — audit local\n'));
  console.log(
    `  ${chalk.hex(COLORS.ok)('○ ' + totals.ok + ' sûrs')}    ` +
      `${chalk.hex(COLORS.warn)('◐ ' + totals.warn + ' à vérifier')}    ` +
      `${chalk.hex(COLORS.danger).bold('● ' + totals.danger + ' risque')}\n`,
  );

  const byPlatform = new Map<Platform, SkillAudit[]>();
  for (const a of audits) {
    const arr = byPlatform.get(a.platform) ?? [];
    arr.push(a);
    byPlatform.set(a.platform, arr);
  }

  for (const [platform, arr] of byPlatform) {
    arr.sort((a, b) => b.score - a.score);
    console.log(brand(`  ${PLATFORM_LABELS[platform]}`) + sage(`  (${arr.length})`));
    for (const a of arr) {
      const color = tierColor(a.tier);
      const meta = sage(
        `${a.fileCount} fichier${a.fileCount > 1 ? 's' : ''} · ${formatBytes(a.totalBytes)} · ${a.scope === 'project' ? 'projet' : 'home'}`,
      );
      console.log(
        `    ${color(tierGlyph(a.tier))} ${ink(a.slug.padEnd(32))} ${color('score ' + String(a.score).padStart(3))}   ${meta}`,
      );
      if (verbose || a.tier !== 'ok') {
        for (const sig of a.signals) {
          console.log(sage(`        · ${sig.kind} (+${sig.weight}) — ${sig.evidence ?? ''}`));
        }
      }
    }
    console.log();
  }

  if (totals.danger > 0) {
    console.log(
      chalk.hex(COLORS.danger).bold('  ⚠ ') +
        ink(`${totals.danger} skill${totals.danger > 1 ? 's' : ''} à inspecter sans tarder.`),
    );
    console.log(sage('     Vérifie le contenu, supprime via `cupel remove <slug>` si compromis.\n'));
  } else if (totals.warn > 0) {
    console.log(sage('  Quelques skills méritent un coup d\'œil. `cupel --verbose` pour le détail complet.\n'));
  } else {
    console.log(sage('  Inventaire propre. ✓\n'));
  }

  // Action concrète avant CTA — anti-pitch UX (axe agent UX#4)
  if (totals.danger + totals.warn > 0) {
    console.log(ink('  Inspecter en détail :'));
    console.log(brand('    cupel --verbose'));
    console.log(sage('  Règles documentées : github.com/aissablk1/cupel#what-cupel-detects\n'));
  }

  // CTA discret, identique quelque soit le résultat (pas pushy sur les alertes)
  console.log(sage('  ─────────────────────────────────────────────────────────'));
  console.log(sage('  cupel — par Aïssa BELKOUSSA · aissabelkoussa.fr/cupel\n'));
}

// ─── SARIF 2.1.0 output (GitHub Code Scanning, GitLab, VS Code) ───────────
// https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html

interface SarifResult {
  ruleId: string;
  level: 'error' | 'warning' | 'note';
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
    };
  }>;
}

function tierToSarifLevel(t: Tier): 'error' | 'warning' | 'note' {
  if (t === 'danger') return 'error';
  if (t === 'warn') return 'warning';
  return 'note';
}

function renderSarif(audits: SkillAudit[], version: string): string {
  const ruleIds = new Set<string>();
  const results: SarifResult[] = [];

  for (const a of audits) {
    for (const sig of a.signals) {
      ruleIds.add(sig.kind);
      results.push({
        ruleId: sig.kind,
        level: tierToSarifLevel(a.tier),
        message: {
          text: `[${a.platform}/${a.slug}] ${sig.kind} — ${sig.evidence ?? ''}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: a.path },
            },
          },
        ],
      });
    }
  }

  const rules = Array.from(ruleIds).map((id) => {
    const rule = RULES.find((r) => r.kind === id);
    return {
      id,
      name: id,
      shortDescription: { text: id.replace(/_/g, ' ') },
      defaultConfiguration: {
        level: (rule?.weight ?? 0) >= 40 ? 'error' : rule?.weight ?? 0 >= 20 ? 'warning' : 'note',
      },
      helpUri: `https://github.com/aissablk1/cupel#${id}`,
    };
  });

  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'cupel',
            version,
            informationUri: 'https://aissabelkoussa.fr/cupel',
            organization: 'Aïssa BELKOUSSA',
            rules,
          },
        },
        results,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}

// ─── Entrypoint ───────────────────────────────────────────────────────────

export async function doctorCommand(opts: DoctorOptions = {}): Promise<void> {
  const audits: SkillAudit[] = [];
  const startMs = Date.now();
  const isMachineOutput = opts.json || opts.sarif;

  // Header progressif sur stderr — pas de pollution des pipes stdout (axe UX agent #2)
  const homePlatforms = detectInstalledPlatforms();
  if (!isMachineOutput) {
    process.stderr.write(
      `cupel scan — ${homePlatforms.length} platform${homePlatforms.length > 1 ? 's' : ''} detected, local only, zero network…\n`,
    );
  }

  for (const p of homePlatforms) {
    audits.push(...scanRoot(getPlatformSkillsRoot(p), p, 'home'));
  }

  const projectPath = resolve(opts.path ?? process.cwd());
  if (existsSync(projectPath)) {
    const projectRoots = getProjectLocalSkillsRoots(projectPath);
    for (const { platform, root } of projectRoots) {
      audits.push(...scanRoot(root, platform, 'project'));
    }
  }

  // Compteur de fin de scan sur stderr (n'apparaît qu'en mode humain)
  if (!isMachineOutput) {
    const elapsed = ((Date.now() - startMs) / 1000).toFixed(2);
    process.stderr.write(`cupel scan — ${audits.length} skill${audits.length > 1 ? 's' : ''} analysed in ${elapsed}s\n`);
  }

  if (opts.sarif) {
    process.stdout.write(renderSarif(audits, '0.3.0') + '\n');
  } else if (opts.json) {
    process.stdout.write(JSON.stringify({ projectPath, audits }, null, 2) + '\n');
  } else {
    renderReport(audits, opts.verbose ?? false);
  }

  if (opts.strict && audits.some((a) => a.tier === 'danger')) {
    process.exit(2);
  }
}

export const __internal = { auditSkill, RULES };
