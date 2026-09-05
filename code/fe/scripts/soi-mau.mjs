#!/usr/bin/env node
// Soi màu viết cứng. Hai việc:
//   1. Ngoài theme/ không được có màu literal nào — mọi màu phải đi qua token.
//   2. Trong theme/Tokens.ts không được có màu nằm trong dải đỏ/cam, trừ token
//      `destructive` (tím mận, dành riêng cho xoá vĩnh viễn — ràng buộc cứng #3).
// Thoát mã 1 nếu có vi phạm.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SCAN_DIRS = ['src', 'libs'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.expo', 'theme', 'Assets', 'assets']);
const EXTS = ['.ts', '.tsx', '.js', '.jsx'];

const NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
  'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
  'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
  'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
  'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink',
  'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'floralwhite',
  'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
  'indigo', 'ivory', 'khaki', 'lavender', 'lawngreen', 'lightblue', 'lightcoral',
  'lightcyan', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
  'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta',
  'maroon', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'midnightblue',
  'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
  'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red',
  'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise',
  'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
]);

const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const FUNC = /\b(?:rgba?|hsla?)\s*\(/g;
const QUOTED = /'([^'\n]*)'|"([^"\n]*)"/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

function scanFile(file) {
  const found = [];
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    for (const m of code.matchAll(HEX)) found.push([i + 1, m[0], line.trim()]);
    for (const m of code.matchAll(FUNC)) found.push([i + 1, m[0] + '…)', line.trim()]);
    for (const m of code.matchAll(QUOTED)) {
      const value = (m[1] ?? m[2] ?? '').trim().toLowerCase();
      if (NAMED_COLORS.has(value)) found.push([i + 1, `'${value}'`, line.trim()]);
    }
  });
  return found;
}

function hueOf(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length < 6) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return null;
  const sat = max === 0 ? 0 : d / max;
  if (sat < 0.25) return null;
  let hue;
  if (max === r) hue = 60 * (((g - b) / d) % 6);
  else if (max === g) hue = 60 * ((b - r) / d + 2);
  else hue = 60 * ((r - g) / d + 4);
  return (hue + 360) % 360;
}

const isRedOrOrange = (hue) => hue !== null && (hue <= 45 || hue >= 345);

const RED_NAMES = new Set([
  'red', 'darkred', 'orange', 'darkorange', 'orangered', 'tomato', 'crimson',
  'firebrick', 'indianred', 'coral', 'lightcoral', 'salmon', 'darksalmon',
  'lightsalmon', 'gold', 'goldenrod', 'darkgoldenrod', 'chocolate', 'sienna',
  'maroon', 'brown', 'saddlebrown', 'peru', 'sandybrown', 'peachpuff',
]);

function isRedish(value) {
  const bare = value.replace(/'/g, '').toLowerCase();
  if (RED_NAMES.has(bare)) return true;
  return bare.startsWith('#') && isRedOrOrange(hueOf(bare));
}

let violations = 0;
let redViolations = 0;

console.log('== 1. Màu viết cứng ngoài theme/ ==');
for (const dir of SCAN_DIRS) {
  const base = join(ROOT, dir);
  for (const file of walk(base)) {
    for (const [line, value, src] of scanFile(file)) {
      const red = isRedish(value);
      if (red) redViolations++;
      const tag = red ? ' [ĐỎ/CAM]' : '';
      console.log(`${relative(ROOT, file).split(sep).join('/')}:${line}  ${value}${tag}  |  ${src.slice(0, 90)}`);
      violations++;
    }
  }
}
if (violations === 0) console.log('  sạch');
else console.log(`  ${violations} màu viết cứng, trong đó ${redViolations} nằm dải đỏ/cam`);

console.log('');
console.log('== 2. Token đỏ/cam trong theme/Tokens.ts ==');
let hueViolations = 0;
const tokenFile = join(ROOT, 'theme', 'Tokens.ts');
readFileSync(tokenFile, 'utf8').split(/\r?\n/).forEach((line, i) => {
  const m = line.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*'(#[0-9a-fA-F]{3,8})'/);
  if (!m) return;
  const [, name, hex] = m;
  if (name.startsWith('destructive')) return;
  if (isRedOrOrange(hueOf(hex))) {
    console.log(`theme/Tokens.ts:${i + 1}  ${name} = ${hex}  (hue ${Math.round(hueOf(hex))}° nằm trong dải đỏ/cam)`);
    hueViolations++;
  }
});
if (hueViolations === 0) console.log('  sạch — không token nào đỏ hoặc cam');

const total = violations + hueViolations;
console.log('');
console.log(`Tổng vi phạm: ${total}`);
process.exit(total === 0 ? 0 : 1);
