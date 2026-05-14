// Forgekit CLI — détection des plateformes IDE installées
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Platform } from '@forgekit/shared';

const PATHS: Record<Platform, string> = {
  claude_code: join(homedir(), '.claude', 'skills'),
  cursor: join(homedir(), '.cursor', 'rules'),
  codex: join(homedir(), '.codex', 'skills'),
  windsurf: join(homedir(), '.windsurf', 'rules'),
  gemini_cli: join(homedir(), '.gemini', 'skills'),
  copilot_cli: join(homedir(), '.copilot', 'skills'),
  continue: join(homedir(), '.continue', 'skills'),
};

const DETECTORS: Record<Platform, () => boolean> = {
  claude_code: () => existsSync(join(homedir(), '.claude')),
  cursor: () => existsSync(join(homedir(), '.cursor')),
  codex: () => existsSync(join(homedir(), '.codex')),
  windsurf: () => existsSync(join(homedir(), '.windsurf')),
  gemini_cli: () => existsSync(join(homedir(), '.gemini')),
  copilot_cli: () => existsSync(join(homedir(), '.copilot')),
  continue: () => existsSync(join(homedir(), '.continue')),
};

export function detectInstalledPlatforms(): Platform[] {
  return (Object.keys(DETECTORS) as Platform[]).filter((p) => DETECTORS[p]());
}

export function getInstallPath(platform: Platform, skillSlug: string): string {
  return join(PATHS[platform], skillSlug);
}
