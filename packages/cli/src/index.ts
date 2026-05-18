// Cupel CLI — entrypoint
// Author: Aïssa BELKOUSSA

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { searchCommand } from './commands/search.js';
import { installCommand } from './commands/install.js';
import { updateCommand } from './commands/update.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';
import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { publishCommand } from './commands/publish.js';
import { doctorCommand } from './commands/doctor.js';

const VERSION = '0.1.0';

function banner(): void {
  // Palette de la coupelle — cendre chaude + or révélé
  console.log(
    chalk.hex('#C9573B').bold('\n  cupel') +
      chalk.hex('#7A8471')(` v${VERSION}`) +
      chalk.hex('#3A3D40')('  — révèle le pur sous l\'impur\n'),
  );
}

export { doctorCommand };

export async function runDoctor(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name('cupel')
    .description('Cupel — audit local des skills IA (Claude Code, Cursor, Codex, Windsurf, Gemini, Continue). Sépare le métal pur des impuretés.')
    .version(VERSION)
    .option('-p, --path <dir>', 'Scanner aussi les skills d\'un projet (défaut: cwd)')
    .option('--json', 'Sortie JSON pour CI / pipe')
    .option('--strict', 'Exit code 2 si au moins un skill en tier danger')
    .option('-v, --verbose', 'Afficher tous les signaux, même sur les skills sûrs')
    .action((opts) => doctorCommand(opts));

  await program.parseAsync(argv).catch((err: unknown) => {
    console.error(chalk.hex('#962D2D')('\n✗ ' + (err instanceof Error ? err.message : String(err))));
    process.exit(1);
  });
}

export function run(argv: string[]): void {
  const program = new Command();
  program
    .name('cupel')
    .description('Cupel — audit & marketplace de skills IA (Claude Code, Cursor, Codex)')
    .version(VERSION)
    .hook('preAction', () => banner());

  program
    .command('login')
    .description('Authentifier le CLI via un token')
    .option('-t, --token <token>', 'Token directement (sinon : prompt)')
    .action(loginCommand);

  program.command('logout').description('Effacer le token local').action(logoutCommand);
  program.command('whoami').description('Afficher l\'utilisateur connecté').action(whoamiCommand);

  program
    .command('search <query>')
    .description('Rechercher un skill')
    .option('-c, --category <cat>', 'Filtrer par catégorie')
    .option('-p, --platform <platform>', 'Filtrer par plateforme')
    .action(searchCommand);

  program
    .command('install <skill>')
    .description('Installer un skill (auto-détection plateforme)')
    .option('-p, --platform <platform>', 'Forcer une plateforme cible')
    .option('-v, --version <version>', 'Version précise (défaut: latest)')
    .action(installCommand);

  program
    .command('update [skill]')
    .description('Mettre à jour un skill ou tous les skills')
    .action(updateCommand);

  program.command('list').alias('ls').description('Lister les skills installés').action(listCommand);

  program
    .command('remove <skill>')
    .alias('rm')
    .description('Désinstaller un skill')
    .action(removeCommand);

  program
    .command('init [name]')
    .description('Scaffolder un nouveau skill')
    .action(initCommand);

  program
    .command('validate [path]')
    .description('Valider un skill local (sécurité + manifest)')
    .action(validateCommand);

  program
    .command('publish [path]')
    .description('Publier un skill sur le marketplace')
    .action(publishCommand);

  program
    .command('doctor')
    .description('Audit local des skills installés (risque, signature, fraîcheur)')
    .option('-p, --path <dir>', 'Scanner aussi les skills d\'un projet (défaut: cwd)')
    .option('--json', 'Sortie JSON pour CI / pipe')
    .option('--strict', 'Exit code 2 si au moins un skill en tier danger')
    .option('-v, --verbose', 'Afficher tous les signaux, même sur les skills sûrs')
    .action(doctorCommand);

  program.parseAsync(argv).catch((err: unknown) => {
    console.error(chalk.hex('#962D2D')('\n✗ ' + (err instanceof Error ? err.message : String(err))));
    process.exit(1);
  });
}
