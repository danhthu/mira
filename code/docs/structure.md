# Cấu trúc — code/

> Sinh bởi skill `cau-truc-du-an`, 2026-08-25. Đây là cấu trúc **thật** đang có trên đĩa, không phải cây mẫu — mọi tên module dưới đây lấy từ `docs/dac-ta/use-case.md` (V1) và tên file thật trong repo.

## code/fe — mobile (React Native + Expo)

```
code/fe/src/
├── core/                         hàm thuần, không import React, mỗi hàm có test đi kèm
│   ├── goldenHours.ts            R-026..R-029 — UC-04
│   ├── hourglass.ts              R-033, R-034 — UC-08
│   ├── lifeRate.ts                thuộc V2 (M2 Tài chính) — xem PROJECT.yaml.ghi_chu_quyet_dinh
│   ├── freedomCapital.ts          thuộc V2
│   ├── expenseConversion.ts       thuộc V2
│   ├── constants.ts
│   └── __tests__/                 một file test cho mỗi hàm ở trên
│
├── db/                            SQLite (Drizzle) — bảng đủ 13, chỉ dùng 3 bảng ở V1
│   ├── schema.ts
│   ├── client.ts, client.web.ts
│   ├── seed.ts
│   └── repositories/               momentRepository, personRepository, timeEntryRepository
│
├── features/<tên>/                mỗi feature một thư mục độc lập, khớp một hoặc nhiều UC
│   ├── today/                      UC-02, UC-03, UC-04, UC-05
│   │   ├── screens/TodayScreen.tsx
│   │   ├── components/PersonTimeRow.tsx
│   │   ├── hooks/useTodayData.ts
│   │   └── store/todayStore.ts
│   ├── hourglass/                  UC-07, UC-08
│   │   ├── screens/HourglassScreen.tsx
│   │   └── components/HourglassCard.tsx
│   ├── moments/                    UC-06
│   │   ├── screens/MomentsScreen.tsx
│   │   └── components/MomentItem.tsx
│   ├── onboarding/                 UC-01
│   │   └── screens/{WelcomeScreen,AddPeopleScreen,CadenceScreen}.tsx
│   └── settings/                   UC-09, UC-10, UC-11, UC-12, UC-13
│       ├── screens/SettingsScreen.tsx
│       └── components/PersonSettingRow.tsx
│
├── shared/                        thứ DUY NHẤT được import giữa các feature
│   ├── components/{Avatar,Button,Card}.tsx
│   ├── hooks/useDatabase.ts
│   ├── types/index.ts
│   └── utils/{date,format}.ts
│
├── i18n/vi.ts                     mọi chuỗi hiển thị
├── store/settingsStore.ts         state toàn app (Zustand)
└── navigation/RootNavigator.tsx
```

**Luật cứng** (đã ghi trong `code/CLAUDE.md`, nhắc lại ở đây để đối chiếu với script soi):

1. `features/X` chỉ import từ `shared/`, `core/`, `db/`, `i18n/`, `store/`. Không bao giờ import `features/Y`.
2. `core/` không import React, không import `db/`, không import `store/`.

**Kết quả soát ngày 2026-08-25:** cả hai luật đều sạch — không file nào trong `features/` import chéo feature khác, không file nào trong `core/` import React/db/store.

## code/be — backend (Node.js + TypeScript, chưa có route/server, chỉ có tầng dữ liệu)

```
code/be/src/
├── entities/                      domain object thuần TypeScript, không phụ thuộc gì
│   ├── shared.ts                   TimeBucket dùng chung giữa TimeEntry/Expense/Moment — nằm TRONG entities/, tránh import vòng giữa các entity, không phải be/src/shared/
│   └── {Person,TimeEntry,Moment,Money,Expense,Goal,Health,Item,Letter,Mood,Space,WeightOnMind,WorkLoad}.ts
│
├── shared/                        interface + DTO + row type, KHÔNG chứa implementation
│   ├── interfaces/IDatabase.ts
│   ├── dtos/{MomentDto,PersonDto,TimeEntryDto}.ts    ⚠ xem "Vi phạm phát hiện" bên dưới
│   └── types/rows.ts
│
└── database/                      chỉ import từ shared/
    ├── PostgresAdapter.ts
    ├── migrations/{001_initial.sql, runner.ts}
    ├── queries/{person,timeEntry,moment}.ts
    └── seeds/{seed.sql, runner.ts}
```

**Luật cứng** (đã ghi trong `code/CLAUDE.md`):

1. `shared/` không import từ `entities/` hoặc `database/`.
2. `entities/` không import từ `database/` hoặc `shared/`.
3. `database/` chỉ import từ `shared/`.

**Vi phạm phát hiện ngày 2026-08-25 — không tự sửa, chờ quyết định:**

`shared/dtos/{MomentDto,PersonDto,TimeEntryDto}.ts` cả ba đều `import type` trực tiếp từ `entities/` (`MediaType`, `TimeBucket` từ `Moment.ts`/`TimeEntry.ts`, `PersonRole`, `DunbarRing` từ `Person.ts`) — vi phạm đúng luật 1. Nguyên nhân: các union type này (`PersonRole`, `TimeBucket`...) hiện chỉ định nghĩa một chỗ duy nhất là bên trong entity tương ứng, nhưng DTO cũng cần dùng lại.

Hai hướng sửa khả dĩ, chưa chọn:
- Chuyển các union type dùng chung (`PersonRole`, `DunbarRing`, `TimeBucket`, `TimeEntrySource`, `MediaType`) sang `shared/types/`, để cả `entities/` lẫn `shared/dtos/` cùng import từ đó — giữ đúng hướng phụ thuộc một chiều `entities/` và `shared/` đều không import lẫn nhau, mà import chung một tầng thấp hơn.
- Hoặc định nghĩa lại các union type này ngay trong từng file DTO, chấp nhận trùng lặp giữa entity và DTO.

Xem `scripts/soi-cau-truc.sh` — script báo đúng 4 dòng vi phạm này, thoát mã khác 0.
