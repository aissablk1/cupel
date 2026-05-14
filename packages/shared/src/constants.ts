// Forgekit — Constants

export const PLATFORMS = [
  'claude_code',
  'cursor',
  'codex',
  'windsurf',
  'gemini_cli',
  'copilot_cli',
  'continue',
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
  windsurf: 'Windsurf',
  gemini_cli: 'Gemini CLI',
  copilot_cli: 'Copilot CLI',
  continue: 'Continue',
};

export const PLATFORM_PATHS: Record<Platform, string> = {
  claude_code: '~/.claude/skills',
  cursor: '~/.cursor/rules',
  codex: '~/.codex/skills',
  windsurf: '~/.windsurf/rules',
  gemini_cli: '~/.gemini/skills',
  copilot_cli: '~/.copilot/skills',
  continue: '~/.continue/skills',
};

export const CATEGORIES = [
  'frontend',
  'backend',
  'devops',
  'seo',
  'design',
  'security',
  'content',
  'data',
  'ai',
  'productivity',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRICING_MODELS = ['free', 'one_shot', 'subscription', 'pay_per_use'] as const;
export type PricingModel = (typeof PRICING_MODELS)[number];

export const SKILL_STATUSES = ['draft', 'in_review', 'published', 'suspended', 'archived'] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

/** Revenue share : creator 75 %, plateforme 25 % (cents entiers, jamais float) */
export const REVENUE_SHARE = {
  CREATOR: 0.75,
  PLATFORM: 0.25,
} as const;

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/** TVA EU — taux standards mai 2026 (source : Commission européenne) */
export const VAT_RATES_EU: Record<string, number> = {
  FR: 0.20, DE: 0.19, IT: 0.22, ES: 0.21, BE: 0.21, NL: 0.21,
  PT: 0.23, AT: 0.20, IE: 0.23, FI: 0.255, SE: 0.25, DK: 0.25,
  PL: 0.23, CZ: 0.21, HU: 0.27, RO: 0.19, GR: 0.24, LU: 0.17,
};

export const MAX_SKILL_ZIP_BYTES = 50 * 1024 * 1024;
