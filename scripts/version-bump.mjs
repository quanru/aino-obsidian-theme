import { readFile, writeFile } from 'node:fs/promises';

const targetVersion = process.env.npm_package_version;

if (!targetVersion || !/^\d+\.\d+\.\d+$/.test(targetVersion)) {
  throw new Error('Run npm version with a semantic version such as 1.0.1.');
}

const manifestUrl = new URL('../manifest.json', import.meta.url);
const versionsUrl = new URL('../versions.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const versions = JSON.parse(await readFile(versionsUrl, 'utf8'));

manifest.version = targetVersion;
versions[targetVersion] = manifest.minAppVersion;

await Promise.all([
  writeFile(manifestUrl, `${JSON.stringify(manifest, null, '\t')}\n`),
  writeFile(versionsUrl, `${JSON.stringify(versions, null, '\t')}\n`),
]);
