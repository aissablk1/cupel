'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ease } from '../../lib/motion';

type Plan = {
  id: 'free' | 'teams' | 'enterprise';
  name: string;
  price: string;
  unit: string;
  pitch: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
};

export function PricingTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-px overflow-hidden border border-[var(--color-linen)] bg-[var(--color-linen)] md:grid-cols-12">
      {plans.map((plan, i) => (
        <PlanColumn key={plan.id} plan={plan} index={i} />
      ))}
    </div>
  );
}

function PlanColumn({ plan, index }: { plan: Plan; index: number }) {
  // Asymétrie : Free 4/12, Teams 5/12 featured (breakout), Enterprise 3/12
  const span =
    plan.id === 'teams'
      ? 'md:col-span-5'
      : plan.id === 'free'
        ? 'md:col-span-4'
        : 'md:col-span-3';

  const bg = plan.featured ? 'bg-[var(--color-ink)] text-[var(--color-ivory)]' : 'bg-[var(--color-ivory)]';
  const muted = plan.featured ? 'text-[var(--color-linen)]' : 'text-[var(--color-graphite)]';
  const bullet = plan.featured ? 'bg-[var(--color-terracotta-soft)]' : 'bg-[var(--color-terracotta)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: ease.out, delay: index * 0.08 }}
      className={`${span} ${bg} flex flex-col p-8 md:p-10`}
    >
      <div className="flex items-baseline justify-between">
        <p className={`font-mono text-xs uppercase tracking-[0.2em] ${plan.featured ? 'text-[var(--color-terracotta-soft)]' : 'text-[var(--color-terracotta)]'}`}>
          {plan.name}
        </p>
        {plan.badge && (
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${plan.featured ? 'text-[var(--color-ivory)]' : 'text-[var(--color-graphite)]'}`}>
            {plan.badge}
          </span>
        )}
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-5xl tracking-tight md:text-6xl">{plan.price}</span>
      </div>
      <p className={`mt-2 text-sm ${muted}`}>{plan.unit}</p>
      <p className={`mt-6 text-base leading-relaxed ${muted}`}>{plan.pitch}</p>

      <ul className="mt-8 space-y-3 text-base">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span aria-hidden className={`mt-[10px] inline-block h-[5px] w-[5px] flex-none rounded-full ${bullet}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 pt-6">
        <Link
          href={plan.ctaHref}
          className={
            plan.featured
              ? 'inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[var(--color-terracotta)] px-7 py-3 text-base font-medium text-[var(--color-ivory)] transition-transform duration-200 hover:-translate-y-[1px]'
              : 'link-editorial text-base'
          }
        >
          {plan.ctaLabel}
        </Link>
      </div>
    </motion.div>
  );
}
