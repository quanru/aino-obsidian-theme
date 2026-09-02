import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const versions = JSON.parse(await readFile(new URL('../versions.json', import.meta.url), 'utf8'));
const css = await readFile(new URL('../theme.css', import.meta.url), 'utf8');

const requiredManifestFields = ['name', 'author', 'version', 'minAppVersion'];
const errors = [];

for (const field of requiredManifestFields) {
  if (typeof manifest[field] !== 'string' || manifest[field].trim() === '') {
    errors.push(`manifest.json is missing a valid ${field}`);
  }
}

if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  errors.push('manifest version must use x.y.z');
}

if (versions[manifest.version] !== manifest.minAppVersion) {
  errors.push('versions.json must map the current theme version to minAppVersion');
}

for (const forbidden of ['!important', ':has(', 'http://', 'https://', '@import']) {
  if (css.includes(forbidden)) {
    errors.push(`theme.css contains forbidden text: ${forbidden}`);
  }
}

for (const requiredColor of ['#f4efe7', '#fffdf9', '#a87bb2', '#834691', '#161c22', '#222a33', '#b272c0']) {
  if (!css.includes(requiredColor)) {
    errors.push(`theme.css is missing canonical Aino color ${requiredColor}`);
  }
}

if (!css.includes('.theme-light') || !css.includes('.theme-dark')) {
  errors.push('theme.css must support both light and dark modes');
}

if (
  !css.includes('.workspace-split.mod-root .workspace-tab-header {') ||
  !css.includes('.workspace-split.mod-root .workspace-tab-header.is-active {')
) {
  errors.push('workspace tab motion and active styling must be scoped to the root editor split');
}

if (/^\.workspace-tab-header(?:\.is-active)?\s*\{/m.test(css)) {
  errors.push('workspace tab styling must not target sidebar icon tabs globally');
}

if (!css.includes(':not(input, textarea, select):focus-visible')) {
  errors.push('form controls must use the host focus ring without an additional theme outline');
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Aino theme contract passed (${manifest.version}, Obsidian ${manifest.minAppVersion}+).`);
}
