import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Chỉ chạy test nguồn: `npm run build` sinh bản .js trong dist/, vitest mặc định
    // quét cả đó và chạy lặp mọi test dưới dạng đã biên dịch.
    include: ['src/**/*.test.ts'],
  },
});
