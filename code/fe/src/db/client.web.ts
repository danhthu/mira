// Web stub — expo-sqlite yêu cầu SharedArrayBuffer (COOP/COEP headers)
// không có trong Metro dev server. DB không khả dụng trên web.
//
// 2026-08-25: thêm mock đọc-rỗng/ghi-bỏ-qua thay vì để `db = null`, để bản web chỉ
// dùng cho xem giao diện không bị crash khi điều hướng. KHÔNG lưu được dữ liệu thật
// trên web — mọi thao tác ghi lặng lẽ không làm gì, mọi thao tác đọc trả về rỗng.
// Dữ liệu thật chỉ có trên iOS/Android qua client.ts (expo-sqlite thật).
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type * as schema from './schema';

function emptyReadResult(): unknown[] & { orderBy: () => unknown[] } {
  const rows: unknown[] & { orderBy?: () => unknown[] } = [];
  rows.orderBy = () => [];
  return rows as unknown[] & { orderBy: () => unknown[] };
}

const readChain = {
  from: () => readChain,
  where: () => emptyReadResult(),
  orderBy: () => [],
};

const writeChain = {
  // Trả lại đúng bản ghi vừa "ghi" để form không báo lỗi khi demo trên web —
  // không lưu đi đâu cả, mất khi tải lại trang.
  values: (row: Record<string, unknown>) => ({ returning: async () => [row] }),
  set: () => ({ where: async () => undefined }),
};

const webMockDb = {
  select: () => readChain,
  insert: () => writeChain,
  update: () => writeChain,
  delete: async () => undefined,
};

export const db = webMockDb as unknown as ExpoSQLiteDatabase<typeof schema>;
export type Db = ExpoSQLiteDatabase<typeof schema>;

export async function initializeDatabase(): Promise<void> {
  // no-op on web
}
