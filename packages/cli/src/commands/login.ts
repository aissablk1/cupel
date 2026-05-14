// Forgekit CLI — login command
import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import { config } from '../lib/config.js';
import { api } from '../lib/api.js';

export async function loginCommand(opts: { token?: string }): Promise<void> {
  let token = opts.token;
  if (!token) {
    const apiUrl = config.get('apiUrl').replace('api.', '');
    const url = `${apiUrl}/dashboard/tokens?new=cli`;
    console.log(chalk.hex('#3A3D40')(`\n→ Ouverture du dashboard : ${chalk.underline(url)}`));
    await open(url).catch(() => {});
    const answer = await inquirer.prompt<{ t: string }>([
      { type: 'password', name: 't', message: 'Colle ton token Forgekit :', mask: '·' },
    ]);
    token = answer.t.trim();
  }

  config.set('token', token);
  const me = await api.get<{ username: string; display_name: string }>('/v1/me');
  console.log(chalk.hex('#7A8471')(`\n✓ Connecté en tant que ${chalk.bold(me.username)} (${me.display_name})`));
}
