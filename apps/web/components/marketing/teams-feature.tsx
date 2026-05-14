'use client';

import { motion } from 'motion/react';
import {
  ShieldCheck,
  ClipboardText,
  FunnelSimple,
  LockKey,
  ArrowsClockwise,
  ChatCircleText,
  type IconProps,
} from 'phosphor-react';
import type { ComponentType } from 'react';
import { ease } from '../../lib/motion';

type PhosphorIcon = ComponentType<IconProps>;

export type TeamsFeatureItem = {
  id: string;
  icon: 'sso' | 'audit' | 'allowlist' | 'private' | 'cross' | 'support';
  title: string;
  body: string;
};

const ICONS: Record<TeamsFeatureItem['icon'], PhosphorIcon> = {
  sso: ShieldCheck,
  audit: ClipboardText,
  allowlist: FunnelSimple,
  private: LockKey,
  cross: ArrowsClockwise,
  support: ChatCircleText,
};

export function TeamsFeature({ items }: { items: TeamsFeatureItem[] }) {
  // Layout éditorial : grille 12 col, items en 6/12 alternés avec décalage vertical sur desktop
  return (
    <div className="grid gap-x-12 gap-y-16 md:grid-cols-12">
      {items.map((item, i) => {
        const Icon = ICONS[item.icon];
        const isRight = i % 2 === 1;
        // Asymétrie : items pairs col 1-6, items impairs col 7-12 décalés vers le bas
        const placement = isRight ? 'md:col-span-6 md:col-start-7 md:mt-16' : 'md:col-span-6 md:col-start-1';
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: ease.out, delay: (i % 2) * 0.08 }}
            className={`${placement} border-t border-[var(--color-linen)] pt-8`}
          >
            <Icon size={28} weight="duotone" className="text-[var(--color-terracotta)]" />
            <h3 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">{item.title}</h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--color-graphite)]">
              {item.body}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
