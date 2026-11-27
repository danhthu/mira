/**
 * Service worker của Mira — CỐ TÌNH KHÔNG CACHE GÌ CẢ.
 *
 * ──────────────────────────── VÌ SAO KHÔNG CACHE ────────────────────────────
 *
 * Ngày 25/11/2026, bản web chết trắng màn hình: biên Cloudflare ghim một file HTML
 * 404-fallback dưới một URL .js, kèm `immutable` một năm. Phải đổi cách đặt tên file
 * theo mã build mới thoát ra được, vì đẩy lại đúng mã nguồn cũ không xoá nổi bản ghim.
 *
 * Service worker mà cache sai thì còn tệ hơn nhiều: cache biên thì còn `Cache-Control`
 * trị được, chứ cache của service worker nằm TRONG máy người dùng, sống qua mọi lần tải
 * lại, và cách duy nhất để xoá là chính service worker tự xoá. Nếu nó đã hỏng thì nó
 * không tự xoá được nữa. Người dùng cầm một cái app chết trắng và không ai với tới.
 *
 * Mira cũng chẳng dùng được khi mất mạng — mọi con số đều nằm ở máy chủ. Cache để đổi
 * lấy cái gì? Không gì cả. Nên: không cache.
 *
 * ──────────────────────────── VẬY NÓ ĐỂ LÀM GÌ ────────────────────────────
 *
 * Hai việc, cả hai đều không cần cache:
 *
 *   1. Đủ điều kiện để trình duyệt coi đây là một PWA cài được. iPhone cần thế để
 *      "Thêm vào màn hình chính" ra một app thật, không phải một lối tắt Safari.
 *   2. Chỗ sẽ đặt bộ nhận thông báo đẩy, KHI NÀO làm tới. Hôm nay chưa có — và chừng
 *      nào chưa có thật thì màn Thiết lập nhắc vẫn phải nói thẳng là "không phải thông
 *      báo đẩy".
 *
 * Đổi `PHIEN_BAN` để ép mọi máy nạp lại bản mới.
 */
const PHIEN_BAN = '2026-11-25.1';

self.addEventListener('install', () => {
  // Không chờ bản cũ đóng: bản mới lên ngay. An toàn vì không có cache nào để lỡ dở.
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      // Dọn SẠCH mọi cache, kể cả cache do một bản service worker cũ nào đó để lại.
      // Đây là van an toàn: nếu có ai từng thêm cache rồi gỡ đi, máy người dùng vẫn còn
      // giữ, và chỉ dòng này mới xoá được.
      const ten = await caches.keys();
      await Promise.all(ten.map((t) => caches.delete(t)));
      await self.clients.claim();
    })(),
  );
});

/**
 * Có `fetch` handler mới được tính là PWA cài được — nhưng handler này không làm gì.
 *
 * Không gọi `e.respondWith`, nghĩa là trình duyệt đi mạng y như khi không có service
 * worker. Đây là chủ ý, không phải chỗ làm dở: xem phần đầu file.
 */
self.addEventListener('fetch', () => {});

// eslint-disable-next-line no-console
console.info(`[mira] service worker ${PHIEN_BAN} — không cache, đúng như thiết kế`);
