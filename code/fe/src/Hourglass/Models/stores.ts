/**
 * Danh sách kho dữ liệu, **suy ra** chứ không liệt kê tay.
 *
 * Lịch sử: nút "xoá toàn bộ dữ liệu" từng xoá 3 trong 13 bảng vì danh sách được gõ
 * tay và không ai cập nhật khi thêm bảng. Ở đây có đúng hai nguồn, cả hai đều tự
 * theo kịp khi dự án thêm kho mới:
 *
 * 1. `Common/Repositories/index.ts` — mọi biến `Repository` được export ở đó. Thêm
 *    một dòng `getRepository<X>('x')` là hàm dưới đây thấy ngay, không phải sửa gì.
 * 2. `AsyncStorage.getAllKeys()` — mọi khoá thật sự đang nằm trên máy, kể cả khoá
 *    không đi qua `Repository` (`settings`, `sync_outbox`, `hourglass_settings`…).
 *
 * Gọi `AsyncStorage` thẳng thay vì qua `DbProvider` vì interface đó chỉ có
 * `getItem`/`setItem`, không liệt kê được khoá. `AsyncStorageProvider` là hiện thực
 * mặc định và duy nhất của app, nên hai đường vẫn nhìn vào cùng một kho.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { base } from '../../Common/Entities/base';
import * as Repositories from '../../Common/Repositories';
import { Repository } from '../../Common/Repositories';

export function registeredRepositories(): Repository<base>[] {
  const registry = Repositories as unknown as Record<string, unknown>;
  return Object.keys(registry)
    .map((key) => registry[key])
    .filter((value): value is Repository<base> => value instanceof Repository);
}

export async function storageKeys(): Promise<string[]> {
  return (await AsyncStorage.getAllKeys()).slice();
}

export async function readStorage(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function removeStorageKeys(keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  await AsyncStorage.multiRemove(keys.slice());
}
