import { LocalChange, setLocalChangeSink } from '../Repositories/ChangeSink';
import { applyRemoteChanges } from './applyRemoteChanges';
import {
  BACKOFF_STEPS_MS,
  isSyncedTable,
  PULL_PAGE_SIZE,
  PUSH_BATCH_SIZE,
  STORAGE_KEY_WATERMARK,
  WRITE_DEBOUNCE_MS,
} from './constants';
import { Outbox } from './Outbox';
import { SyncClient, SyncUnavailableError } from './SyncClient';
import {
  loadSyncSettings,
  loadWatermark,
  saveSyncSettings,
  saveWatermark,
} from './SyncSettingsStore';
import { FetchLike, SyncCycleResult, SyncSettings, SyncStatus } from './types';

function toIso(millis: number): string {
  return new Date(millis).toISOString();
}

export interface SyncEngineOptions {
  fetchImpl?: FetchLike;
  /** Cho test thay `setTimeout` để không phải chờ thật. */
  schedule?: (run: () => void, delayMs: number) => number;
  cancel?: (handle: number) => void;
}

/**
 * Một vòng đồng bộ: push trước, pull sau.
 *
 * Push trước là bắt buộc theo hợp đồng — pull trước sẽ lấy bản server cũ hơn về đè
 * lên thay đổi cục bộ chưa kịp gửi, và thay đổi đó biến mất trước mắt người dùng.
 */
export class SyncEngine {
  private readonly outbox = new Outbox();
  private settings: SyncSettings | undefined;
  private running = false;
  private lastSyncedAt: number | null = null;
  private pending = 0;
  private backoffStep = 0;
  private timer: number | undefined;
  private readonly listeners: Array<(status: SyncStatus) => void> = [];
  private readonly scheduleFn: (run: () => void, delayMs: number) => number;
  private readonly cancelFn: (handle: number) => void;

  constructor(private readonly options: SyncEngineOptions = {}) {
    this.scheduleFn =
      options.schedule ||
      ((run, delayMs) => setTimeout(run, delayMs) as unknown as number);
    this.cancelFn = options.cancel || ((handle) => clearTimeout(handle));
  }

  /**
   * Cắm vào kho cục bộ và chạy một vòng. Gọi khi mở app.
   * Không dựng timer chạy liên tục: vòng tiếp theo do thao tác ghi, foreground,
   * hoặc backoff sau thất bại kích hoạt.
   */
  async start(): Promise<void> {
    this.settings = await loadSyncSettings();
    setLocalChangeSink((change) => this.onLocalChange(change));
    this.pending = await this.outbox.count();
    this.notify();
    await this.runNow();
  }

  stop(): void {
    setLocalChangeSink(undefined);
    this.clearTimer();
  }

