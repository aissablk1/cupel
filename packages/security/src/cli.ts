#!/usr/bin/env node
// Forgekit Security — CLI standalone
// Author: Aïssa BELKOUSSA
//
// Usage:
//   forgekit-security scan <path> [--json] [--fail-on=warn|fail]
//
// Exit codes:
//   0 = pass (ou warn si --fail-on=fail)
//   1 = fail
//   2 = warn (si --fail-on=warn)
//   3 = erreur d'invocation

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { scanSkill, type ScanResult } from './scan/index.js';

const SCANNABLE_EXT = new Set([
  '.md',
  '.txt',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.yaml',
  '.yml',
  '.env',
  '.sh',
  '.py',
]);

const MAX_FILE_BYTES = 2 * 1024 * 1024;

function collectFiles(rootPath: string): Array<{ path: string; content: string }> {
  const out: Array<{ path: string; content: string }> = [];
  const st = statSync(rootPath);
  if (st.isFile()) {
    out.push({ path: rootPath, content: safeRead(rootPath) });
    return out;
  }
  walk(rootPath, rootPath, out);
  return out;
}

function walk(
  base: string,
  dir: string,
  out: Array<{ path: string; content: string }>,
): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(base, full, out);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!SCANNABLE_EXT.has(ext) && entry.name !== 'SKILL.md') continue;
      try {
        const s = statSync(full);
        if (s.size > MAX_FILE_BYTES) continue;
        out.push({ path: relative(base, full), content: safeRead(full) });
      } catch {
        /* ignore */
      }
    }
  }
}

function safeRead(p: string): string {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function colorize(verdict: ScanResult['verdict'], text: string): string {
  if (!process.stdout.isTTY) return text;
  const c = verdict === 'fail' ? 31 : verdict === 'warn' ? 33 : 32;
  return `\x1b[${c}m${text}\x1b[0m`;
}

function printHuman(target: string, result: ScanResult): void {
  console.log(`\nForgekit Security scan — ${target}`);
  console.log('─'.repeat(60));
  console.log(`Verdict : ${colorize(result.verdict, result.verdict.toUpperCase())}`);
  console.log(`Score   : ${result.score}/100`);
  console.log(
    `Counts  : critical=${result.counts.critical}  high=${result.counts.high}  medium=${result.counts.medium}  low=${result.counts.low}`,
  );
  const sections: Array<[string, Array<{ pattern: string; severity: string; file: string; line: number; preview: string }>]> = [
    ['Secrets', result.secrets],
    ['Dangerous code', result.dangers],
    ['Prompt injection', result.injections],
  ];
  for (const [title, list] of sections) {
    if (list.length === 0) continue;
    console.log(`\n${title} (${list.length}) :`);
    for (const f of list) {
      console.log(`  [${f.severity}] ${f.pattern}  ${f.file}:${f.line}`);
      console.log(`    > ${f.preview}`);
    }
  }
  console.log('');
}

function usage(): never {
  console.error('Usage: forgekit-security scan <path> [--json] [--fail-on=warn|fail]');
  process.exit(3);
}

function main(): void {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (cmd !== 'scan' || !argv[1]) usage();
  const target = argv[1] as string;
  const json = argv.includes('--json');
  const failOnArg = argv.find((a) => a.startsWith('--fail-on='));
  const failOn = (failOnArg?.split('=')[1] ?? 'fail') as 'warn' | 'fail';

  let files: Array<{ path: string; content: string }>;
  try {
    files = collectFiles(target);
  } catch (e) {
    console.error(`Impossible de lire ${target} :`, (e as Error).message);
    process.exit(3);
  }

  const result = scanSkill({ files });

  if (json) {
    console.log(JSON.stringify({ target, ...result }, null, 2));
  } else {
    printHuman(target, result);
  }

  if (result.verdict === 'fail') process.exit(1);
  if (result.verdict === 'warn' && failOn === 'warn') process.exit(2);
  process.exit(0);
}

main();
