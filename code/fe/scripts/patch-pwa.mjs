// Nhét phần khai báo PWA vào dist/index.html sau khi export.
//
// Phải làm ở bước riêng vì dự án không dùng expo-router, nên không có +html.tsx
// để tự chỉnh <head>. Chạy lại sau mỗi lần export — script tự nhận ra bản đã vá
// rồi thì thôi, không nhét chồng.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const INDEX = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist', 'index.html');
const MARKER = 'rel="manifest"';

const TAGS = `    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="DailyOps" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    </script>
`;

const html = readFileSync(INDEX, 'utf8');

if (html.includes(MARKER)) {
  console.log('index.html đã có khai báo PWA, bỏ qua');
} else {
  writeFileSync(INDEX, html.replace('</head>', `${TAGS}  </head>`), 'utf8');
  console.log('đã thêm manifest, theme-color và đăng ký service worker vào index.html');
}
