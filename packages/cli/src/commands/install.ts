// Forgekit CLI — install command
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';
import { request } from 'undici';
import yauzl from 'yauzl';
import { dirname } from 'node:path';
import { api } from '../lib/api.js';
import { config } from '../lib/config.js';
import { detectInstalledPlatforms, getInstallPath } from '../lib/platforms.js';
import type { Platform } from '@forgekit/shared';

interface SkillInfo {
  id: string;
  slug: string;
  name: string;
  current_version: string;
  platforms: Platform[];
  download_url: string;
  zip_sha256: string;
  signature: string;
}

export async function installCommand(
  skillSlug: string,
  opts: { platform?: Platform; version?: string },
): Promise<void> {
  const spinner = ora(`Récupération de ${chalk.bold(skillSlug)}…`).start();
  const skill = await api.get<SkillInfo>(
    `/v1/skills/${skillSlug}${opts.version ? `?version=${opts.version}` : ''}`,
  );
  spinner.succeed(`Trouvé : ${chalk.hex('#C9573B')(skill.name)} v${skill.current_version}`);

  let target: Platform;
  if (opts.platform) {
    target = opts.platform;
  } else {
    const installed = detectInstalledPlatforms();
    const candidates = installed.filter((p) => skill.platforms.includes(p));
    if (candidates.length === 0) {
      throw new Error('Aucune plateforme compatible détectée localement.');
    } else if (candidates.length === 1) {
      target = candidates[0]!;
    } else {
      const { picked } = await inquirer.prompt<{ picked: Platform }>([
        {
          type: 'list',
          name: 'picked',
          message: 'Plusieurs plateformes détectées. Cible :',
          choices: candidates,
        },
      ]);
      target = picked;
    }
  }

  const installPath = getInstallPath(target, skill.slug);
  if (existsSync(installPath)) {
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      { type: 'confirm', name: 'confirm', message: `${installPath} existe déjà. Écraser ?` },
    ]);
    if (!confirm) return;
  }
  mkdirSync(installPath, { recursive: true });

  const dl = ora(`Téléchargement…`).start();
  const res = await request(skill.download_url);
  const chunks: Buffer[] = [];
  for await (const chunk of res.body) chunks.push(Buffer.from(chunk));
  const buf = Buffer.concat(chunks);

  const sha = createHash('sha256').update(buf).digest('hex');
  if (sha !== skill.zip_sha256) {
    dl.fail('SHA-256 mismatch — installation annulée.');
    throw new Error('Integrity check failed');
  }
  dl.succeed('Téléchargé et vérifié');

  const extract = ora('Extraction…').start();
  await extractZip(buf, installPath);
  extract.succeed(`Installé dans ${installPath}`);

  const installed = config.get('installed');
  installed[skill.slug] = {
    version: skill.current_version,
    platform: target,
    installedAt: new Date().toISOString(),
  };
  config.set('installed', installed);

  await api.post('/v1/installs', {
    skill_id: skill.id,
    platform: target,
    cli_version: '0.0.1',
  }).catch(() => {});

  console.log(chalk.hex('#7A8471')(`\n✓ ${skill.slug} prêt à l'emploi`));
}

async function extractZip(buf: Buffer, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buf, { lazyEntries: true }, (err, zipFile) => {
      if (err || !zipFile) return reject(err);
      zipFile.readEntry();
      zipFile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          mkdirSync(`${dest}/${entry.fileName}`, { recursive: true });
          zipFile.readEntry();
        } else {
          zipFile.openReadStream(entry, async (err2, stream) => {
            if (err2 || !stream) return reject(err2);
            const outPath = `${dest}/${entry.fileName}`;
            mkdirSync(dirname(outPath), { recursive: true });
            await pipeline(stream, createWriteStream(outPath));
            zipFile.readEntry();
          });
        }
      });
      zipFile.on('end', resolve);
      zipFile.on('error', reject);
    });
  });
}
