/**
 * StatCard — Dashboard
 * Direction : Editorial Premium (Stripe-like table éditoriale)
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'border border-[var(--color-linen)] rounded-[4px] p-6 bg-[var(--color-ivory)] flex flex-col gap-3',
        className
      )}
    >
      <p className="text-xs uppercase tracking-wider text-[var(--color-graphite)]">
        {label}
      </p>
      <p className="font-display text-5xl tracking-tight leading-none">{value}</p>
      <div className="flex items-center gap-2 text-sm">
        {trend && (
          <span
            className={cn(
              'font-medium',
              trend.positive ? 'text-[var(--color-sage)]' : 'text-[var(--color-carmine)]'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {hint && <span className="text-[var(--color-graphite)]">{hint}</span>}
      </div>
    </div>
  );
}
