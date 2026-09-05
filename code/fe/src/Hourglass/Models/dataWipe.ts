/**
 * Xoá toàn bộ dữ liệu — `05-v1-spec.md` §Settings.
 *
 * Hai lượt, cố ý theo thứ tự này:
 *
 * 1. `empty()` từng repository đang đăng ký. Mỗi `Repository` giữ một bản sao trong
 *    bộ nhớ (`_data`); nếu chỉ xoá khoá dưới đĩa thì lần ghi kế tiếp sẽ lưu lại bản
 *    sao cũ và dữ liệu "sống lại". `empty()` cũng bắn sự kiện để màn đang mở vẽ lại.
 * 2. Xoá mọi khoá `AsyncStorage` còn lại — kể cả khoá không thuộc repository nào
 *    (`settings`, `sync_settings`, `sync_outbox`, `sync_watermark`,
 *    `hourglass_settings`, và mọi khoá module khác thêm sau này).
 *
 * Không chỗ nào ở đây gõ tay tên bảng. Xem `stores.ts` cho lý do.
 */

import { resetHourglassCache } from './store';
import { registeredRepositories, removeStorageKeys, storageKeys } from './stores';

export interface WipeReport {
  readonly repositoriesEmptied: number;
  readonly keysRemoved: number;
}

export async function wipeAllData(): Promise<WipeReport> {
  const repositories = registeredRepositories();
  await Promise.all(repositories.map((repository) => repository.empty()));

  const keys = await storageKeys();
  await removeStorageKeys(keys);

  resetHourglassCache();

  return { repositoriesEmptied: repositories.length, keysRemoved: keys.length };
}
