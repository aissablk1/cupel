/**
 * Badge — Forgekit UI
 * Direction : Editorial Premium
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[2px] px-2 py-0.5 text-[0.64rem] font-medium uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-mist)] text-[var(--color-ink)]',
        accent: 'bg-[var(--color-terracotta)] text-[var(--color-ivory)] normal-case tracking-normal',
        success: 'bg-[var(--color-sage)] text-[var(--color-ivory)]',
        gold: 'bg-[var(--color-gold)] text-[var(--color-ink)]',
        outline: 'border border-[var(--color-linen)] text-[var(--color-graphite)] bg-transparent',
        danger: 'bg-[var(--color-carmine)] text-[var(--color-ivory)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
