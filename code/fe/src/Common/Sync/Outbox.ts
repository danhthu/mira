import { getDefaultDbProvider } from '../Repositories/Repo';
import { MAX_OUTBOX_ENTRIES, STORAGE_KEY_OUTBOX } from './constants';
import { OutboxEntry, SyncChange } from './types';

function isOutboxEntry(value: unknown): value is OutboxEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as { seq?: unknown; change?: unknown };
  if (typeof entry.seq !== 'number') return false;
  if (typeof entry.change !== 'object' || entry.change === null) return false;
  const change = entry.change as { table?: unknown; id?: unknown; updatedAt?: unknown };
  return (
    typeof change.table === 'string' &&
    typeof change.id === 'string' &&
    typeof change.updatedAt === 'string'
  );
}

/**
 * Hàng đợi gửi đi, lưu bền cùng chỗ với dữ liệu nghiệp vụ (AsyncStorage trên máy,
 * localStorage trên web). Mục chỉ rời hàng đợi khi server xác nhận đã nhận.
 *
 * Mọi thao tác nối vào một chuỗi promise duy nhất: enqueue chạy song song với
 * remove sẽ đọc–sửa–ghi chồng lên nhau và làm mất mục.
 */
export class Outbox {
  private tail: Promise<void> = Promise.resolve();
  private nextSeq = 0;

  private serialize<T>(work: () => Promise<T>): Promise<T> {
    const result = this.tail.then(work);
    this.tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async read(): Promise<OutboxEntry[]> {
    const raw = await getDefaultDbProvider().getItem(STORAGE_KEY_OUTBOX);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed.filter(isOutboxEntry);
    entries.forEach((e) => {
      if (e.seq >= this.nextSeq) this.nextSeq = e.seq + 1;
    });
    return entries;
  }

  private async write(entries: OutboxEntry[]): Promise<void> {
    await getDefaultDbProvider().setItem(STORAGE_KEY_OUTBOX, JSON.stringify(entries));
  }

  /**
   * Xếp một thay đổi vào hàng. Cùng một bản ghi ghi nhiều lần thì chỉ giữ bản mới
   * nhất — server chỉ cần trạng thái cuối, gửi cả lịch sử là tốn mạng vô ích.
   */
  enqueue(change: SyncChange): Promise<void> {
    return this.serialize(async () => {
      const entries = await this.read();
      const kept = entries.filter(
        (e) => !(e.change.table === change.table && e.change.id === change.id),
      );
      kept.push({ seq: this.nextSeq++, change });
      const overflow = kept.length - MAX_OUTBOX_ENTRIES;
      await this.write(overflow > 0 ? kept.slice(overflow) : kept);
    });
  }

  list(): Promise<OutboxEntry[]> {
    return this.serialize(async () => {
      const entries = await this.read();
      return entries.sort((a, b) => a.seq - b.seq);
    });
  }

  count(): Promise<number> {
    return this.serialize(async () => (await this.read()).length);
  }

  /** Bỏ khỏi hàng đợi những mục server đã nhận (hoặc đã từ chối hẳn). */
  remove(seqs: number[]): Promise<void> {
    return this.serialize(async () => {
      if (seqs.length === 0) return;
      const drop = new Set(seqs);
      const entries = await this.read();
      await this.write(entries.filter((e) => !drop.has(e.seq)));
    });
  }

  clear(): Promise<void> {
    return this.serialize(() => this.write([]));
  }
}
