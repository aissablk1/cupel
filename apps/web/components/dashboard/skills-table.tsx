/**
 * SkillsTable — Dashboard
 * Table éditoriale Stripe-like.
 */
import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';

export interface SkillRow {
  id: string;
  slug: string;
  name: string;
  platform: string;
  status: 'published' | 'draft' | 'review';
  installs: number;
  revenueCents: number;
  updatedAt: string;
}

const statusLabel: Record<SkillRow['status'], { label: string; variant: 'success' | 'default' | 'gold' }> = {
  published: { label: 'Publié', variant: 'success' },
  draft: { label: 'Brouillon', variant: 'default' },
  review: { label: 'En revue', variant: 'gold' },
};

export function SkillsTable({ rows }: { rows: SkillRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-[var(--color-linen)] rounded-[4px] p-12 text-center">
        <p className="text-[var(--color-graphite)]">Aucun skill publié pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="border border-[var(--color-linen)] rounded-[4px] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-linen)] bg-[var(--color-mist)]">
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Skill</th>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Plateforme</th>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Statut</th>
            <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Installs</th>
            <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Revenu</th>
            <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider text-[var(--color-graphite)]">Mis à jour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = statusLabel[r.status];
            return (
              <tr
                key={r.id}
                className="border-b border-[var(--color-linen)] last:border-0 hover:bg-[var(--color-mist)]/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/creator/skills/${r.slug}`}
                    className="link-editorial font-medium"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[var(--color-graphite)] font-mono text-xs">{r.platform}</td>
                <td className="px-6 py-4"><Badge variant={s.variant}>{s.label}</Badge></td>
                <td className="px-6 py-4 text-right font-mono">{r.installs.toLocaleString('fr-FR')}</td>
                <td className="px-6 py-4 text-right font-mono">{formatPrice(r.revenueCents)}</td>
                <td className="px-6 py-4 text-right text-[var(--color-graphite)]">{formatDate(r.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
