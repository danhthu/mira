import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Bắt test ở mọi tầng, không riêng core/ — glob cũ chặn im lặng mọi file
    // test viết ngoài src/core/__tests__, khiến test mới tưởng pass mà thật ra không chạy.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    // Dùng fileURLToPath chứ không lấy .pathname: trên Windows .pathname trả về
    // '/D:/...' (thừa dấu gạch đầu), nên mọi test import qua '@/' đều không
    // resolve được. Chưa lộ vì các test hiện có đều import tương đối.
    // .href để truyền chuỗi: kiểu URL toàn cục và URL của node:url không khớp nhau.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url).href) },
  },
});
