import Script from 'next/script';

export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT;
  if (!domain || !src) return null;
  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}
