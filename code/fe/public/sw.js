// Service worker tối thiểu, tồn tại vì hai lý do:
// 1. Chrome chỉ mời "Cài ứng dụng" khi trang có service worker xử lý sự kiện
//    fetch. Thiếu nó thì chỉ thêm được lối tắt, không phải app đứng riêng.
// 2. Bản dist đặt hash vào tên file nên cache theo tên là an toàn — file đổi
//    thì tên cũng đổi, không có chuyện phục vụ nhầm bản cũ.
//
// Dữ liệu app nằm ở AsyncStorage/localStorage, service worker không đụng tới.

const CACHE = 'dailyops-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Điều hướng luôn thử mạng trước rồi mới rơi về bản cache: vào app mà nhận
  // đúng bản HTML cũ thì nó sẽ đòi một file JS đã bị xoá, ra màn hình trắng.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
