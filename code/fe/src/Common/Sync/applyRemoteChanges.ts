import { base } from '../Entities/base';
import { markApplyingRemote, unmarkApplyingRemote } from '../Repositories/ChangeSink';
import { getSyncedRepository } from './SyncRegistry';
import { PulledChange } from './types';

/**
 * `base` lưu thời gian bằng mili-giây epoch, hợp đồng dùng chuỗi ISO 8601. Quy về
 * một đơn vị trước khi so bản nào mới hơn.
 */
function localUpdatedAt(entity: base): number {
  return entity.modified_date || entity.created_date || 0;
}

function remoteMillis(iso: string): number {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const ISO_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Entity giữ ngày bằng `Date`; qua JSON chúng thành chuỗi ISO. `Repository._init`
 * đã đổi ngược khi nạp từ đĩa — làm y hệt ở đây để bản ghi vừa lấy về dùng được
 * ngay, không phải chờ khởi động lại app.
 */
function reviveDates(value: unknown): unknown {
  if (typeof value === 'string' && ISO_FORMAT.test(value)) return new Date(value);
  if (Array.isArray(value)) return value.map(reviveDates);
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      out[key] = reviveDates((value as Record<string, unknown>)[key]);
    });
    return out;
  }
  return value;
}

function stamp(target: base, change: PulledChange, remoteAt: number): void {
  const row = target as base & Record<string, unknown>;
  Object.keys(change.data).forEach((key) => {
    row[key] = reviveDates(change.data[key]);
  });
  row.id = change.id;
  // Giữ nguyên mốc của server, không đóng dấu thời gian máy này: mốc đó chính là
  // thứ dùng để so bản mới thắng ở vòng sau.
  row.modified_date = remoteAt;
  if (change.createdAt) {
    row.created_date = remoteMillis(change.createdAt);
  } else if (!row.created_date) {
    row.created_date = remoteAt;
  }
  if (change.deletedAt) {
    row.deleted = true;
    row.deleted_date = remoteMillis(change.deletedAt);
  } else {
    row.deleted = false;
    row.deleted_date = undefined;
  }
}

export interface ApplyResult {
  applied: number;
  /** Bản server cũ hơn hoặc bằng bản cục bộ, hoặc bảng chưa có repository đăng ký. */
  ignored: number;
  /** Bản ghi server gửi xuống nhưng không qua được `validate()` của repository. */
  invalid: Array<{ table: string; id: string }>;
}

/**
 * Ghi thay đổi từ server vào kho cục bộ theo luật bản mới thắng (`updatedAt`).
 * Bản có `deletedAt` thì xoá mềm theo — `Repository.list()` lọc `deleted` nên bản
 * ghi biến khỏi màn hình mà vẫn còn dấu vết để đồng bộ tiếp.
 */
export async function applyRemoteChanges(changes: PulledChange[]): Promise<ApplyResult> {
  let applied = 0;
  let ignored = 0;
  const invalid: Array<{ table: string; id: string }> = [];
  const touchedTables = new Set<string>();
  // Giữ dấu "đang ghi từ server" cho tới sau khi `save()` chạy xong, vì chính
  // `save()` mới là lúc repository đẩy thay đổi sang hàng đợi gửi đi.
  const marked: PulledChange[] = [];

  try {
    for (const change of changes) {
      const repository = getSyncedRepository(change.table);
      if (!repository) {
        ignored += 1;
        continue;
      }

      const remoteAt = remoteMillis(change.updatedAt);
      const existing = await repository.findById(change.id);
      if (existing && localUpdatedAt(existing) >= remoteAt) {
        ignored += 1;
        continue;
      }

      markApplyingRemote(change.table, change.id);
      marked.push(change);

      if (existing) {
        // `findById` trả về chính đối tượng nằm trong mảng của repository, sửa tại
        // chỗ rồi `save()` là đủ. Không dùng `addOrUpdate` vì nó đóng dấu
        // `modified_date` bằng giờ máy này và làm mất mốc của server.
        stamp(existing, change, remoteAt);
        applied += 1;
        touchedTables.add(change.table);
        continue;
      }

      const created = new base();
      stamp(created, change, remoteAt);
      try {
        await repository.add(created);
        applied += 1;
        touchedTables.add(change.table);
      } catch {
        // Bản ghi không qua được `validate()` của repository (server có cột mà
        // phiên bản app này chưa hiểu). Bỏ đúng bản đó, các bản còn lại vẫn vào —
        // để cả vòng chết thì người dùng kẹt lại vĩnh viễn ở bản ghi hỏng.
        ignored += 1;
        invalid.push({ table: change.table, id: change.id });
      }
    }

    for (const table of touchedTables) {
      const repository = getSyncedRepository(table);
      if (repository) await repository.save();
    }
  } finally {
    marked.forEach((c) => unmarkApplyingRemote(c.table, c.id));
  }

  return { applied, ignored, invalid };
}
