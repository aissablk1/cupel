// Forgekit CLI — tests détection plateformes
// Author: Aïssa BELKOUSSA

import { describe, it, expect } from 'vitest';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { detectInstalledPlatforms, getInstallPath } from '../src/lib/platforms.js';

describe('platforms', () => {
  it('detectInstalledPlatforms returns a subset of known platforms', () => {
    const installed = detectInstalledPlatforms();
    const known = [
      'claude_code',
      'cursor',
      'codex',
      'windsurf',
      'gemini_cli',
      'copilot_cli',
      'continue',
    ];
    for (const p of installed) {
      expect(known).toContain(p);
    }
    // Pas de doublons
    expect(new Set(installed).size).toBe(installed.length);
  });

  it('getInstallPath returns the correct ~ relative path for claude_code', () => {
    const p = getInstallPath('claude_code', 'my-skill');
    expect(p).toBe(join(homedir(), '.claude', 'skills', 'my-skill'));
  });

  it('getInstallPath uses cursor rules dir for cursor platform', () => {
    const p = getInstallPath('cursor', 'ts-strict');
    expect(p).toBe(join(homedir(), '.cursor', 'rules', 'ts-strict'));
  });

  it('getInstallPath embeds the skill slug as final segment', () => {
    const p = getInstallPath('windsurf', 'edge-case_slug-123');
    expect(p.endsWith('edge-case_slug-123')).toBe(true);
  });
});
