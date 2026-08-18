# ARCHITECTURE.md — Mira

Đọc CLAUDE.md trước. Đây là chi tiết kỹ thuật của kiến trúc đã chọn.

---

## Cấu trúc folder đầy đủ

```
mira/
├── app/                              # React Native + Expo
│   ├── src/
│   │   ├── features/                 # Feature-based architecture
│   │   │   ├── today/                # M1 - Màn hình Hôm nay + Giờ vàng
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── screens/
│   │   │   │   │   └── TodayScreen.tsx
│   │   │   │   ├── store/
│   │   │   │   │   └── todayStore.ts
│   │   │   │   └── HANDOFF.md
│   │   │   ├── hourglass/            # M1 - Đồng hồ cát (mặc định tắt)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── screens/
│   │   │   │   │   └── HourglassScreen.tsx
│   │   │   │   └── HANDOFF.md
│   │   │   ├── moments/              # M5 - Khoảnh khắc
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── screens/
│   │   │   │   │   └── MomentsScreen.tsx
│   │   │   │   └── HANDOFF.md
│   │   │   ├── settings/             # Cài đặt
│   │   │   │   ├── components/
│   │   │   │   ├── screens/
│   │   │   │   │   └── SettingsScreen.tsx
│   │   │   │   └── HANDOFF.md
│   │   │   └── onboarding/           # Luồng lần đầu chạy
│   │   │       ├── components/
│   │   │       ├── screens/
│   │   │       │   ├── WelcomeScreen.tsx
│   │   │       │   ├── AddPeopleScreen.tsx
│   │   │       │   └── CadenceScreen.tsx
│   │   │       └── HANDOFF.md
│   │   ├── shared/                   # DUY NHẤT được import giữa các feature
│   │   │   ├── components/           # UI components tái sử dụng
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Button.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDatabase.ts
│   │   │   ├── types/                # TypeScript types dùng chung
│   │   │   │   └── index.ts
│   │   │   ├── utils/                # Hàm tiện ích thuần
│   │   │   │   ├── date.ts
│   │   │   │   └── format.ts
│   │   │   └── constants/
│   │   │       └── index.ts
│   │   ├── core/                     # Pure computation (không import React)
│   │   │   ├── goldenHours.ts        # Công thức giờ vàng
│   │   │   ├── hourglass.ts          # Công thức đồng hồ cát
│   │   │   ├── lifeRate.ts           # Công thức tỷ giá đời
│   │   │   ├── freedomCapital.ts     # Công thức vốn tự do
│   │   │   ├── expenseConversion.ts  # Quy đổi chi tiêu
│   │   │   ├── constants.ts          # Mọi hằng số của app
│   │   │   └── __tests__/
│   │   │       ├── goldenHours.test.ts
│   │   │       ├── hourglass.test.ts
│   │   │       ├── lifeRate.test.ts
│   │   │       ├── freedomCapital.test.ts
│   │   │       └── expenseConversion.test.ts
│   │   ├── db/                       # SQLite + Drizzle ORM
│   │   │   ├── schema.ts             # Tất cả 13 bảng (viết đủ ngay từ đầu)
│   │   │   ├── client.ts             # Khởi tạo expo-sqlite + Drizzle
│   │   │   ├── migrations/
│   │   │   └── repositories/         # Một file per entity
│   │   │       ├── personRepository.ts
│   │   │       ├── timeEntryRepository.ts
│   │   │       └── momentRepository.ts
│   │   ├── i18n/
│   │   │   └── vi.ts                 # TẤT CẢ chuỗi hiển thị (không inline trong JSX)
│   │   ├── store/                    # Zustand global stores
│   │   │   └── settingsStore.ts      # App-wide settings (hourglass on/off, v.v.)
│   │   └── navigation/
│   │       └── RootNavigator.tsx
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json                 # strict: true, paths alias @/→src/
│   ├── vitest.config.ts
│   └── HANDOFF.md                    # Top-level app handoff
│
├── be/                               # Node.js backend (future sync)
│   ├── src/
│   │   ├── shared/                   # Contracts (không implementation)
│   │   │   ├── interfaces/
│   │   │   │   └── IDatabase.ts      # Core DB contract
│   │   │   ├── types/
│   │   │   │   └── rows.ts           # Raw SQL row types (khớp với column name trong DB)
│   │   │   └── dtos/                 # Input/Output DTOs
│   │   │       ├── PersonDto.ts
│   │   │       ├── TimeEntryDto.ts
│   │   │       └── MomentDto.ts
│   │   ├── entities/                 # Domain objects (pure TypeScript)
│   │   │   ├── Person.ts
│   │   │   ├── TimeEntry.ts
│   │   │   ├── Moment.ts
│   │   │   ├── WorkLoad.ts
│   │   │   ├── Money.ts
│   │   │   ├── Expense.ts
│   │   │   ├── Goal.ts
│   │   │   ├── Health.ts
│   │   │   ├── Mood.ts
│   │   │   ├── WeightOnMind.ts
│   │   │   ├── Item.ts
│   │   │   ├── Space.ts
│   │   │   └── Letter.ts
│   │   └── database/                 # PostgreSQL adapter
│   │       ├── PostgresAdapter.ts    # Implements IDatabase, dùng `pg`
│   │       ├── queries/              # SQL constants (tagged template literals)
│   │       │   ├── person.ts
│   │       │   ├── timeEntry.ts
│   │       │   └── moment.ts
│   │       └── migrations/
│   │           ├── 001_initial.sql   # Tất cả 13 bảng
│   │           └── runner.ts         # Chạy migration
│   ├── .env.example                  # Template (commit được)
│   ├── .env                          # Credentials thật (không commit)
│   ├── package.json
│   ├── tsconfig.json
│   └── HANDOFF.md
│
└── docs/                             # Read-only design documents
    ├── 00-vision.md
    ├── 01-modules.md
    ├── 02-data-model.md
    ├── 03-formulas.md
    ├── 04-roadmap.md
    └── 05-v1-spec.md
```

