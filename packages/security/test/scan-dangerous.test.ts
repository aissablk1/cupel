// Cupel Security — Tests détection code dangereux
// Author: Aïssa BELKOUSSA

import { describe, it, expect } from 'vitest';
import { scanContentForDangerousCode } from '../src/scan/dangerous-code.js';

describe('scanContentForDangerousCode', () => {
  it('detecte eval()', () => {
    const findings = scanContentForDangerousCode('const r = eval(userInput);', 'bad.js');
    expect(findings.some((f) => f.pattern === 'eval()')).toBe(true);
    expect(findings.find((f) => f.pattern === 'eval()')?.severity).toBe('critical');
  });

  it('detecte Function constructor', () => {
    const findings = scanContentForDangerousCode('const f = new Function("x", "return x*2");', 'b.js');
    expect(findings.some((f) => f.pattern === 'Function constructor')).toBe(true);
  });

  it('detecte require child_process', () => {
    const findings = scanContentForDangerousCode(
      "const cp = require('child_process');",
      'mod.js',
    );
    expect(findings.some((f) => f.pattern === 'child_process')).toBe(true);
  });

  it('detecte import ESM child_process', () => {
    const findings = scanContentForDangerousCode(
      "import { exec } from 'child_process';",
      'mod.mjs',
    );
    expect(findings.some((f) => f.pattern === 'child_process (ESM)')).toBe(true);
  });

  it('detecte exec/spawn', () => {
    const findings = scanContentForDangerousCode('exec("rm -rf /")', 'evil.js');
    expect(findings.some((f) => f.pattern === 'exec/execSync')).toBe(true);
  });

  it('ignore le code propre', () => {
    const safe = [
      'export function add(a: number, b: number) {',
      '  return a + b;',
      '}',
    ].join('\n');
    const findings = scanContentForDangerousCode(safe, 'ok.ts');
    expect(findings).toHaveLength(0);
  });
});
