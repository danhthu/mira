import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/tokens.css';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Không tìm thấy #root trong index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Đăng ký service worker.
 *
 * Nó CỐ TÌNH không cache gì — xem đầu file `public/sw.js`. Việc của nó là làm Mira thành
 * một PWA cài được, để iPhone "Thêm vào màn hình chính" ra một app thật.
 *
 * Đăng ký SAU khi trang tải xong: làm trước thì nó giành băng thông với chính mã của app
 * trong lần mở đầu tiên — lần quan trọng nhất.
 *
 * Hỏng thì BỎ QUA LẶNG LẼ. Không có service worker thì Mira vẫn chạy đủ; ném lỗi ra màn
 * hình vì một thứ phụ trợ là làm hỏng lần mở app vì chuyện không đáng.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* không sao — app không phụ thuộc vào nó */
    });
  });
}
