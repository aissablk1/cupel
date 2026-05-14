import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Forgekit', template: '%s — Forgekit' },
  description: 'Le marketplace des skills IA pour devs pro.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  authors: [{ name: 'Aïssa BELKOUSSA', url: 'https://aissabelkoussa.fr' }],
  creator: 'Aïssa BELKOUSSA',
  openGraph: {
    type: 'website',
    title: 'Forgekit — Le marketplace des skills IA',
    description: 'Découvrez, installez et vendez des skills Claude Code, Cursor et Codex.',
    locale: 'fr_FR',
    alternateLocale: ['en_US'],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
