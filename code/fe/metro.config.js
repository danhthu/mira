const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite trên web chạy bằng WASM và cần SharedArrayBuffer. Trình duyệt chỉ
// cấp SharedArrayBuffer cho trang đã cô lập nguồn gốc (cross-origin isolated),
// tức phải có đủ hai header dưới đây. Thiếu chúng thì bản web không có DB thật,
// chỉ chạy được phần giao diện.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    return middleware(req, res, next);
  },
};

module.exports = config;
