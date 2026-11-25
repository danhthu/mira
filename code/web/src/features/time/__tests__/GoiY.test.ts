/**
 * Kiểm phần dò nếp của gợi ý một chạm.
 *
 * Đây là đòn bẩy +39% trong mô phỏng 300 persona, và cũng là chỗ duy nhất trong giao diện
 * có logic đoán. Đoán sai thì tệ hơn không đoán: người dùng bấm "Đúng rồi" theo quán tính
 * và dữ liệu của họ thành dữ liệu Mira bịa ra.
 */
import { describe, it, expect } from 'vitest';
import type { TimeEntry } from '@mira/contract';
import { timNep } from '../GoiY';

/** 2026-11-25 là thứ tư. Các thứ tư trước: 18, 11, 04. Thứ năm: 19, 12. */
const HOM_NAY = '2026-11-25';

let dem = 0;
const muc = (date: string, minutes: number, bucket: TimeEntry['bucket'], golden = false): TimeEntry => ({
  id: `e${(dem += 1)}`,
  date,
  minutes,
  bucket,
  golden,
  note: null,
  source: 'manual',
  nepId: null,
});

describe('timNep', () => {
  it('không gợi ý khi chỉ thấy một lần', () => {
    expect(timNep([muc('2026-11-18', 480, 'work')], HOM_NAY)).toBeNull();
  });

  it('gợi ý khi cùng thứ lặp lại hai lần', () => {
    const nep = timNep([muc('2026-11-18', 480, 'work'), muc('2026-11-11', 480, 'work')], HOM_NAY);
    expect(nep).not.toBeNull();
    expect(nep?.bucket).toBe('work');
    expect(nep?.minutes).toBe(480);
    expect(nep?.lan).toBe(2);
  });

  it('bỏ qua các thứ khác trong tuần', () => {
    // Thứ năm ghi ba lần, thứ tư chỉ một: không đủ nếp cho thứ tư.
    const nep = timNep(
      [
        muc('2026-11-19', 120, 'family'),
        muc('2026-11-12', 120, 'family'),
        muc('2026-11-05', 120, 'family'),
        muc('2026-11-18', 480, 'work'),
      ],
      HOM_NAY,
    );
    expect(nep).toBeNull();
  });

  it('gộp các lần lệch nhau dưới 15 phút thành một nếp', () => {
    // 7h55 và 8h05 là cùng một nếp. Để nguyên thì thành hai nếp, mỗi nếp một lần,
    // và không nếp nào đủ ngưỡng — đúng lúc nếp rõ nhất thì lại im.
    const nep = timNep([muc('2026-11-18', 475, 'work'), muc('2026-11-11', 485, 'work')], HOM_NAY);
    expect(nep?.lan).toBe(2);
    expect(nep?.minutes).toBe(480);
  });

  it('chọn nếp xuất hiện nhiều lần nhất khi có nhiều nếp', () => {
    const nep = timNep(
      [
        muc('2026-11-18', 480, 'work'),
        muc('2026-11-11', 480, 'work'),
        muc('2026-11-04', 480, 'work'),
        muc('2026-11-18', 60, 'waste'),
        muc('2026-11-11', 60, 'waste'),
      ],
      HOM_NAY,
    );
    expect(nep?.bucket).toBe('work');
    expect(nep?.lan).toBe(3);
  });

  it('không lấy chính hôm nay làm bằng chứng cho nếp của hôm nay', () => {
    const nep = timNep([muc(HOM_NAY, 480, 'work'), muc('2026-11-18', 480, 'work')], HOM_NAY);
    expect(nep).toBeNull();
  });

  it('giữ giờ vàng như một phần của nếp', () => {
    const nep = timNep(
      [muc('2026-11-18', 120, 'family', true), muc('2026-11-11', 120, 'family', true)],
      HOM_NAY,
    );
    expect(nep?.golden).toBe(true);
  });

  it('giờ vàng và không giờ vàng là hai nếp khác nhau', () => {
    const nep = timNep(
      [muc('2026-11-18', 120, 'family', true), muc('2026-11-11', 120, 'family', false)],
      HOM_NAY,
    );
    expect(nep).toBeNull();
  });

  it('không có gì để nhìn thì không gợi ý', () => {
    expect(timNep([], HOM_NAY)).toBeNull();
  });
});
