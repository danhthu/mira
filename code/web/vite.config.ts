import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Mã của lần build này, nhét vào tên file asset.
 *
 * VÌ SAO KHÔNG ĐỂ VÂN TAY NỘI DUNG LÀM MỘT MÌNH
 *
 * Cloudflare phục vụ app theo kiểu SPA: đường dẫn nào không có thật thì trả về
 * `index.html`, kèm mã 200. Mà `_headers` lại đặt `/assets/*` là `immutable,
 * max-age=1 năm`.
 *
 * Hai thứ đó gặp nhau thành bẫy: trong khoảnh khắc giữa lúc wrangler đẩy file lên và lúc
 * bản kê file được lật, một yêu cầu `/assets/index-ABC.js` sẽ rơi vào nhánh "không thấy"
 * và nhận `index.html`. Biên Cloudflare cache **bản HTML sai ấy dưới đúng tên file JS**,
 * ghim một năm. Trình duyệt nhận HTML ở chỗ chờ một module, từ chối chạy, và app trắng
 * màn hình. Chuyện này đã xảy ra thật ngày 25/11/2026.
 *
 * Chỗ chết người là **không thoát ra được bằng cách deploy lại**: cùng mã nguồn thì vân
 * tay nội dung không đổi, tên file không đổi, và yêu cầu lại rơi vào đúng bản cache hỏng.
 *
 * Thêm mã lần build vào tên file thì mỗi lần deploy là một bộ URL mới. Đổi lại: deploy
 * lại cùng mã nguồn vẫn sinh file mới, tức là mất một chút lợi ích cache cho người dùng
 * cũ. Đánh đổi đó rẻ hơn hẳn một màn hình trắng không có đường lui.
 */
const maBuild = Date.now().toString(36);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mira/contract': fileURLToPath(new URL('../contract/src/index.ts', import.meta.url)),
      '@mira/api-client': fileURLToPath(new URL('../api-client/src/index.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${maBuild}-[hash].js`,
        chunkFileNames: `assets/[name]-${maBuild}-[hash].js`,
        assetFileNames: `assets/[name]-${maBuild}-[hash].[ext]`,
      },
    },
  },
  server: {
    port: 5173,
  },
});
