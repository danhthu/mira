// Kiểm cú pháp script inline của life-rate.html.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const html = readFileSync(new URL('./life-rate.html', import.meta.url), 'utf8');
const s = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const f = join(mkdtempSync(join(tmpdir(), 'lr-')), 'inline.mjs');
writeFileSync(f, s);
execFileSync(process.execPath, ['--check', f]);
console.log('syntax-ok');
