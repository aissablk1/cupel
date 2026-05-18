/**
 * Input — Cupel UI
 * Direction : Editorial Premium
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'editorial' | 'form';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'form', type = 'text', ...props }, ref) => {
    const base =
      'w-full bg-transparent text-base text-[var(--color-ink)] placeholder:text-[var(--color-graphite)] focus:outline-none transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50';
    const styles =
      variant === 'editorial'
        ? 'border-0 border-b border-[var(--color-linen)] rounded-none py-2 focus:border-[var(--color-terracotta)]'
        : 'h-11 rounded-[4px] border border-[var(--color-linen)] px-4 focus:border-[var(--color-ink)]';
    return (
      <input
        ref={ref}
        type={type}
        className={cn(base, styles, className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
