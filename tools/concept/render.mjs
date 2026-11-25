// Dựng concept: HTML -> PNG bằng Chrome headless có sẵn trên máy.
// Dùng Chrome thay vì tự vẽ SVG vì engine layout lo phần xuống dòng, canh lề,
// đổ bóng và font — ba thứ mà toạ độ SVG viết tay luôn sai khi đổi nội dung.
//
//   node tools/concept/render.mjs                 # dựng mọi .html trong html/
//   node tools/concept/render.mjs ba-tru          # dựng một file
//
// Ảnh ra: docs/concept/<tên>.png

import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HTML_DIR = join(HERE, 'html');
const OUT_DIR = resolve(HERE, '../../docs/concept');
const SCALE = 3;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    try {
      statSync(p);
      return p;
    } catch {}
  }
  throw new Error('Không tìm thấy Chrome hoặc Edge trong các đường dẫn quen thuộc.');
}

// Kích thước khung lấy từ data-w/data-h trên <body>, không đoán theo nội dung:
// Chrome headless chụp đúng cửa sổ, nên trang phải tự khai nó to bao nhiêu.
function readSize(file) {
  const html = readFileSync(file, 'utf8');
  const w = html.match(/data-w="(\d+)"/);
  const h = html.match(/data-h="(\d+)"/);
  if (!w || !h) throw new Error(`${basename(file)}: thiếu data-w / data-h trên <body>`);
  return { w: Number(w[1]), h: Number(h[1]) };
}

const chrome = findChrome();
mkdirSync(OUT_DIR, { recursive: true });

const only = process.argv[2];
const files = readdirSync(HTML_DIR)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !only || basename(f, '.html') === only);

if (files.length === 0) {
  console.error(only ? `Không có html/${only}.html` : 'Không có file .html nào trong html/');
  process.exit(1);
}

for (const f of files) {
  const src = join(HTML_DIR, f);
  const { w, h } = readSize(src);
  const out = join(OUT_DIR, basename(f, '.html') + '.png');

  execFileSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${w},${h}`,
      `--screenshot=${out}`,
      pathToFileURL(src).href,
    ],
    { stdio: 'pipe' },
  );

  console.log(`✓ ${basename(out)}  ${w * SCALE}×${h * SCALE}`);
}
