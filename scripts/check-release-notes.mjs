import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const notes = (await readFile(new URL('../RELEASE_NOTES.md', import.meta.url), 'utf8')).trim();
assert.equal(notes.split('\n')[0], `## ${manifest.version}`, 'Release notes must match the manifest version.');
assert(notes.split('\n').slice(1).join('\n').trim(), 'Release notes must describe the changes.');
assert(!/\p{Script=Han}/u.test(notes), 'Default public release notes must be English.');
console.log(`English release notes validated (${manifest.version}).`);
