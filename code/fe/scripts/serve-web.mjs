// Phục vụ thư mục dist/ do `expo export --platform web` sinh ra.
//
// Cần một server riêng vì bản xuất tĩnh không kèm cái nào, mà mở index.html
// bằng file:// thì bundle không tải được. Dùng module có sẵn của Node, không
// thêm phụ thuộc.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT ?? 8081);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

async function resolveFile(urlPath) {
  // normalize gộp cả '..' nên chặn được đường thoát ra ngoài dist.
  const relative = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  const candidate = join(ROOT, relative);
  if (!candidate.startsWith(ROOT)) {
    return null;
  }

  const found = await stat(candidate).catch(() => null);
  if (found?.isFile()) {
    return candidate;
  }
  // Mọi đường dẫn khác về index.html: app điều hướng phía client, server không
  // biết trước có những route nào.
  return join(ROOT, 'index.html');
}

createServer((request, response) => {
  void resolveFile(request.url ?? '/').then((file) => {
    if (file === null) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    // Bản dist đặt hash vào tên file nên cache vĩnh viễn được. Ba file dưới đây
    // thì không: chúng giữ nguyên tên qua mọi lần build, mà service worker bị
    // cache lại là bản vá sau này không bao giờ tới được máy người dùng.
    const alwaysFresh = ['index.html', 'sw.js', 'manifest.webmanifest'];
    const name = file.split(/[/\\]/).pop() ?? '';

    response.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': alwaysFresh.includes(name) ? 'no-cache' : 'public, max-age=31536000',
    });
    createReadStream(file).pipe(response);
  });
}).listen(PORT, () => {
  console.log(`serving dist/ on http://localhost:${PORT}`);
});
