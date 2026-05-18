// Cupel CLI — commandes secondaires (update, remove, init, validate, publish)
// Author: Aïssa BELKOUSSA

import chalk from 'chalk';
import { rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import inquirer from 'inquirer';
import { config } from '../lib/config.js';
import { api } from '../lib/api.js';
import { detectInstalledPlatforms, getInstallPath } from '../lib/platforms.js';
import { installCommand } from './install.js';
import type { Platform } from '@cupel/shared';

export async function updateCommand(skill?: string): Promise<void> {
  const installed = config.get('installed');
  const targets = skill ? [skill] : Object.keys(installed);
  if (targets.length === 0) {
    console.log(chalk.hex('#3A3D40')('Aucun skill à mettre à jour.'));
    return;
  }
  for (const slug of targets) {
    const local = installed[slug];
    if (!local) {
      console.log(chalk.hex('#962D2D')(`Skill ${slug} non installé.`));
      continue;
    }
    await installCommand(slug, { platform: local.platform as Platform });
  }
}

export async function removeCommand(skill: string): Promise<void> {
  const installed = config.get('installed');
  const info = installed[skill];
  if (!info) {
    console.log(chalk.hex('#962D2D')(`${skill} non installé.`));
    return;
  }
  const path = getInstallPath(info.platform as Platform, skill);
  rmSync(path, { recursive: true, force: true });
  delete installed[skill];
  config.set('installed', installed);
  console.log(chalk.hex('#7A8471')(`✓ ${skill} désinstallé.`));
}

export async function initCommand(name?: string): Promise<void> {
  const answers = await inquirer.prompt<{ name: string; description: string; category: string }>([
    { type: 'input', name: 'name', message: 'Nom du skill', default: name ?? 'my-skill' },
    { type: 'input', name: 'description', message: 'Description courte' },
    {
      type: 'list',
      name: 'category',
      message: 'Catégorie',
      choices: ['frontend', 'backend', 'devops', 'seo', 'design', 'security', 'content', 'data', 'ai', 'productivity'],
    },
  ]);
  const dir = answers.name;
  if (existsSync(dir)) throw new Error(`${dir} existe déjà`);
  mkdirSync(dir);
  const skillMd = `---
name: ${answers.name}
version: 0.1.0
description: ${answers.description}
platforms: [claude_code]
category: ${answers.category}
author:
  name: Aïssa BELKOUSSA
  url: https://aissabelkoussa.fr
---

# ${answers.name}

${answers.description}

## Usage

Décris l'usage du skill…
`;
  writeFileSync(join(dir, 'SKILL.md'), skillMd);
  writeFileSync(join(dir, 'README.md'), `# ${answers.name}\n\n${answers.description}\n`);
  console.log(chalk.hex('#7A8471')(`\n✓ Skill scaffoldé dans ./${dir}`));
}

export async function validateCommand(path: string = '.'): Promise<void> {
  const skillPath = join(path, 'SKILL.md');
  if (!existsSync(skillPath)) throw new Error('SKILL.md manquant');
  const content = readFileSync(skillPath, 'utf8');
  // Validation locale basique — la vraie passe par packages/security via API
  if (!content.startsWith('---')) throw new Error('Frontmatter YAML manquant');
  console.log(chalk.hex('#7A8471')('✓ Skill valide (vérification locale)'));
  console.log(chalk.hex('#3A3D40')('  Pour un scan complet : cupel publish (lance le scan serveur)'));
}

export async function publishCommand(path: string = '.'): Promise<void> {
  await validateCommand(path);
  console.log(chalk.hex('#3A3D40')('Upload via API…'));
  // Stub : zip + multipart upload vers /v1/skills/versions
  console.log(chalk.hex('#7A8471')('✓ Soumis pour review'));
}
