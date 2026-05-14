/**
 * CLI onboarding — /[locale]/cli
 * Direction : Editorial Premium — terminal sombre, terracotta sur commandes
 * Author: Aïssa BELKOUSSA
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommandBlock } from '@/components/cli/command-block';
import { Separator } from '@/components/ui/separator';

export default async function CliPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('cli');

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-16 md:px-16">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Forgekit CLI
          </p>
          <h1 className="mt-4 font-display text-6xl tracking-tight leading-[0.98]">
            {t('title')}
          </h1>
        </div>
        <p className="md:col-span-4 md:pt-12 text-xl text-[var(--color-graphite)]">
          {t('lede')}
        </p>
      </header>

      <Separator className="my-16" />

      {/* Étape 1 : installer */}
      <section className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-mono text-xs text-[var(--color-graphite)]">01</p>
          <h2 className="font-display text-3xl mt-2">{t('step_install')}</h2>
          <p className="mt-3 text-[var(--color-graphite)]">
            Détection automatique de l'OS. Binaire signé, hors npm global.
          </p>
        </div>
        <div className="md:col-span-8">
          <Tabs defaultValue="macos">
            <TabsList>
              <TabsTrigger value="macos">{t('tab_macos')}</TabsTrigger>
              <TabsTrigger value="linux">{t('tab_linux')}</TabsTrigger>
              <TabsTrigger value="windows">{t('tab_windows')}</TabsTrigger>
            </TabsList>
            <TabsContent value="macos">
              <CommandBlock command="brew install forgekit/tap/forgekit" label="Homebrew" />
            </TabsContent>
            <TabsContent value="linux">
              <CommandBlock
                command="curl -fsSL https://get.forgekit.io | bash"
                label="Script d'installation"
              />
            </TabsContent>
            <TabsContent value="windows">
              <CommandBlock command="winget install Forgekit.CLI" label="winget" />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Separator className="my-16" />

      {/* Étape 2 : login */}
      <section className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-mono text-xs text-[var(--color-graphite)]">02</p>
          <h2 className="font-display text-3xl mt-2">{t('step_login')}</h2>
          <p className="mt-3 text-[var(--color-graphite)]">
            OAuth navigateur. Aucun token à copier-coller.
          </p>
        </div>
        <div className="md:col-span-8 flex flex-col gap-4">
          <CommandBlock command="forgekit login" label="Authentification" />
          <p className="text-sm text-[var(--color-graphite)]">
            Vous pouvez aussi gérer vos tokens depuis{' '}
            <Link href={`/${locale}/dashboard/tokens`} className="link-editorial">
              le tableau de bord
            </Link>
            .
          </p>
        </div>
      </section>

      <Separator className="my-16" />

      {/* Étape 3 : usage */}
      <section className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-mono text-xs text-[var(--color-graphite)]">03</p>
          <h2 className="font-display text-3xl mt-2">{t('step_use')}</h2>
          <p className="mt-3 text-[var(--color-graphite)]">
            Installation atomique, mises à jour gérées, désinstallation propre.
          </p>
        </div>
        <div className="md:col-span-8 flex flex-col gap-4">
          <CommandBlock command="forgekit search react" label="Rechercher" />
          <CommandBlock command="forgekit install superpowers" label="Installer" />
          <CommandBlock command="forgekit update --all" label="Mettre à jour" />
          <CommandBlock command="forgekit publish ./my-skill" label="Publier" />
        </div>
      </section>
    </div>
  );
}
