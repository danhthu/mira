// Sinh icon PWA từ assets/adaptive-icon.png (1024×1024).
//
// Chạy lại khi đổi icon gốc: node scripts/make-pwa-icons.mjs
// Kết quả nằm trong public/, và `expo export --platform web` chép nguyên
// thư mục đó sang dist/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets', 'adaptive-icon.png');
const OUT_DIR = join(ROOT, 'public');
const SIZES = [192, 512];

/**
 * Thu nhỏ bằng cách lấy trung bình cả ô nguồn ứng với mỗi điểm ảnh đích.
 * Lấy mẫu điểm đơn thuần sẽ làm viền icon răng cưa ở cỡ 192.
 */
function downscale(source, size) {
  const out = new PNG({ width: size, height: size });
  const scaleX = source.width / size;
  const scaleY = source.height / size;

  for (let y = 0; y < size; y += 1) {
    const y0 = Math.floor(y * scaleY);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * scaleY));

    for (let x = 0; x < size; x += 1) {
      const x0 = Math.floor(x * scaleX);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * scaleX));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (sy * source.width + sx) * 4;
          r += source.data[i];
          g += source.data[i + 1];
          b += source.data[i + 2];
          a += source.data[i + 3];
          count += 1;
        }
      }

      const o = (y * size + x) * 4;
      out.data[o] = Math.round(r / count);
      out.data[o + 1] = Math.round(g / count);
      out.data[o + 2] = Math.round(b / count);
      out.data[o + 3] = Math.round(a / count);
    }
  }

  return out;
}

const source = PNG.sync.read(readFileSync(SOURCE));
mkdirSync(OUT_DIR, { recursive: true });

for (const size of SIZES) {
  const file = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, PNG.sync.write(downscale(source, size)));
  console.log(`icon-${size}.png (${size}x${size})`);
}
