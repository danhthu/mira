/**
 * Kiểm hàng phím tắt ghi nhanh.
 *
 * Phím tắt ghi **thẳng** vào nhật ký khi chạm, nên nó phải đúng: sai số phút ở đây là
 * sai mỗi ngày, lặng lẽ, và người dùng chỉ phát hiện khi tổng tuần đã lệch.
 */
import { describe, it, expect } from 'vitest';
import { goiYNhanh, TOI_DA_GOI } from '../goiY';
import type { TimeEntry } from '@mira/contract';

let dem = 0;
const muc = (p: Partial<TimeEntry> & { minutes: number; date: string }): TimeEntry => ({
  id: `e${(dem += 1)}`,
  date: p.date,
  minutes: p.minutes,
  bucket: p.bucket ?? 'work',
  golden: p.golden ?? false,
  note: p.note ?? null,
  danhMucId: p.danhMucId ?? null,
  nepId: p.nepId ?? null,
  source: p.source ?? 'manual',
});

/** n mục giống nhau, mỗi mục một ngày lùi dần. */
const lap = (n: number, p: Partial<TimeEntry> & { minutes: number }, tuNgay = 25): TimeEntry[] =>
  Array.from({ length: n }, (_, i) => muc({ ...p, date: `2026-11-${String(tuNgay - i).padStart(2, '0')}` }));

describe('goiYNhanh', () => {
  it('rút việc hay ghi nhất lên trước', () => {
    const r = goiYNhanh([
      ...lap(5, { note: 'Giờ làm việc', minutes: 480 }),
      ...lap(2, { note: 'Ăn tối', minutes: 30, bucket: 'personal' }),
    ]);
    expect(r.map((g) => g.nhan)).toEqual(['Giờ làm việc', 'Ăn tối']);
  });

  it('⚑ số phút lấy MODE, không lấy trung bình', () => {
    // "Ăn tối" 30 phút suốt, một hôm 45. Trung bình ra 33 — một con số chưa từng xảy ra,
    // và chạm vào phím là ghi sai mỗi lần.
    const r = goiYNhanh([
      ...lap(4, { note: 'Ăn tối', minutes: 30 }),
      ...lap(1, { note: 'Ăn tối', minutes: 45 }, 20),
    ]);
    expect(r[0]?.minutes).toBe(30);
  });

  it('⚑ ghi một lần thì CHƯA thành phím tắt', () => {
    // Một lần ghi lẻ không phải thói quen. Đưa lên phím tắt là mời người ta ghi lại một
    // việc họ làm đúng một lần.
    expect(goiYNhanh(lap(1, { note: 'Đi khám răng', minutes: 60 }))).toHaveLength(0);
    expect(goiYNhanh(lap(2, { note: 'Đi khám răng', minutes: 60 }))).toHaveLength(1);
  });

  it('giữ nguyên ô và cờ giờ vàng của mục gốc', () => {
    const r = goiYNhanh(lap(3, { note: 'Chơi với con', minutes: 60, bucket: 'family', golden: true }));
    expect(r[0]).toMatchObject({ bucket: 'family', golden: true });
  });

  it('mục theo danh mục gom theo danh mục, không theo ghi chú', () => {
    const r = goiYNhanh([
      ...lap(2, { note: 'ghi chú lần một', minutes: 60, danhMucId: 'dm-1' }),
      ...lap(2, { note: 'ghi chú khác hẳn', minutes: 60, danhMucId: 'dm-1' }, 20),
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ danhMucId: 'dm-1', soLan: 4 });
  });

  it('bỏ qua mục không tên và không danh mục', () => {
    // Không có gì để in lên phím thì phím đó là một ô trống bấm được.
    expect(goiYNhanh(lap(5, { note: null, minutes: 60 }))).toHaveLength(0);
    expect(goiYNhanh(lap(5, { note: '   ', minutes: 60 }))).toHaveLength(0);
  });

  it('không vượt quá số phím tối đa', () => {
    const nhieu = Array.from({ length: 12 }, (_, i) => lap(3, { note: `Việc ${i}`, minutes: 60 })).flat();
    expect(goiYNhanh(nhieu).length).toBeLessThanOrEqual(TOI_DA_GOI);
  });

  it('hoà số lần thì cái ghi gần đây hơn lên trước', () => {
    const r = goiYNhanh([
      ...lap(2, { note: 'Cũ', minutes: 60 }, 12),
      ...lap(2, { note: 'Mới', minutes: 60 }, 25),
    ]);
    expect(r[0]?.nhan).toBe('Mới');
  });

  it('nhật ký rỗng thì không có phím nào', () => {
    expect(goiYNhanh([])).toEqual([]);
  });
});