  onStatusChanged(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.status());
    return () => {
      const at = this.listeners.indexOf(listener);
      if (at >= 0) this.listeners.splice(at, 1);
    };
  }

  status(): SyncStatus {
    return {
      enabled: this.settings ? this.settings.enabled : false,
      running: this.running,
      lastSyncedAt: this.lastSyncedAt,
      pending: this.pending,
    };
  }

  getSettings(): SyncSettings | undefined {
    return this.settings;
  }

  /**
   * Số mục còn trong hàng đợi, đọc thẳng từ kho. Xếp sau mọi thao tác hàng đợi
   * đang chạy dở, nên gọi ngay sau một lần ghi vẫn ra con số đúng.
   */
  pendingCount(): Promise<number> {
    return this.outbox.count();
  }

  async updateSettings(patch: Partial<SyncSettings>): Promise<void> {
    const next: SyncSettings = { ...(this.settings || (await loadSyncSettings())), ...patch };
    this.settings = next;
    await saveSyncSettings(next);
    this.backoffStep = 0;
    this.notify();
    // Vừa bật lên thì đẩy ngay những gì đã tích trong lúc tắt.
    if (next.enabled) this.scheduleSoon(0);
  }

  /**
   * Nhận thay đổi từ `Repository.save()`. Chạy đồng bộ (không await) nên thao tác
   * ghi cục bộ trả về ngay; mọi việc còn lại xảy ra ở nền.
   */
  private onLocalChange(change: LocalChange): void {
    if (!isSyncedTable(change.table)) return;
    this.outbox
      .enqueue({
        table: change.table,
        id: change.id,
        updatedAt: toIso(change.updatedAt),
        deletedAt: change.deletedAt === null ? null : toIso(change.deletedAt),
        data: change.data,
      })
      .then(() => {
        this.pending += 1;
        this.notify();
        this.scheduleSoon(WRITE_DEBOUNCE_MS);
      })
      .catch(() => {
        // Kho cục bộ không ghi nổi hàng đợi (hết dung lượng, storage bị khoá).
        // Dữ liệu nghiệp vụ đã lưu xong từ trước nên không mất gì; vòng sau sẽ
        // dựng lại hàng đợi từ đầu khi storage rảnh, nên chỉ cần thôi ở đây.
        this.scheduleSoon(BACKOFF_STEPS_MS[0]);
      });
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      this.cancelFn(this.timer);
      this.timer = undefined;
    }
  }

  /** Debounce: nhiều lần ghi liên tiếp chỉ dẫn tới một vòng đồng bộ. */
  private scheduleSoon(delayMs: number): void {
    this.clearTimer();
    this.timer = this.scheduleFn(() => {
      this.timer = undefined;
      this.runNow();
    }, delayMs);
  }

  /** Gọi khi app quay lại foreground. */
  onForeground(): void {
    this.backoffStep = 0;
    this.scheduleSoon(0);
  }

  async runNow(): Promise<SyncCycleResult> {
    const idle: SyncCycleResult = { pushed: 0, pulled: 0, pending: this.pending, completed: false };
    if (this.running) return idle;
    if (!this.settings) this.settings = await loadSyncSettings();
    if (!this.settings.enabled) {
      // Tắt sync không phải lỗi: hàng đợi cứ tích lại, không thử mạng, không báo gì.
      this.pending = await this.outbox.count();
      this.notify();
      return { ...idle, pending: this.pending };
    }

    this.running = true;
    this.notify();
    const client = new SyncClient(
      this.settings.serverUrl,
      this.settings.userId,
      this.options.fetchImpl,
    );

    try {
      const pushed = await this.pushAll(client);
      const pulled = await this.pullAll(client);
      this.lastSyncedAt = Date.now();
      this.backoffStep = 0;
      this.pending = await this.outbox.count();
      return { pushed, pulled, pending: this.pending, completed: true };
    } catch (cause) {
      if (!(cause instanceof SyncUnavailableError)) throw cause;
      // Mất mạng hoặc server chưa sống. Hàng đợi giữ nguyên, hẹn lại xa hơn một
      // nấc và im lặng — offline là trạng thái bình thường, không phải sự cố.
      this.pending = await this.outbox.count();
      const delay = BACKOFF_STEPS_MS[Math.min(this.backoffStep, BACKOFF_STEPS_MS.length - 1)];
      this.backoffStep += 1;
      this.scheduleSoon(delay);
      return { pushed: 0, pulled: 0, pending: this.pending, completed: false };
    } finally {
      this.running = false;
      this.notify();
    }
  }

  private async pushAll(client: SyncClient): Promise<number> {
    let sent = 0;
    for (;;) {
      const entries = (await this.outbox.list()).slice(0, PUSH_BATCH_SIZE);
      if (entries.length === 0) return sent;

      const response = await client.push(entries.map((e) => e.change));
      const settled = new Set<string>([
        ...response.applied,
        // `skipped` = server đã có bản mới hơn; gửi lại cũng vẫn bị bỏ qua, và vòng
        // pull ngay sau đây sẽ mang bản mới đó về. `rejected` = dữ liệu sai, hợp
        // đồng nói rõ client không gửi lại. Cả hai đều rời hàng đợi.
        ...response.skipped.map((s) => s.id),
        ...response.rejected.map((r) => r.id),
      ]);

      const done = entries.filter((e) => settled.has(e.change.id));
      if (done.length === 0) {
        // Server không nhận cũng không từ chối mục nào — gửi lại y hệt sẽ lặp vô
        // hạn, nên dừng vòng này và để backoff thử lại sau.
        throw new SyncUnavailableError('Push batch made no progress');
      }
      await this.outbox.remove(done.map((e) => e.seq));
      sent += response.applied.length;
      this.pending = await this.outbox.count();
      this.notify();
    }
  }

  private async pullAll(client: SyncClient): Promise<number> {
    let since = await loadWatermark(STORAGE_KEY_WATERMARK);
    let total = 0;

    for (;;) {
      const page = await client.pull(since, PULL_PAGE_SIZE);
      if (page.changes.length > 0) {
        await applyRemoteChanges(page.changes);
        total += page.changes.length;
        // Mốc nước đi theo bản ghi cuối trang, không theo giờ server: hợp đồng sắp
        // kết quả tăng dần theo `updated_at`, nên phân trang bằng mốc này không sót.
        since = page.changes[page.changes.length - 1].updatedAt;
        await saveWatermark(STORAGE_KEY_WATERMARK, since);
      } else if (!since) {
        since = page.serverTime;
        await saveWatermark(STORAGE_KEY_WATERMARK, since);
      }
      if (!page.hasMore) return total;
      if (page.changes.length === 0) {
        // hasMore true mà không trả bản nào thì gọi tiếp cũng vẫn vậy — thoát để
        // không quay vòng vô hạn, vòng sau thử lại.
        return total;
      }
    }
  }

  private notify(): void {
    const snapshot = this.status();
    this.listeners.forEach((l) => l(snapshot));
  }
}

let engine: SyncEngine | undefined;

export function getSyncEngine(): SyncEngine {
  if (!engine) engine = new SyncEngine();
  return engine;
}

export function setSyncEngine(next: SyncEngine | undefined): void {
  engine = next;
}
