# 09 — Hợp đồng đồng bộ FE ↔ BE

> Chốt 2026-09-05. Đây là nguồn sự thật cho cả `code/be` (phía phục vụ) và `code/fe` (phía gọi). Hai bên implement độc lập theo tài liệu này.

## Quyết định đổi ràng buộc cứng #5

Ràng buộc cũ: *"Local-first. Dữ liệu nằm trên máy. Không gửi gì lên server ở V1."*

Ràng buộc mới (chủ dự án chốt 2026-09-05):

> **Offline-first, sync tuỳ chọn.** Mọi thao tác ghi vào máy trước và không bao giờ chờ mạng. Đồng bộ lên server là lớp phụ chạy nền, tắt được, và app phải dùng đủ tính năng khi tắt.

Khác biệt với "local-first" cũ nằm ở chỗ: dữ liệu **có** rời máy khi người dùng bật sync. Những ràng buộc còn lại giữ nguyên — đặc biệt là không bán/chia sẻ dữ liệu, và không có tính năng nào đòi phải online mới dùng được.

## Nguyên tắc

1. **Ghi cục bộ không bao giờ chờ mạng.** Ghi xong là xong; sync xảy ra sau, ở nền.
2. **Client sinh `id`.** UUID v7 — sắp theo thời gian, không đụng nhau giữa các máy, không cần server cấp.
3. **Xoá là xoá mềm.** Đặt `deletedAt`, không `DELETE`. Xoá cứng làm mất dấu để đồng bộ.
4. **Đụng độ xử lý bằng bản mới thắng** (last-write-wins theo `updatedAt`). Mira là app cá nhân, đụng độ thật chỉ xảy ra khi một người sửa cùng bản ghi trên hai máy trong lúc mất mạng — hiếm, và LWW cho kết quả người dùng đoán được.
5. **Sync phải tự phục hồi.** Mất mạng giữa chừng, đóng app, pin hết — lần sau mở lên chạy tiếp, không mất dữ liệu, không nhân đôi.

## Bảng được đồng bộ

13 bảng theo `02-data-model.md`: `person` · `time_entry` · `work_load` · `money` · `expense` · `goal` · `moment` · `health` · `mood` · `weight_on_mind` · `item` · `space` · `letter`.

Mọi bảng đều có: `id` (TEXT, UUID v7) · `created_at` · `updated_at` · `deleted_at` (TEXT, ISO 8601, null nếu chưa xoá).

## Định danh

V1 dev dùng header `X-User-Id` (chuỗi tuỳ ý, mặc định `local-dev`). Server phân vùng dữ liệu theo giá trị này.

> **Chưa phải xác thực thật.** Bất kỳ ai đặt đúng header đều đọc được dữ liệu của người khác. Chấp nhận được cho Postgres chạy localhost; **bắt buộc thay bằng auth thật trước khi mở ra ngoài máy**. Ghi vào nợ kỹ thuật, không được quên.

## Endpoint

Gốc: `http://127.0.0.1:3000`

### `GET /health`
```json
{ "ok": true, "db": true, "time": "2026-09-05T10:00:00.000Z" }
```
`db: false` khi không nối được Postgres — client dùng cái này để biết có nên thử sync không.

### `POST /sync/push`
Client đẩy các thay đổi cục bộ chưa gửi.

```jsonc
// Request
{
  "changes": [
    {
      "table": "person",
      "id": "0193f...",
      "updatedAt": "2026-09-05T09:00:00.000Z",
      "deletedAt": null,
      "data": { "name": "Mẹ", "role": "parent", "dunbarRing": 5 }
    }
  ]
}
```

```jsonc
// Response
{
  "applied": ["0193f..."],          // đã ghi lên server
  "skipped": [                       // server có bản mới hơn, client nên lấy về
    { "id": "0193a...", "reason": "server_newer" }
  ],
  "rejected": [                      // dữ liệu sai, client KHÔNG nên gửi lại
    { "id": "0193b...", "reason": "unknown_table" }
  ],
  "serverTime": "2026-09-05T10:00:00.000Z"
}
```

Quy tắc:
- Ghi theo kiểu upsert. Bản ghi chưa có thì thêm, có rồi thì so `updatedAt`: bản gửi lên **mới hơn hoặc bằng** thì ghi đè, cũ hơn thì bỏ qua và trả về trong `skipped`.
- `data` chỉ chứa cột nghiệp vụ, viết camelCase. Server tự map sang snake_case.
- Cột không có trong bảng → bỏ qua cột đó, không làm hỏng cả bản ghi.
- Một batch tối đa **500 bản ghi**. Vượt thì trả 413.
- **Toàn bộ batch chạy trong một transaction.** Lỗi giữa chừng thì không ghi gì cả — client gửi lại an toàn.
- Gửi lại cùng một bản ghi hai lần phải cho kết quả y hệt lần đầu (idempotent).

