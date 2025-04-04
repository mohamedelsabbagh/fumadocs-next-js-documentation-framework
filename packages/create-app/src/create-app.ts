import path from 'node:path';
import fs from 'node:fs/promises';
import { tryGitInit } from '@/git';
import { versions as localVersions } from '@/versions';
import versionPkg from '../../create-app-versions/package.json';
import type { PackageManager } from './auto-install';
import { autoInstall } from './auto-install';
import { sourceDir, cwd } from './constants';

export type Template = 'content-collections' | 'fuma-docs-mdx';

export interface Options {
  outputDir: string;
  template: Template;
  tailwindcss: boolean;
  packageManager: PackageManager;

  installDeps?: boolean;
  initializeGit?: boolean;
  eslint?: boolean;
  log?: (message: string) => void;
}

export async function create(options: Options): Promise<void> {
  const {
    installDeps = true,
    initializeGit = true,
    log = console.log,
  } = options;
  const projectName = path.basename(options.outputDir);
  const dest = path.resolve(cwd, options.outputDir);
  await copy(path.join(sourceDir, `template/+shared`), dest, (name) => {
    switch (name) {
      case 'example.gitignore':
        return '.gitignore';
      default:
        return name;
    }
  });

  await copy(path.join(sourceDir, `template/${options.template}`), dest);
  log('Configured Typescript');

  if (options.tailwindcss) {
    await copy(path.join(sourceDir, `template/+tailwindcss`), dest);
    log('Configured Tailwind CSS');
  }

  if (options.eslint) {
    await copy(path.join(sourceDir, `template/+eslint`), dest);
    log('Configured ESLint');
  }

  const packageJson = createPackageJson(projectName, options);
  await fs.writeFile(path.join(dest, 'package.json'), packageJson);

  const readMe = await getReadme(dest, projectName);
  await fs.writeFile(path.join(dest, 'README.md'), readMe);

  if (installDeps) {
    await autoInstall(options.packageManager, dest);
    log('Installed dependencies');
  }

  if (initializeGit && tryGitInit(dest)) {
    log('Initialized Git repository');
  }
}

async function getReadme(dest: string, projectName: string): Promise<string> {
  const template = await fs
    .readFile(path.join(dest, 'README.md'))
    .then((res) => res.toString());

  return `# ${projectName}\n\n${template}`;
}

async function copy(
  from: string,
  to: string,
  rename: (s: string) => string = (s) => s,
): Promise<void> {
  const stats = await fs.stat(from);

  if (stats.isDirectory()) {
    const files = await fs.readdir(from);

    await Promise.all(
      files.map((file) =>
        copy(path.join(from, file), path.join(to, rename(file))),
      ),
    );
  } else {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}

function createPackageJson(projectName: string, options: Options): string {
  const packageJson = {
    name: projectName,
    version: '0.0.0',
    private: true,
    scripts: {
      build: 'next build',
      dev: 'next dev',
      start: 'next start',
    } as Record<string, string>,
    dependencies: {
      ...pick(versionPkg.dependencies, ['next', 'react', 'react-dom']),
      ...pick(localVersions, ['fumadocs-ui', 'fumadocs-core']),
    } as Record<string, string>,
    devDependencies: pick(versionPkg.dependencies, [
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'typescript',
    ]) as Record<string, string>,
  };

  if (options.template === 'content-collections') {
    Object.assign(
      packageJson.dependencies,
      pick(versionPkg.dependencies, [
        '@content-collections/mdx',
        '@content-collections/core',
        '@content-collections/next',
      ]),
      pick(localVersions, ['@fumadocs/content-collections']),
    );
  }

  if (options.template === 'fuma-docs-mdx') {
    packageJson.scripts.postinstall = 'fumadocs-mdx';

    Object.assign(
      packageJson.dependencies,
      pick(localVersions, ['fumadocs-mdx']),
    );
    Object.assign(
      packageJson.devDependencies,
      pick(versionPkg.dependencies, ['@types/mdx']),
    );
  }

  if (options.tailwindcss) {
    Object.assign(
      packageJson.devDependencies,
      pick(versionPkg.dependencies, [
        '@tailwindcss/postcss',
        'tailwindcss',
        'postcss',
      ]),
    );
  }

  if (options.eslint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: '^8',
      'eslint-config-next': versionPkg.dependencies.next,
    };
  }

  return JSON.stringify(packageJson, undefined, 2);
}

function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result: Partial<T> = {};

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result as Pick<T, K>;
}