---

## Import rules (cứng)

### App

| Từ | Được import từ | Không được import từ |
|---|---|---|
| `features/X/` | `shared/`, `core/`, `db/`, `i18n/`, `store/` | `features/Y/` (bất kỳ feature khác) |
| `core/` | Node built-ins | React, `db/`, `store/`, `features/` |
| `db/` | `expo-sqlite`, `drizzle-orm` | `features/`, `store/` |
| `store/` | `core/`, `db/`, Zustand | `features/` (stores không dùng component) |
| `shared/` | React, React Native, `core/` | `features/`, `store/`, `db/` |

### Backend

| Layer | Được import từ | Không được import từ |
|---|---|---|
| `shared/` | Không gì (pure types/interfaces) | `entities/`, `database/` |
| `entities/` | Không gì (pure domain objects) | `database/`, `shared/` |
| `database/` | `shared/interfaces/IDatabase`, `pg` | `entities/` (adapter không biết đến entities) |

---

## IDatabase interface

File: `be/src/shared/interfaces/IDatabase.ts`

```typescript
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface IDatabase {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
```

---

## Data model tóm tắt (từ 02-data-model.md)

### V1 tables (implement ngay)
- `person` — người quan trọng
- `time_entry` — khoảng thời gian đã dùng
- `moment` — khoảnh khắc ghi lại

### V2-V5 tables (viết schema ngay, chưa dùng)
- `work_load`, `money`, `expense`, `goal`, `space`, `letter`, `health`, `mood`, `weight_on_mind`, `item`

### Convention
- `id`: UUID v7 (text)
- `created_at`, `updated_at`: ISO 8601 với timezone
- `deleted_at`: nullable, soft delete (chuẩn bị cho sync)
- Tiền: integer VND
- Thời lượng: integer phút

---

## PostgreSQL config

Lấy từ `.env`:

```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=123123
DB_NAME=mira_dev
```

`.env.example` commit vào repo với giá trị mặc định trên. `.env` không commit.

---

## Formulas (từ 03-formulas.md)

Implement trong `app/src/core/`:

```
goldenHoursPerWeek = Σ timeEntry.minutes/60 WHERE bucket IN ('people','self') AND date trong 7 ngày qua

realWorkHours = (workMinutes + commuteMinutes + prepMinutes + recoveryMinutes) / 60
lifeRate = netIncome / (realWorkHours × 52 / 12)

freedomMonths = max(0, netWorth) / monthlyExpense
freedomDaysGained = monthlySaving / monthlyExpense × 30

hoursCost = expense.amount / lifeRate
freedomDaysCost = expense.amount / monthlyExpense × 30
```

Mỗi công thức phải handle đầy đủ các edge cases trong `03-formulas.md`.

---

## V1 Screens

| Screen | Feature folder | Mô tả |
|---|---|---|
| Today | `features/today` | Giờ vàng hôm nay, danh sách người, nút ghi |
| Hourglass | `features/hourglass` | Đồng hồ cát (mặc định màn hình trống) |
| Moments | `features/moments` | Timeline khoảnh khắc |
| Settings | `features/settings` | Cài đặt người quan trọng, bật đồng hồ cát |
| Onboarding | `features/onboarding` | 4 bước, bỏ qua được |

---

## Definition of Done cho từng task

### Task A — BE scaffold
- [ ] `be/` folder đầy đủ với package.json, tsconfig.json
- [ ] `IDatabase.ts` interface đúng spec trên
- [ ] `PostgresAdapter.ts` implement đủ 4 method
- [ ] `migrations/001_initial.sql` tất cả 13 bảng
- [ ] Migration runner chạy được
- [ ] `.env.example` có đủ biến
- [ ] HANDOFF.md cập nhật

### Task B — FE scaffold
- [ ] Expo project chạy được trên iOS simulator / Android emulator
- [ ] TypeScript strict, path alias `@/` → `src/`
- [ ] 4 screens + onboarding navigable được
- [ ] Drizzle schema đủ 13 bảng
- [ ] Zustand store cơ bản (settingsStore)
- [ ] `i18n/vi.ts` với chuỗi V1
- [ ] HANDOFF.md mỗi feature

### Task C — Core logic
- [ ] 5 file công thức trong `src/core/`
- [ ] Vitest config chạy được
- [ ] Test coverage 100% edge cases từ `03-formulas.md`
- [ ] Không import React, không import db

### Task D — Data model
- [ ] BE entities: 13 class thuần TypeScript
- [ ] DTOs cho person, timeEntry, moment
- [ ] SQL row types khớp với migration
- [ ] HANDOFF.md
