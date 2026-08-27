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

const TAGS = `    <style id="scroll-fix">
      /*
        Khối #expo-reset ở trên đặt body { overflow: hidden } vì React Native
        cho rằng màn hình tự cuộn bằng ScrollView. Ở app này 71 trên 103 màn
        không có ScrollView, nên phần nội dung vượt quá chiều cao màn hình là
        không tài nào chạm tới được — trên điện thoại càng rõ, vì thanh địa chỉ
        ăn mất một khoảng chiều cao mà bản thiết kế không tính tới.

        dvh chứ không phải vh: vh trên di động tính theo lúc thanh địa chỉ đang
        ẩn, nên vẫn thừa ra một dải khuất khi nó hiện lên.
      */
      html, body { height: auto; min-height: 100%; overflow-y: auto; }
      body { overflow-x: hidden; }
      #root { height: auto; min-height: 100vh; min-height: 100dvh; }
    </style>
    <link rel="manifest" href="/manifest.webmanifest" />
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
