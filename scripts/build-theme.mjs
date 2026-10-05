import { readFile, writeFile } from 'node:fs/promises';

export async function assembleTheme() {
  const sources = await Promise.all(
    ['palette', 'interface', 'controls'].map((name) =>
      readFile(new URL(`../src/${name}.css`, import.meta.url), 'utf8'),
    ),
  );
  return `/* @size-limit-exempt: generated from src/palette.css, src/interface.css and src/controls.css. */\n\n${sources.map((source) => source.trimEnd()).join('\n\n')}\n`;
}

if (process.argv.includes('--write')) {
  await writeFile(new URL('../theme.css', import.meta.url), await assembleTheme());
}
