'use client';

import { motion } from 'motion/react';
import { ease } from '../../lib/motion';

export function TerminalDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: ease.out }}
      className="overflow-hidden rounded-[4px] border border-[var(--color-linen)] bg-[var(--color-ink)] font-mono text-sm"
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-graphite)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-carmine)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-gold)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-sage)]" />
        <span className="ml-3 text-xs text-[var(--color-linen)]">~/projects/my-app</span>
      </div>
      <div className="space-y-2 p-6 text-[var(--color-ivory)]">
        <p>
          <span className="text-[var(--color-sage)]">$</span>{' '}
          <span className="text-[var(--color-terracotta-soft)]">npx cupel install</span>{' '}
          <span>seo-auditor</span>
        </p>
        <p className="text-[var(--color-linen)]">↳ Detected platform: Claude Code</p>
        <p className="text-[var(--color-linen)]">↳ Verifying signature… ok</p>
        <p className="text-[var(--color-linen)]">↳ Installing to ~/.claude/skills/seo-auditor</p>
        <p>
          <span className="text-[var(--color-sage)]">✓</span> Installed seo-auditor@1.4.2 in 1.8 s
        </p>
        <p className="mt-4">
          <span className="text-[var(--color-sage)]">$</span>{' '}
          <span className="text-[var(--color-terracotta-soft)]">claude</span>{' '}
          <span className="text-[var(--color-linen)]">/seo-auditor my-page.tsx</span>
        </p>
      </div>
    </motion.div>
  );
}
