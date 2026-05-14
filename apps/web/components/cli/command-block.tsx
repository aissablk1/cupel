/**
 * CommandBlock — CLI onboarding
 * Direction : Editorial Premium — terminal sombre avec accent terracotta
 */
'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandBlockProps {
  command: string;
  label?: string;
  className?: string;
}

export function CommandBlock({ command, label, className }: CommandBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard indisponible — silencieux */
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-[4px] border border-[var(--color-linen)] bg-[#0B0D0E] text-[var(--color-ivory)] font-mono text-sm overflow-hidden',
        className
      )}
    >
      {label && (
        <div className="border-b border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white/50">
          {label}
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="text-[var(--color-terracotta)] select-none">$</span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copier la commande"
          className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-[2px] text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-terracotta)]"
        >
          {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}
