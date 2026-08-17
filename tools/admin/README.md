# Mira Blog Admin

Tool local để review và approve 28 bài blog trước khi publish.

## Setup

```bash
cd tools/admin
npm install
cp .env.example .env
# Điền GEMINI_API_KEY vào .env
```

Lấy API key tại: https://aistudio.google.com/apikey  
Model dùng Imagen 3 (`imagen-3.0-generate-002`) — cần account Google AI Studio có quyền Imagen.

## Chạy

```bash
npm start
# → http://localhost:4000
```

Hoặc với key inline:

```bash
GEMINI_API_KEY=xxx npm start
```

## Tính năng

- Xem 28 bài (title, description, badge Pending/Approved)
- Nhập/sửa prompt → tạo ảnh bằng Gemini Imagen 3
- Chọn ngày đăng → Approve → lưu vào `approved.json`
- Unapprove để hoàn tác

## File output

- Ảnh lưu tại: `content/blog/vi/images/<slug>.png`
- Trạng thái approve: `tools/admin/approved.json`