### `GET /sync/pull?since=<ISO>&limit=<n>`
Client lấy thay đổi từ server.

- `since` bỏ trống = lấy từ đầu. `limit` mặc định 500, tối đa 1000.

```jsonc
{
  "changes": [ /* cùng dạng phần tử với push, kèm createdAt */ ],
  "serverTime": "2026-09-05T10:00:00.000Z",
  "hasMore": false                   // true thì client gọi tiếp với since = updatedAt của bản cuối
}
```

Trả **cả bản ghi đã xoá mềm** (`deletedAt != null`) — client cần biết để xoá theo. Sắp xếp theo `updated_at` tăng dần để phân trang bằng watermark không bỏ sót.

## Phía client

- **Hàng đợi gửi đi (outbox)**: mỗi lần ghi cục bộ thì thêm một mục vào hàng đợi, lưu cùng chỗ với dữ liệu. Đẩy thành công mới xoá khỏi hàng đợi.
- **Mốc nước (watermark)**: lưu `lastPulledAt`, lần sau `pull` từ mốc đó.
- **Thứ tự một vòng sync**: push trước, pull sau. Push trước để thay đổi cục bộ không bị bản server cũ hơn ghi đè.
- **Khi nào chạy**: mở app, app quay lại foreground, và sau mỗi lần ghi có debounce vài giây. Không có timer chạy liên tục.
- **Thất bại thì lùi dần** (backoff), không thử lại dồn dập. Mất mạng không được sinh log rác cũng không được chặn UI.
- **Tắt sync**: một công tắc trong Cài đặt. Tắt thì hàng đợi vẫn tích lại, bật lên đẩy tiếp — không mất gì.

## Bổ sung sau lần implement đầu (2026-09-05)

Hai bên implement độc lập rồi cùng chỉ ra những chỗ bản đầu nói chưa đủ. Ghi lại thành quy tắc để lần sau không phải đoán.

**Phân trang khi nhiều bản ghi trùng `updatedAt`.** Con trỏ chỉ dựa vào `updatedAt` là không đủ: dùng `>` thì mất bản ghi, dùng `>=` thì lặp vô hạn. Cho tới khi có con trỏ `(updated_at, id)` đầy đủ, server **không cắt ngang một nhóm cùng `updated_at`** — trả trọn nhóm kể cả vượt `limit`. Client phải chịu được response dài hơn `limit` mình xin.

**`since` là khoảng hở** (`updated_at > since`), không bao gồm chính mốc đó.

**Client làm gì với mục bị `skipped`:** bỏ khỏi hàng đợi. Vòng `pull` ngay sau đó sẽ mang bản mới của server về, nên giữ lại chỉ khiến đẩy đi đẩy lại một bản ghi chắc chắn thua.

**`rejected` luôn là vĩnh viễn.** Đúng như câu "client KHÔNG nên gửi lại" — không có mã lý do nào mang nghĩa "thử lại sau". Lỗi tạm thời phải biểu hiện bằng HTTP lỗi, không phải bằng `rejected`.

**`updatedAt` phải là UTC.** Cột lưu dạng TEXT nên Postgres so sánh theo chuỗi; gửi `+07:00` sẽ so sai thứ tự. Server chuẩn hoá về UTC ISO trước khi ghi, client nên gửi UTC sẵn.

**Push không mang `createdAt`.** Bản ghi mới lấy `createdAt = updatedAt`.

**`data` của bản ghi đã xoá mềm**: gửi payload cuối cùng client biết, không gửi rỗng — để máy khác vẫn hiển thị được thứ vừa bị xoá nếu cần hoàn tác.

**Không gọi `/health` trong vòng sync.** Nó dành cho chẩn đoán và cho màn Cài đặt. Thêm một round-trip trước mỗi lần sync là lãng phí; push/pull thất bại đã đủ kích hoạt backoff.

**Push trả về rỗng cả ba mảng** nghĩa là không có tiến triển — client lùi dần, không gửi lại ngay.

**`skipped`/`rejected` chỉ mang `id`, không mang `table`.** Client tự tra id thuộc bảng nào từ hàng đợi của mình.

### Còn chưa giải quyết

- **Server không loại trừ thay đổi do chính client vừa đẩy** — mỗi vòng sync kéo về đúng thứ mình vừa gửi. Vô hại (LWW bỏ qua) nhưng tốn mạng. Cần một mã định danh client trong header để lọc.
- **Push id trùng của người dùng khác** hiện báo `server_newer`, sai nghĩa. Cần thêm mã lý do riêng.

## Ngoài phạm vi V1

Xác thực thật · mã hoá đầu-cuối · sync theo thời gian thực (websocket) · giải quyết đụng độ ở mức từng cột · nhiều người dùng chung một không gian (`space`).
