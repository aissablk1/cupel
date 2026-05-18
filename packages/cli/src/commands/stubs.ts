// Cupel CLI — placeholders pour commandes secondaires
// (à étoffer ultérieurement)
import chalk from 'chalk';
import { config } from '../lib/config.js';
import { api } from '../lib/api.js';
import { detectInstalledPlatforms } from '../lib/platforms.js';

export async function logoutCommand(): Promise<void> {
  config.delete('token');
  console.log(chalk.hex('#7A8471')('✓ Déconnecté.'));
}

export async function whoamiCommand(): Promise<void> {
  if (!config.get('token')) {
    console.log(chalk.hex('#3A3D40')('Non connecté — lance `cupel login`'));
    return;
  }
  const me = await api.get<{ username: string; display_name: string }>('/v1/me');
  console.log(`${chalk.hex('#C9573B')(me.username)} — ${me.display_name}`);
}

export async function listCommand(): Promise<void> {
  const installed = config.get('installed');
  const entries = Object.entries(installed);
  if (entries.length === 0) {
    console.log(chalk.hex('#3A3D40')('Aucun skill installé.'));
    return;
  }
  console.log(chalk.hex('#3A3D40')('\nSkills installés :\n'));
  for (const [slug, info] of entries) {
    console.log(`  ${chalk.hex('#C9573B')(slug)}@${info.version}  ${chalk.hex('#7A8471')(info.platform)}`);
  }
}

export async function doctorCommand(): Promise<void> {
  console.log(chalk.hex('#3A3D40')('\nDiagnostic environnement\n'));
  const platforms = detectInstalledPlatforms();
  console.log(`  Plateformes détectées : ${platforms.length > 0 ? platforms.join(', ') : chalk.hex('#962D2D')('aucune')}`);
  console.log(`  Auth : ${config.get('token') ? chalk.hex('#7A8471')('OK') : chalk.hex('#962D2D')('non')}`);
  console.log(`  API : ${config.get('apiUrl')}`);
  console.log(`  Node : ${process.version}`);
  console.log(`  Plateforme système : ${process.platform} ${process.arch}`);
}
