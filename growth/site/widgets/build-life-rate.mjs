// Ghép life-rate-core.mjs vào life-rate.template.html -> life-rate.html
// (một file tự chứa, mở được bằng file:// mà không bị chặn import module).
import { readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url);
const core = readFileSync(new URL('life-rate-core.mjs', dir), 'utf8').replace(/^export /gm, '');
const tpl = readFileSync(new URL('life-rate.template.html', dir), 'utf8');
writeFileSync(new URL('life-rate.html', dir), tpl.replace('/*CORE*/', () => core));
console.log('ok: life-rate.html');
