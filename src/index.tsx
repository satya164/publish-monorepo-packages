import path from 'path';
import fs from 'fs-extra';
import spawn from 'cross-spawn';
import tempy from 'tempy';
import ora from 'ora';
import decompress from 'decompress';
import decompressTargz from 'decompress-targz';
import pacote from 'pacote';
import isGitDirty from 'is-git-dirty';
import { WorkspacePackages } from './types';

export async function publish() {
  const root = process.cwd();

  if (isGitDirty(root)) {
    throw new Error(
      'The working directory is dirty. Please commit all changes before publishing.'
    );
  }

  const info = await new Promise<WorkspacePackages>((resolve, reject) => {
    const child = spawn('yarn', ['workspaces', 'info'], { cwd: root });

    child.stdout?.on('data', (data: Buffer) => {
      // The first output is the version which don't need
      if (data.toString().startsWith('yarn workspaces v')) {
        return;
      }

      try {
        resolve(JSON.parse(data.toString()));
      } catch (e) {
        reject(e);
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      reject(new Error(data.toString()));
    });
  });

  // Get dependencies of packages and filter out any private packages
  const packages = (
    await Promise.all(
      Object.entries(info).map(async ([name, { location }]) => {
        const packageJSON = JSON.parse(
          await fs.readFile(path.join(root, location, 'package.json'), 'utf8')
        );

        if (packageJSON.private) {
          return;
        }

        return {
          name,
          version: packageJSON.version,
          dependencies: Object.keys({
            ...packageJSON.devDependencies,
            ...packageJSON.peerDependencies,
            ...packageJSON.optionalDependencies,
            ...packageJSON.dependencies,
          }).filter((p) => p in info),
        };
      })
    )
  ).filter(Boolean) as {
    name: string;
    version: string;
    dependencies: string[];
  }[];

  const dependencies = Object.keys(info).reduce<Record<string, string[]>>(
    (acc, name) => {
      const getDependencies = (name: string): string[] => {
        const workspaceDependencies =
          packages.find((p) => p.name === name)?.dependencies ?? [];

        // We need to recursively get the dependencies of the packages
        return workspaceDependencies.concat(
          ...workspaceDependencies.map(getDependencies)
        );
      };

      return Object.assign(acc, {
        [name]: getDependencies(name),
      });
    },
    {}
  );

  // Determine the order of packages based on their dependencies
  packages.sort((a, b) => {
    if (dependencies[a.name].includes(b.name)) {
      return 1;
    }

    if (dependencies[b.name].includes(a.name)) {
      return -1;
    }

    return a.name.localeCompare(b.name);
  });

  const cache = tempy.directory();
  const packedDir = path.join(cache, 'packed');
  const fetchedDir = path.join(cache, 'fetched');

  console.log(cache);

  const packing = ora('Packing workspace packages').start();

  await fs.mkdirp(packedDir);

  // Pack tarballs for each package
  for (const pack of packages) {
    packing.text = `Building files for ${pack.name}`;

    await new Promise<void>((resolve, reject) => {
      const child = spawn('npm', ['pack', '--quiet'], {
        cwd: path.join(root, info[pack.name].location),
        stdio: 'ignore',
      });

      child.stderr?.on('data', function (data: Buffer) {
        reject(new Error(data.toString()));
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with exit code ${code}`));
        }
      });
    });

    const tgz = path.join(
      root,
      info[pack.name].location,
      `${pack.name.replace(/^@/, '').replace(/\//g, '-')}-${pack.version}.tgz`
    );

    await decompress(tgz, path.join(packedDir, pack.name), {
      plugins: [decompressTargz()],
    });

    await fs.unlink(tgz);
  }

  packing.succeed('Finished building files');

  const fetching = ora('Fetching packages for latest versions').start();

  await Promise.all(
    packages.map((pack) =>
      pacote.extract(pack.name, path.join(fetchedDir, pack.name))
    )
  );

  fetching.succeed('Finished fetching packages');
}
