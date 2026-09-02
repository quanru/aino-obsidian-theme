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
  !css.includes('.workspace-split.mod-root .workspace-tab-header.is-active {') ||
  !css.includes('transition: none;')
) {
  errors.push('workspace tab styling must be scoped to the root editor split without color transitions');
}

if (/^\.workspace-tab-header(?:\.is-active)?\s*\{/m.test(css)) {
  errors.push('workspace tab styling must not target sidebar icon tabs globally');
}

if (
  !css.includes('.workspace-split.mod-sidedock .workspace-tab-header-container,') ||
  !css.includes('.workspace-split.mod-sidedock .workspace-tab-container {') ||
  !css.includes('.workspace-split.mod-root .workspace-tab-header-container {') ||
  !css.includes(
    'background-image: linear-gradient(var(--tab-container-background), var(--tab-container-background));',
  ) ||
  !css.includes('background-image: linear-gradient(var(--background-primary), var(--background-primary));')
) {
  errors.push('workspace tab surfaces must remain opaque and consistent when window translucency is enabled');
}

if (
  !css.includes('.workspace-ribbon.mod-left,') ||
  !css.includes('.workspace-ribbon.mod-left::before,') ||
  !css.includes('.workspace-split.mod-left-split .workspace-sidedock-vault-profile {') ||
  !css.includes('background-image: linear-gradient(var(--background-secondary), var(--background-secondary));')
) {
  errors.push('left ribbon, its titlebar extension, and vault profile must share the sidebar surface color');
}

if (
  !css.includes('.workspace-split.mod-left-split > .workspace-tabs.mod-top .workspace-tab-header {') ||
  !css.includes(
    '.workspace-split.mod-left-split > .workspace-tabs.mod-top .workspace-tab-header.is-active {',
  ) ||
  !css.includes('background-color: var(--aino-accent-soft);') ||
  !css.includes('box-shadow: inset 0 0 0 1px var(--aino-accent-primary);')
) {
  errors.push('the active top-left page icon must keep an immediate accent highlight');
}

if (
  !css.includes(".workspace-split.mod-root .workspace-tab-header[style*='opacity: 0'] {") ||
  !css.includes('visibility: hidden;')
) {
  errors.push('closing workspace tabs must stop painting while the host animates their width');
}

if (!css.includes('.suggestion-item {\n  transition: none;\n}')) {
  errors.push('ephemeral search suggestions must not retain theme transitions after dismissal');
}

if (
  !css.includes('.theme-light .tooltip {') ||
  !css.includes('--background-modifier-message: var(--aino-text-primary);') ||
  !css.includes('--text-on-accent: var(--aino-surface-elevated);')
) {
  errors.push('light theme tooltips must keep a high-contrast text and background pairing');
}

if (
  !css.includes('--aino-text-muted: #8795a1;') ||
  !css.includes('body.theme-dark :is(button.is-primary, button.mod-cta) {') ||
  !css.includes('body.theme-dark button.is-active[title] {')
) {
  errors.push('dark theme controls and faint text must retain accessible contrast');
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
