// Cupel CLI — thème terminal aligné DESIGN.md
// Author: Aïssa BELKOUSSA

import chalk from 'chalk';

// Palette DESIGN.md (clair éditorial) — exposée pour réutilisation
export const palette = {
  ivory: '#FAF8F5',
  ink: '#0B0D0E',
  graphite: '#3A3D40',
  mist: '#ECE8E0',
  linen: '#DDD7CB',
  terracotta: '#C9573B',
  sage: '#7A8471',
  inkNight: '#1A1F2E',
  goldPale: '#C8A668',
  carmine: '#962D2D',
} as const;

// Détection support unicode terminal pour décider du chevron
function supportsUnicode(): boolean {
  if (process.platform === 'win32') {
    return Boolean(process.env.WT_SESSION) || process.env.TERM_PROGRAM === 'vscode';
  }
  const lang = `${process.env.LANG ?? ''}${process.env.LC_ALL ?? ''}${process.env.LC_CTYPE ?? ''}`;
  return /UTF-?8/i.test(lang);
}

const UNICODE = supportsUnicode();

// Glyphes (chevron Apple › cf. CLAUDE.md §20)
export const glyph = {
  chevron: UNICODE ? ' ›' : ' >',
  check: UNICODE ? '✓' : 'OK',
  cross: UNICODE ? '✗' : 'X',
  arrow: UNICODE ? '→' : '->',
  bullet: UNICODE ? '•' : '*',
  ellipsis: UNICODE ? '…' : '...',
} as const;

export const ui = {
  // Hiérarchie typographique
  title: (s: string) => chalk.hex(palette.terracotta).bold(s),
  subtitle: (s: string) => chalk.hex(palette.sage)(s),
  body: (s: string) => chalk.hex(palette.ink)(s),
  muted: (s: string) => chalk.hex(palette.graphite)(s),

  // États
  success: (s: string) => chalk.hex(palette.sage)(`${glyph.check} ${s}`),
  error: (s: string) => chalk.hex(palette.carmine)(`${glyph.cross} ${s}`),
  warn: (s: string) => chalk.hex(palette.goldPale)(`! ${s}`),
  info: (s: string) => chalk.hex(palette.graphite)(`${glyph.bullet} ${s}`),

  // Liens "More about X" → chevron Apple (CLAUDE.md §20)
  link: (label: string) => chalk.hex(palette.terracotta).underline(`${label}${glyph.chevron}`),

  // Code / IDs
  code: (s: string) => chalk.hex(palette.ink).bgHex(palette.mist)(` ${s} `),
  badge: (s: string) => chalk.hex(palette.ivory).bgHex(palette.terracotta).bold(` ${s} `),

  // Séparateur éditorial
  rule: (width = 60) => chalk.hex(palette.linen)('─'.repeat(width)),
} as const;

export type UI = typeof ui;
