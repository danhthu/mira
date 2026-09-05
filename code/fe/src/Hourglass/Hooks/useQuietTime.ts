/**
 * Giới nghiêm buổi tối và ngày trắng, đọc được từ bất kỳ màn nào.
 *
 * Đây là hook mà màn Hôm nay dùng để im bớt trong giờ giới nghiêm và trong ngày
 * trắng: `reason` khác `null` nghĩa là đang trong khoảng yên tĩnh, kèm lý do để màn
 * hình nói đúng câu. Hook tự đếm lại mỗi phút nên khoảng giới nghiêm bắt đầu ngay
 * cả khi người dùng đang mở màn hình.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_QUIET_TIME,
  QuietReason,
  QuietTimeSettings,
  quietReasonAt,
} from '../Models/quietTime';
import {
  loadHourglassState,
  onHourglassStoreChanged,
  updateQuietTime,
} from '../Models/store';

const TICK_MS = 60000;

export interface QuietTimeView {
  readonly settings: QuietTimeSettings;
  readonly reason: QuietReason | null;
  readonly isQuiet: boolean;
  /** Trong lúc nạp, màn hình chưa biết cấu hình thật — chưa vẽ con số nào. */
  readonly loading: boolean;
  readonly update: (patch: Partial<QuietTimeSettings>) => void;
}

export function useQuietTime(): QuietTimeView {
  const [settings, setSettings] = useState<QuietTimeSettings>(DEFAULT_QUIET_TIME);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    const read = () => {
      loadHourglassState().then((state) => {
        if (!alive) return;
        setSettings(state.quietTime);
        setLoading(false);
      });
    };
    read();
    const stopListening = onHourglassStoreChanged(read);
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => {
      alive = false;
      stopListening();
      clearInterval(timer);
    };
  }, []);

  const update = useCallback((patch: Partial<QuietTimeSettings>) => {
    updateQuietTime(patch);
  }, []);

  const reason = loading ? null : quietReasonAt(settings, now);
  return { settings, reason, isQuiet: reason !== null, loading, update };
}
