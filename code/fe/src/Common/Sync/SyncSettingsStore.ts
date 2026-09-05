import { getDefaultDbProvider } from '../Repositories/Repo';
import {
  DEFAULT_SERVER_URL,
  DEFAULT_USER_ID,
  STORAGE_KEY_SETTINGS,
} from './constants';
import { SyncSettings } from './types';

/**
 * Mặc định TẮT. Ràng buộc cứng #5 nói dữ liệu chỉ rời máy khi người dùng bật sync,
 * nên trạng thái an toàn khi chưa ai chọn gì là không gửi đi đâu cả. Hàng đợi vẫn
 * tích lại trong lúc tắt, bật lên là đẩy tiếp.
 */
export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  enabled: false,
  serverUrl: DEFAULT_SERVER_URL,
  userId: DEFAULT_USER_ID,
};

export async function loadSyncSettings(): Promise<SyncSettings> {
  const raw = await getDefaultDbProvider().getItem(STORAGE_KEY_SETTINGS);
  if (!raw) return { ...DEFAULT_SYNC_SETTINGS };
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SYNC_SETTINGS };
  const stored = parsed as Record<string, unknown>;
  return {
    enabled: stored.enabled === true,
    serverUrl:
      typeof stored.serverUrl === 'string' && stored.serverUrl.length > 0
        ? stored.serverUrl
        : DEFAULT_SERVER_URL,
    userId:
      typeof stored.userId === 'string' && stored.userId.length > 0
        ? stored.userId
        : DEFAULT_USER_ID,
  };
}

export async function saveSyncSettings(settings: SyncSettings): Promise<void> {
  await getDefaultDbProvider().setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

export async function loadWatermark(key: string): Promise<string | null> {
  const raw = await getDefaultDbProvider().getItem(key);
  return raw && raw.length > 0 ? raw : null;
}

export async function saveWatermark(key: string, value: string): Promise<void> {
  await getDefaultDbProvider().setItem(key, value);
}
