import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kho của module vẫn là khoá `tradingData` trong `AsyncStorage`, **không** đưa
 * qua `Common/Repositories`.
 *
 * Lý do: `Repository<T>` lưu một mảng thực thể có `id`, còn dữ liệu đang nằm
 * trên máy người dùng là một đối tượng ba mảng phẳng. Chuyển sang repository là
 * một lần viết lại kho mà nếu đứt giữa chừng thì mất lịch sử thật — trong khi
 * đổi lại chỉ được sự nhất quán về hình thức. Giữ nguyên khoá và hình dạng, và
 * **ghi lại nguyên vẹn mọi khoá lạ** đọc được: hai mảng `goalAchievedDays` /
 * `nonGoalDays` của bản cũ không còn được dùng để hiển thị nhưng vẫn nằm yên
 * trong kho, nên đợt sau còn đường chuyển đổi. Xem HANDOFF.md.
 */
const STORAGE_KEY = 'tradingData';

export const DEFAULT_GAP_MINUTES = 30;

export type TradingData = {
  /** Mốc thời gian từng lần mở bảng giá, dạng ISO. */
  viewTimes: string[]
  gapMinutes: number
};

/** Khoá của bản cũ mà bản này không đọc tới — giữ lại y nguyên khi ghi. */
type StoredShape = Record<string, unknown>;

function toIsoList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => new Date(item as string | number).getTime())
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => a - b)
    .map((time) => new Date(time).toISOString());
}

function toGapMinutes(raw: StoredShape): number {
  if (typeof raw.gapMinutes === 'number' && raw.gapMinutes > 0) {
    return Math.round(raw.gapMinutes);
  }
  // Bản cũ lưu mục tiêu bằng giây trong `goalTimeLimit`.
  if (typeof raw.goalTimeLimit === 'number' && raw.goalTimeLimit > 0) {
    return Math.round(raw.goalTimeLimit / 60);
  }
  return DEFAULT_GAP_MINUTES;
}

export async function loadTradingData(): Promise<TradingData> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return { viewTimes: [], gapMinutes: DEFAULT_GAP_MINUTES };
  const raw = JSON.parse(stored) as StoredShape;
  return {
    viewTimes: toIsoList(raw.viewTimes),
    gapMinutes: toGapMinutes(raw),
  };
}

export async function saveTradingData(data: TradingData): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const previous = stored ? (JSON.parse(stored) as StoredShape) : {};
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...previous,
      viewTimes: data.viewTimes,
      gapMinutes: data.gapMinutes,
    }),
  );
}
