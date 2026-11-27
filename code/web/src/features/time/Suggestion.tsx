import { useState } from 'react';
import { BUCKET_LABEL_VI, type TimeEntry, type TimeEntryCreate, type TimeBucket } from '@mira/contract';
import { minutes as fmtMinutes } from '../../lib/format';
import { GOLDEN_HOURS } from '../../lib/features';

/**
 * Gợi ý ghi một chạm.
 *
 * Trong mô phỏng 300 persona, giảm ma sát ghi là đòn bẩy mạnh thứ hai: giữ chân tuần 26
 * từ 27% lên 39%, và giờ lấy lại tăng 39%. Lý do đơn giản đến mức dễ bỏ qua: người ta bỏ
 * app không phải vì app vô ích, mà vì mỗi tối phải chọn nhóm, gõ số, bấm thêm.
 *
 * Cách làm: nhìn lại cùng thứ trong tuần ở những tuần trước. Thứ tư nào bạn cũng ghi 8h
 * công việc thì thứ tư này hỏi luôn, bạn bấm một cái là xong.
 *
 * KHÔNG TỰ GHI HỘ. Gợi ý là gợi ý. Mira đoán sai mà tự ghi thì số trong app thành số của
 * Mira chứ không còn là số của bạn, và một cuốn nhật ký như vậy thì đọc lại làm gì.
 */
export interface SuggestionData {
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  /** Đã thấy nếp này mấy lần. Dưới ngưỡng thì không gợi ý, vì một lần không phải nếp. */
  readonly lan: number;
}

const MINIMUM = 2;

/**
 * Tìm nếp của đúng thứ hôm nay trong tuần. Nhận vào các mục đã ghi của vài tuần trước.
 *
 * Làm tròn số phút về bội của 15 trước khi đếm: 7h55 và 8h05 là cùng một nếp, để nguyên
 * thì chúng thành hai nếp khác nhau và chẳng cái nào đủ số lần.
 */
export function findRoutine(entries: readonly TimeEntry[], homNay: string): SuggestionData | null {
  const thu = (ngay: string) => new Date(`${ngay}T00:00:00Z`).getUTCDay();
  const thuNay = thu(homNay);

  const dem = new Map<string, { data: SuggestionData; lan: number }>();
  for (const e of entries) {
    if (e.date === homNay || thu(e.date) !== thuNay) continue;
    const lamTron = Math.max(15, Math.round(e.minutes / 15) * 15);
    const khoa = `${e.bucket}|${lamTron}|${e.golden ? 'v' : ''}`;
    const cu = dem.get(khoa);
    if (cu === undefined) {
      dem.set(khoa, {
        data: { bucket: e.bucket, minutes: lamTron, golden: e.golden, lan: 1 },
        lan: 1,
      });
    } else {
      cu.lan += 1;
    }
  }

  let tot: { data: SuggestionData; lan: number } | null = null;
  for (const v of dem.values()) if (tot === null || v.lan > tot.lan) tot = v;
  if (tot === null || tot.lan < MINIMUM) return null;
  return { ...tot.data, lan: tot.lan };
}

export function Suggestion({
  nep,
  onSave,
  onDismiss,
}: {
  readonly nep: SuggestionData;
  readonly onSave: (entry: TimeEntryCreate) => Promise<void>;
  readonly onDismiss: () => void;
}) {
  const [saving, setDangGhi] = useState(false);

  return (
    <div className="goiy">
      <div className="goiy__k">THỨ NÀY BẠN HAY GHI</div>
      <div className="goiy__d">
        {fmtMinutes(nep.minutes)} {BUCKET_LABEL_VI[nep.bucket].toLowerCase()}
        {GOLDEN_HOURS && nep.golden ? ', giờ vàng' : ''}
      </div>
      <div className="goiy__n">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setDangGhi(true);
            void onSave({
              date: new Date().toISOString().slice(0, 10),
              minutes: nep.minutes,
              bucket: nep.bucket,
              golden: nep.golden,
            }).finally(() => setDangGhi(false));
          }}
        >
          {saving ? 'Đang ghi…' : 'Đúng rồi'}
        </button>
        <button type="button" onClick={onDismiss}>
          Hôm nay khác
        </button>
      </div>
    </div>
  );
}
