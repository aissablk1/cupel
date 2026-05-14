/**
 * TokensTable — Dashboard (CLI tokens / API keys)
 */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export interface TokenRow {
  id: string;
  name: string;
  prefix: string;
  scope: 'read' | 'write' | 'admin';
  lastUsedAt: string | null;
  createdAt: string;
}

export function TokensTable({ rows }: { rows: TokenRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-[var(--color-linen)] rounded-[4px] p-12 text-center">
        <p className="text-[var(--color-graphite)]">Aucun token actif. Créez-en un pour vous connecter via le CLI.</p>
      </div>
    );
  }
  return (
    <div className="border border-[var(--color-linen)] rounded-[4px] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-linen)] bg-[var(--color-mist)]">
            <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--color-graphite)] font-medium">Nom</th>
            <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--color-graphite)] font-medium">Token</th>
            <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-[var(--color-graphite)] font-medium">Portée</th>
            <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--color-graphite)] font-medium">Dernière utilisation</th>
            <th className="text-right px-6 py-3 text-xs uppercase tracking-wider text-[var(--color-graphite)] font-medium">Créé le</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-[var(--color-linen)] last:border-0">
              <td className="px-6 py-4 font-medium">{t.name}</td>
              <td className="px-6 py-4 font-mono text-xs text-[var(--color-graphite)]">{t.prefix}••••••••</td>
              <td className="px-6 py-4">
                <Badge variant={t.scope === 'admin' ? 'danger' : t.scope === 'write' ? 'accent' : 'outline'}>
                  {t.scope}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right text-[var(--color-graphite)]">
                {t.lastUsedAt ? formatDate(t.lastUsedAt) : 'Jamais'}
              </td>
              <td className="px-6 py-4 text-right text-[var(--color-graphite)]">{formatDate(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
