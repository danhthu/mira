# Cấu trúc — code/

> Viết lại 2026-09-05. Bản trước (2026-08-25) mô tả cây `features/`/`core/`/`db/` của app tự viết — app đó bị thay hoàn toàn bằng Batify ngày 27/08 (commit `d633408`), nên bản cũ mô tả thư mục không còn tồn tại. Bản này lấy từ cây thật trên đĩa.
>
> Kiến trúc **vẫn là feature-based**, chỉ khác quy ước đặt tên so với bản cũ: thư mục feature viết hoa (`Emotion/` thay vì `features/emotion/`), lớp dùng chung tên `Common/` thay vì `shared/`, và chưa có tầng `core/` tách riêng cho hàm thuần.

## code/fe — mobile (React Native + Expo 51) + PWA web

### Ba tầng

```
code/fe/
├── libs/ lang/ theme/ store/ hook/     TẦNG HẠ TẦNG — component gốc, i18n,
│                                        token màu, pullstate store, hook chung
│                                        (nằm ngoài src/, không thuộc feature nào)
│
├── src/Common/                         TẦNG DÙNG CHUNG — thứ mọi feature được
│   ├── Repositories/                    phép import. KHÔNG được import ngược
│   │   ├── Repo.ts                      lên feature (luật 1).
│   │   ├── DbProvider.ts                Repository<T> generic + AsyncStorage
│   │   └── AsyncStorageProvider.ts
│   ├── Entities/                        base entity dùng chung
│   ├── FormControls/ Components/        control nhập liệu, component dùng lại
│   ├── Interfaces/ Models/ Utils/
│   ├── Styles/ Hooks/ Text/
│   └── Screens/                        ⚠ Profile.tsx là màn hình, không phải
│                                          thứ dùng chung — xem "Nợ" bên dưới
│
└── src/<Feature>/                      TẦNG FEATURE — mỗi domain một thư mục
    ├── Entities/                        model + repository riêng của feature
    ├── Screens/                         màn hình
    ├── Components/                      component riêng feature đó
    ├── Models/                          hook/selector đọc dữ liệu
    ├── Setup/                           clean/initialize/sample cho feature
    ├── Text/                            chuỗi hiển thị riêng
    └── Assets/
```

Feature hiện có: `Challenger` · `Emotion` · `Goal` · `HabitTracker` · `Reminder` · `TimeTracker` · `Trading` · `Welcome` · `Work`

Composition root: `Main/` (shell điều hướng) và `Home/` (dashboard ghép widget từ nhiều feature). **Việc của chúng là ghép feature lại, nên được phép import feature** — không tính là vi phạm.

Thư mục vỏ: `Assets/`, `Controls/`, `Me/` (1 file OTA check, chưa ai import).

### Luật cứng

1. **`Common/` không import feature.** Lớp dùng chung phải nằm dưới; import ngược lên là đảo tầng.
2. **Feature không import feature khác.** Cần dùng chung thì đưa xuống `Common/`.
3. **Composition root (`Main/`, `Home/`) được import feature** — đó là nhiệm vụ của nó.
4. **Không vòng lặp giữa hai feature.** Hệ quả của luật 2, tách riêng để chẩn đoán.

`scripts/soi-cau-truc.sh` soi bốn luật này. Script **tự thoát mã 2 nếu thư mục cần soi không tồn tại** — thêm sau bài học 27/08: bản script cũ soi thư mục đã bị xoá nên in "sạch" một cách rỗng suốt nhiều đợt kiểm tra.

### Trạng thái ngày 2026-09-05

```
Tổng: 36 vi phạm — 35 sẽ tự biến mất khi cắt module, nợ thật phải sửa tay: 1
```

Chi tiết:

| Nguồn | Số | Ghi chú |
|---|---|---|
| Feature → feature | 29 | Challenger 7 · Work 8 · Goal 5 · TimeTracker 5 · HabitTracker 2 · Welcome 2 |
| `Common/` → feature | 7 | 4 chỗ import `Work/Text`, 3 chỗ trong `Common/Screens/Profile.tsx` |
| Vòng lặp | 4 cặp | Challenger↔HabitTracker · Challenger↔Work · Goal↔HabitTracker · Goal↔Work |

**Vì sao 35/36 tự biến mất:** `PLAN.md` đã chốt cắt `HabitTracker`, `Work`, `Challenger`, `Trading` (không thuộc mô hình 3 trụ). Gần như toàn bộ import chéo đang nằm giữa chính bốn module đó, hoặc trỏ vào chúng. Cả 4 vòng lặp cũng vậy — mỗi vòng đều có ít nhất một đầu là module bị cắt.

**Nợ thật sự — 1 chỗ:** `Common/Screens/Profile.tsx` import `TimeTracker/Components/Card`. Đây là màn hình bị đặt nhầm vào tầng dùng chung; cách sửa là chuyển nó ra thành feature riêng (hoặc vào `Home/`), không phải nới luật. Bốn chỗ `Common/Components/*` import `Work/Text` cũng cần xử lý nhưng sẽ tự hết khi `Work/` bị cắt — lúc đó phải chuyển mấy chuỗi đó về `Common/Text/` hoặc `lang/`.

### Khác biệt so với kiến trúc cũ, và việc còn phải làm

| | Bản cũ (đã mất) | Batify hiện tại |
|---|---|---|
| Lớp dùng chung | `shared/` | `Common/` |
| Hàm thuần có test | `core/` — tầng riêng, cấm import React | **chưa có** |
| Lưu trữ | SQLite + Drizzle, 13 bảng | AsyncStorage + `Repository<T>` |
| State | Zustand | pullstate |
| Chuỗi hiển thị | `i18n/vi.ts` gom một chỗ | rải trong `<Feature>/Text/` + `lang/` |

Tầng `core/` là khoảng trống đáng chú ý nhất: mô hình 3 trụ trong `docs/08-three-pillars.md` toàn công thức thuần (vốn tự do, bốc hơi, tỷ giá đời, giờ tỉnh) — loại code bắt buộc phải có test và không nên nằm lẫn trong màn hình. Khi bắt đầu xây trụ Tài chính, thêm `src/Core/` cùng luật "không import React, không import Repositories".

Câu hỏi lưu trữ (AsyncStorage hay quay lại SQLite+Drizzle) vẫn chưa chốt — xem `PLAN.md`.

## code/be — backend (Node.js + TypeScript)

Không bị đụng trong đợt reset 27/08, giữ nguyên kiến trúc ba tầng:

```
code/be/src/
├── entities/       domain object thuần, không phụ thuộc gì
├── shared/         interface + DTO + row type, KHÔNG chứa implementation
│   └── types/enums.ts   nguồn chung cho union type (PersonRole, TimeBucket…)
└── database/       PostgresAdapter + migrations + queries + seeds
```

Luật: `shared/` không import `entities/`/`database/` · `entities/` không import `database/`/`shared/` · `database/` chỉ import `shared/`. Hai ngoại lệ hẹp chỉ cho `import type`, đã ghi trong `code/CLAUDE.md`.

Vi phạm DTO phát hiện 25/08 đã xử lý xong bằng `shared/types/enums.ts`. Soi ngày 2026-09-05: sạch.

**Lưu ý phạm vi:** `code/be` nằm ngoài V1 (ràng buộc local-first, không sync). Vẫn xây song song theo quyết định đã chốt trong `PROJECT.yaml`.
